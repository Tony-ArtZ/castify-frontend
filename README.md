# Castify - AI Podcast Creation Platform

Built by Team Neurocraft for the MIT Hackathon, Castify is an advanced AI-powered podcast creation platform that transforms text into engaging multi-speaker audio content.

## Project Overview

Castify leverages cutting-edge AI to revolutionize podcast creation:

- **AI-Generated Conversations**: Create natural-sounding podcasts with multiple distinct voices from simple text prompts
- **PDF Content Analysis**: Upload PDF documents and our system will extract and analyze the content to create relevant podcasts
- **Text Embeddings**: Utilizes OpenAI embeddings for semantic understanding and intelligent content recommendations
- **Smart Recommendations**: Discover related podcasts through our sophisticated embedding-based recommendation system

## Key Technical Features

### 1. Multi-Speaker Voice Synthesis
The platform uses the latest TTS (Text-to-Speech) models to generate natural-sounding conversations between multiple AI speakers, creating dynamic and engaging podcast content.

### 2. PDF Processing Pipeline
- Upload PDF documents
- Extract and process text content
- Enhance prompts with document context
- Generate topic-appropriate podcast conversations

### 3. Advanced AI Integration
- OpenAI GPT-4o for conversation generation
- Embedding models for semantic understanding
- Voice synthesis for natural-sounding audio

### 4. Recommendation System
Our embedding-based recommendation engine analyzes podcast content to suggest similar topics based on semantic similarity rather than just keywords.

## Getting Started

### Prerequisites
- Node.js 16.0 or later
- An OpenAI API key for AI functionality
- Environment variables configured (see Configuration section)

### Installation

```bash
# Clone the repository
git clone https://github.com/neurocraft/mit-spotify.git
cd mit-spotify

# Install dependencies
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=your_database_connection_string
```

## Team Neurocraft

Built with passion for the MIT Hackathon by Team Neurocraft, a group of developers, AI specialists, and UX designers committed to pushing the boundaries of AI-assisted content creation.
