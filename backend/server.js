// ============================================================
//  DocuMind AI — Simple All-in-One Backend (No MongoDB needed)
//  Uses in-memory storage — works out of the box!
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'documind_secret_2024';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// ── In-Memory Stores ──────────────────────────────────────
const users = new Map();    // id -> user object
const pdfs  = new Map();    // id -> pdf object
const chats = new Map();    // id -> chat object

// ── AI Setup (OpenRouter) ─────────────────────────────────
const https = require('https');

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── File Upload Setup ─────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}.pdf`)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) =>
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files allowed')),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ── Auth Helper ───────────────────────────────────────────
const makeToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ── Text Chunking ─────────────────────────────────────────
function chunkText(text, size = 1500) {
  const chunks = [];
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > size && current) {
      chunks.push(current.trim());
      current = s + ' ';
    } else {
      current += s + ' ';
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 30);
}

// Simple keyword search to find relevant chunks (no embeddings needed)
function findRelevantChunks(chunks, question, topK = 5) {
  const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const scored = chunks.map((chunk, i) => {
    const lower = chunk.toLowerCase();
    const score = qWords.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
    return { chunk, score, index: i };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

// ── AI Helper (OpenRouter API) ────────
async function askAI(prompt) {
  if (!OPENROUTER_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set. Please add it to the .env file.');
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'DocuMind AI PDF Chatbot'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          console.log('OpenRouter Response Status:', res.statusCode);
          
          const json = JSON.parse(body);
          if (json.error) {
            console.error('OpenRouter API Error:', json.error);
            reject(new Error(json.error.message || 'OpenRouter API error'));
          } else if (json.choices && json.choices[0] && json.choices[0].message) {
            resolve(json.choices[0].message.content);
          } else {
            console.error('Invalid response format:', json);
            reject(new Error('Invalid response format from OpenRouter'));
          }
        } catch (e) {
          console.error('JSON Parse Error:', e.message);
          console.error('Response body:', body);
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// =============================================================
//  AUTH ROUTES
// =============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = [...users.values()].find(u => u.email === email);
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const user = { id, name, email, password: hashed, createdAt: new Date() };
    users.set(id, user);

    const { password: _, ...safeUser } = user;
    res.status(201).json({ success: true, data: { user: safeUser, token: makeToken(id) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = [...users.values()].find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, token: makeToken(user.id) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get current user
app.get('/api/auth/me', auth, (req, res) => {
  const user = users.get(req.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser } });
});

// =============================================================
//  PDF ROUTES
// =============================================================

// Upload PDF
app.post('/api/pdf/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const id = uuidv4();
    const pdf = {
      id,
      userId: req.userId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      processingStatus: 'processing',
      chunks: [],
      pageCount: 0,
      summary: null,
      keywords: [],
      importantPoints: [],
      createdAt: new Date()
    };
    pdfs.set(id, pdf);

    // Process in background
    processPDF(id);

    res.status(201).json({ success: true, data: { pdf: sanitizePDF(pdf) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

async function processPDF(pdfId) {
  const pdf = pdfs.get(pdfId);
  if (!pdf) return;
  try {
    const buffer = fs.readFileSync(pdf.filePath);
    const data = await pdfParse(buffer);
    const text = data.text.replace(/\s+/g, ' ').trim();
    const chunks = chunkText(text);

    pdf.extractedText = text;
    pdf.chunks = chunks;
    pdf.pageCount = data.numpages;
    pdf.chunkCount = chunks.length;

    // Generate AI insights
    const shortText = text.substring(0, 15000);
    try {
      const [summary, keywords, points] = await Promise.all([
        askAI(`Summarize this document in 3-4 sentences:\n\n${shortText}`),
        askAI(`List 10 important keywords from this document as a comma-separated list. Only output the keywords, nothing else:\n\n${shortText}`),
        askAI(`List 6 most important points from this document. Format as a numbered list:\n\n${shortText}`)
      ]);
      pdf.summary = summary;
      pdf.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
      pdf.importantPoints = points.split('\n').filter(p => p.trim()).slice(0, 8);
    } catch (aiErr) {
      console.error('AI insight error (non-critical):', aiErr.message);
    }

    pdf.processingStatus = 'completed';
    console.log(`✅ PDF processed: ${pdf.originalName} (${chunks.length} chunks)`);
  } catch (err) {
    pdf.processingStatus = 'failed';
    pdf.processingError = err.message;
    console.error('PDF processing failed:', err.message);
  }
}

function sanitizePDF(pdf) {
  const { extractedText, chunks, ...safe } = pdf;
  return safe;
}

// Get all PDFs for user
app.get('/api/pdf', auth, (req, res) => {
  const userPDFs = [...pdfs.values()]
    .filter(p => p.userId === req.userId)
    .map(sanitizePDF)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: { pdfs: userPDFs } });
});

// Get PDF status
app.get('/api/pdf/:id/status', auth, (req, res) => {
  const pdf = pdfs.get(req.params.id);
  if (!pdf || pdf.userId !== req.userId)
    return res.status(404).json({ success: false, message: 'PDF not found' });
  res.json({ success: true, data: {
    status: pdf.processingStatus,
    chunkCount: pdf.chunkCount,
    pageCount: pdf.pageCount,
    name: pdf.originalName
  }});
});

// Delete PDF
app.delete('/api/pdf/:id', auth, (req, res) => {
  const pdf = pdfs.get(req.params.id);
  if (!pdf || pdf.userId !== req.userId)
    return res.status(404).json({ success: false, message: 'PDF not found' });
  try { fs.unlinkSync(pdf.filePath); } catch {}
  pdfs.delete(req.params.id);
  res.json({ success: true, message: 'PDF deleted' });
});

// =============================================================
//  CHAT ROUTES
// =============================================================

// Create chat
app.post('/api/chat/create', auth, (req, res) => {
  const { pdfIds } = req.body;
  if (!pdfIds || !pdfIds.length)
    return res.status(400).json({ success: false, message: 'Select at least one PDF' });

  const validPDFs = pdfIds
    .map(id => pdfs.get(id))
    .filter(p => p && p.userId === req.userId && p.processingStatus === 'completed');

  if (!validPDFs.length)
    return res.status(400).json({ success: false, message: 'PDF not ready yet. Please wait for processing to complete.' });

  const id = uuidv4();
  const chat = {
    id,
    userId: req.userId,
    pdfIds: validPDFs.map(p => p.id),
    pdfNames: validPDFs.map(p => p.originalName),
    title: `Chat with ${validPDFs[0].originalName}`,
    messages: [],
    createdAt: new Date(),
    lastActivity: new Date()
  };
  chats.set(id, chat);
  res.status(201).json({ success: true, data: { chat } });
});

// Get all chats
app.get('/api/chat', auth, (req, res) => {
  const userChats = [...chats.values()]
    .filter(c => c.userId === req.userId)
    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  res.json({ success: true, data: { chats: userChats } });
});

// Get single chat
app.get('/api/chat/:id', auth, (req, res) => {
  const chat = chats.get(req.params.id);
  if (!chat || chat.userId !== req.userId)
    return res.status(404).json({ success: false, message: 'Chat not found' });
  res.json({ success: true, data: { chat } });
});

// Send message
app.post('/api/chat/:id/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'Message is empty' });

    const chat = chats.get(req.params.id);
    if (!chat || chat.userId !== req.userId)
      return res.status(404).json({ success: false, message: 'Chat not found' });

    // Gather chunks from all PDFs in this chat
    let allChunks = [];
    for (const pdfId of chat.pdfIds) {
      const pdf = pdfs.get(pdfId);
      if (pdf?.chunks) allChunks.push(...pdf.chunks);
    }

    // Find relevant chunks using keyword search
    const relevant = findRelevantChunks(allChunks, message, 5);
    const context = relevant.join('\n\n---\n\n');

    // Build conversation history (last 6 messages)
    const history = chat.messages.slice(-6)
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are an intelligent AI assistant that answers questions based ONLY on the provided PDF document content.

RULES:
- Answer ONLY from the provided context
- If the answer is not in the context, say: "This information is not available in the uploaded PDF."
- Be helpful, clear, and concise
- Use markdown formatting when helpful

${history ? `Previous conversation:\n${history}\n\n` : ''}Context from PDF:
${context}

Question: ${message}

Answer:`;

    const aiResponse = await askAI(prompt);

    // Save messages
    const userMsg = { id: uuidv4(), role: 'user', content: message, timestamp: new Date() };
    const aiMsg = { id: uuidv4(), role: 'assistant', content: aiResponse, timestamp: new Date() };

    chat.messages.push(userMsg, aiMsg);
    chat.lastActivity = new Date();

    // Auto-title from first message
    if (chat.messages.length === 2) {
      chat.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }

    res.json({ success: true, data: { message: aiResponse, chatId: chat.id } });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.status(500).json({ success: false, message: 'AI error: ' + e.message });
  }
});

// Delete chat
app.delete('/api/chat/:id', auth, (req, res) => {
  const chat = chats.get(req.params.id);
  if (!chat || chat.userId !== req.userId)
    return res.status(404).json({ success: false, message: 'Chat not found' });
  chats.delete(req.params.id);
  res.json({ success: true, message: 'Chat deleted' });
});

// =============================================================
//  AI TOOLS ROUTES
// =============================================================

app.get('/api/ai/summary/:pdfId', auth, async (req, res) => {
  try {
    const pdf = pdfs.get(req.params.pdfId);
    if (!pdf || pdf.userId !== req.userId || pdf.processingStatus !== 'completed')
      return res.status(404).json({ success: false, message: 'PDF not ready' });

    if (pdf.summary) return res.json({ success: true, data: { summary: pdf.summary } });

    const summary = await askAI(`Write a comprehensive summary of this document with key sections:\n\n${pdf.extractedText?.substring(0, 20000)}`);
    pdf.summary = summary;
    res.json({ success: true, data: { summary } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/ai/keywords/:pdfId', auth, async (req, res) => {
  try {
    const pdf = pdfs.get(req.params.pdfId);
    if (!pdf || pdf.userId !== req.userId || pdf.processingStatus !== 'completed')
      return res.status(404).json({ success: false, message: 'PDF not ready' });

    if (pdf.keywords?.length) return res.json({ success: true, data: { keywords: pdf.keywords } });

    const raw = await askAI(`Extract 15 important keywords from this document. Return ONLY a comma-separated list:\n\n${pdf.extractedText?.substring(0, 10000)}`);
    const keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
    pdf.keywords = keywords;
    res.json({ success: true, data: { keywords } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/ai/important-points/:pdfId', auth, async (req, res) => {
  try {
    const pdf = pdfs.get(req.params.pdfId);
    if (!pdf || pdf.userId !== req.userId || pdf.processingStatus !== 'completed')
      return res.status(404).json({ success: false, message: 'PDF not ready' });

    if (pdf.importantPoints?.length) return res.json({ success: true, data: { points: pdf.importantPoints } });

    const raw = await askAI(`List the 8 most important points from this document as a numbered list:\n\n${pdf.extractedText?.substring(0, 15000)}`);
    const points = raw.split('\n').filter(p => p.trim()).slice(0, 8);
    pdf.importantPoints = points;
    res.json({ success: true, data: { points } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/ai/quiz/:pdfId', auth, async (req, res) => {
  try {
    const pdf = pdfs.get(req.params.pdfId);
    if (!pdf || pdf.userId !== req.userId || pdf.processingStatus !== 'completed')
      return res.status(404).json({ success: false, message: 'PDF not ready' });

    const raw = await askAI(`Generate 5 multiple choice quiz questions from this document.
Return ONLY valid JSON array like this:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","explanation":"..."}]

Document:
${pdf.extractedText?.substring(0, 15000)}`);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const quiz = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    res.json({ success: true, data: { quiz } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/ai/flashcards/:pdfId', auth, async (req, res) => {
  try {
    const pdf = pdfs.get(req.params.pdfId);
    if (!pdf || pdf.userId !== req.userId || pdf.processingStatus !== 'completed')
      return res.status(404).json({ success: false, message: 'PDF not ready' });

    const raw = await askAI(`Generate 8 flashcards from this document.
Return ONLY valid JSON array like this:
[{"front":"Question or term","back":"Answer or definition"}]

Document:
${pdf.extractedText?.substring(0, 15000)}`);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const flashcards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    res.json({ success: true, data: { flashcards } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DocuMind AI is running!', users: users.size, pdfs: pdfs.size });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   DocuMind AI Backend Running!       ║
║   http://localhost:${PORT}              ║
║   OpenRouter API: ${OPENROUTER_KEY ? '✅ Connected' : '❌ MISSING'}    ║
║   Model: openrouter/auto (fallback) ║
╚══════════════════════════════════════╝
  `);
  if (!OPENROUTER_KEY) {
    console.error('⚠️  WARNING: OPENROUTER_API_KEY is not set in .env file!');
  }
});
