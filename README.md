# 🤖 DocuMind AI - AI PDF Chatbot

**Chat with your PDFs using AI!** Upload any PDF document and ask questions about it in natural language. The AI will answer based only on the content of your uploaded PDF.

---

## ✨ Features

- 📄 **Upload PDFs** - Drag & drop or click to upload
- 💬 **Chat with AI** - Ask questions about your PDF in natural language
- 🧠 **Smart AI Tools**:
  - 📝 Document Summary
  - 🔑 Keyword Extraction
  - 📌 Important Points
  - 🎯 Quiz Generation
  - 🃏 Flashcard Creation
- 🎨 **Beautiful UI** - Modern dark theme with glassmorphism effects
- 🔐 **Secure** - JWT authentication with encrypted passwords
- ⚡ **Fast** - No database needed, runs entirely in-memory

---

## 🚀 How to Run This Project

### **Step 1: Install Node.js** (if not already installed)

1. Go to: https://nodejs.org
2. Download the **LTS version** (recommended)
3. Install it (just click Next → Next → Finish)
4. **IMPORTANT**: Restart your computer after installation

### **Step 2: Run the Application**

1. **Double-click** the `START.bat` file in this folder
2. Wait for 2 windows to open (Backend and Frontend)
3. Your browser will automatically open to http://localhost:5173

That's it! 🎉

---

## 📖 How to Use

### **First Time Setup:**

1. Click **"Get Started"** on the landing page
2. Click **"Sign Up"** to create an account
3. Enter your name, email, and password
4. Click **"Create Account"**

### **Upload a PDF:**

1. After logging in, you'll see the Dashboard
2. Click **"Upload PDF"** or drag & drop a PDF file
3. Wait for the PDF to process (usually 10-30 seconds)
4. You'll see a green "Completed" status when ready

### **Chat with Your PDF:**

1. Click on your uploaded PDF card
2. Type your question in the chat box at the bottom
3. Press Enter or click Send
4. The AI will answer based on your PDF content!

### **Use AI Tools:**

1. While chatting, click the **"AI Tools"** button (top right)
2. Choose from:
   - **Summary** - Get a quick overview of the document
   - **Keywords** - Extract important terms
   - **Important Points** - Key takeaways
   - **Quiz** - Test your knowledge
   - **Flashcards** - Study cards for memorization

---

## 🛠️ Technical Details

### **Tech Stack:**

**Frontend:**
- React.js + Vite
- Tailwind CSS (styling)
- Zustand (state management)
- Framer Motion (animations)

**Backend:**
- Node.js + Express.js
- In-memory storage (no database needed)
- JWT authentication
- PDF parsing with pdf-parse

**AI:**
- OpenRouter API (free tier)
- NVIDIA Nemotron 70B model
- Simple keyword-based chunk retrieval

### **Project Structure:**

```
AI pdf chatbot/
├── backend/
│   ├── server.js          # Main backend file (all routes & logic)
│   ├── .env               # Environment variables (API keys)
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Uploaded PDF files
├── frontend/
│   ├── src/
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Chat
│   │   ├── components/    # Reusable UI components
│   │   ├── store/         # Zustand state management
│   │   └── utils/         # API client
│   ├── index.html
│   └── package.json       # Frontend dependencies
├── START.bat              # Easy startup script
└── README.md              # This file
```

---

## 🔧 Troubleshooting

### **Problem: "Node.js is NOT installed"**

**Solution:**
1. Download Node.js from https://nodejs.org
2. Install it
3. **Restart your computer**
4. Run `START.bat` again

### **Problem: "Port 5000 or 5173 already in use"**

**Solution:**
1. Close any other applications using these ports
2. Or restart your computer
3. Run `START.bat` again

### **Problem: "AI error" or "API error"**

**Solution:**
- The OpenRouter API key might have expired
- Check the `.env` file in the `backend` folder
- Make sure `OPENROUTER_API_KEY` is set correctly

### **Problem: PDF not processing**

**Solution:**
1. Make sure the PDF is not corrupted
2. Try a smaller PDF (under 10MB)
3. Wait at least 30 seconds for processing
4. Refresh the page and check again

### **Problem: Browser doesn't open automatically**

**Solution:**
- Manually open your browser
- Go to: http://localhost:5173

---

## 🎯 Example Questions to Ask

After uploading a PDF, try asking:

- "What is this document about?"
- "Summarize the main points"
- "What are the key findings?"
- "Explain [specific topic] from the document"
- "What does the author say about [topic]?"
- "List all the important dates mentioned"
- "What are the conclusions?"

---

## 📝 Notes

- **No Database Required** - Everything runs in-memory for simplicity
- **Free AI** - Uses OpenRouter's free tier (no credit card needed)
- **Privacy** - All data is stored locally on your computer
- **Restart = Reset** - When you close the backend window, all data is cleared

---

## 🎨 UI Design

The interface features:
- Dark mode with glassmorphism effects
- Neon blue & purple gradients
- Smooth animations
- Modern ChatGPT-style chat interface
- Responsive design (works on mobile too!)

---

## 📧 Support

If you encounter any issues:

1. Make sure Node.js is installed and you've restarted your computer
2. Check that both backend and frontend windows are running
3. Try closing everything and running `START.bat` again
4. Make sure no antivirus is blocking the application

---

## 🚀 Deployment (Optional)

To deploy this project online:

**Frontend:** Deploy to Vercel
**Backend:** Deploy to Render or Railway

Note: You'll need to switch from in-memory storage to a real database (MongoDB) for production use.

---

## 📄 License

This project is for educational purposes. Feel free to modify and use it as you like!

---

**Made with ❤️ using React, Node.js, and AI**
