# 🎙️ VoxStudy AI

**The Voice-First Adaptive Tutor** — An AI-powered study companion that lets you learn through natural conversation.

Built with **Google Cloud (Gemini AI)** and **ElevenLabs** for the AI Partner Catalyst Hackathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🎯 Challenge: ElevenLabs

> *"Use ElevenLabs and Google Cloud AI to make your app conversational, intelligent, and voice-driven."*

VoxStudy enables users to **interact entirely through speech** — ask questions, get explanations, take quizzes — all with their voice.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗣️ **Voice-to-Voice Conversation** | Speak naturally and get spoken responses powered by ElevenLabs |
| 🤖 **Adaptive AI Tutor** | Google Gemini provides intelligent, contextual responses |
| 📚 **Multiple Study Modes** | Tutor Mode, Quiz Master, Explain Like I'm 5 |
| 🎧 **Hands-Free Learning** | Study while walking, cooking, or resting your eyes |
| 💬 **Context Memory** | AI remembers previous questions for continuous dialogue |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     USER (Browser)                           │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ Voice Input     │───►│ ElevenLabs SDK  │                 │
│  │ (Microphone)    │    │ (Conversation)  │                 │
│  └─────────────────┘    └────────┬────────┘                 │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD RUN (Backend)                      │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ Express Server  │───►│ Gemini AI       │                 │
│  │ (Orchestrator)  │    │ (gemini-2.5-flash)│               │
│  └────────┬────────┘    └─────────────────┘                 │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ ElevenLabs TTS  │                                        │
│  │ (Streaming)     │                                        │
│  └─────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express |
| **AI** | Google Gemini (via @google/genai) |
| **Voice** | ElevenLabs (@elevenlabs/react) |
| **Hosting** | Google Cloud Run |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud account
- ElevenLabs account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/voxstudy-ai.git
cd voxstudy-ai

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```env
API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
ELEVENLABS_AGENT_ID=your_agent_id  # For Conversational Mode
```

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

---

## ☁️ Deploy to Google Cloud Run

```bash
# Build and push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT/voxstudy-ai

# Deploy
gcloud run deploy voxstudy-ai \
  --image gcr.io/YOUR_PROJECT/voxstudy-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars API_KEY=xxx,ELEVENLABS_API_KEY=xxx
```

---

## 🚀 Alternative: Deploy to Render (Free)

1. **Connect GitHub**: Log in to [Render](https://render.com) and click **New +** -> **Blueprint**.
2. **Connect Repo**: Select your `voxstudy-ai` repository.
3. **Configure**: Render will automatically detect `render.yaml`.
4. **Environment Variables**: Add your API keys in the Render dashboard for the service.
5. **Deploy**: Click **Apply**!

---

## 📹 Demo Video

[Watch on YouTube](#) *(Link to 3-min demo)*

---

## 🏆 Hackathon Submission

- **Challenge**: ElevenLabs
- **Team**: Sengwamana Emeran
- **Live URL**: [https://voxstudy-ai-xxx.run.app](#)
- **Repository**: [GitHub](#)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)
