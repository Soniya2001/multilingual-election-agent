# CivicGuide AI: Multilingual Election Assistant

CivicGuide AI is a multi-agent AI web application designed to guide users through the election process with personalized, step-by-step instructions.

## Features
- **Multi-Agent Architecture**: Modular agents for intent, personalization, knowledge, and more.
- **Multilingual Support**: Supports English, Tamil, and Hindi.
- **Voice Interaction**: Integrated text-to-speech for accessible guidance.
- **Personalized Flow**: Adapts instructions based on user location and status (e.g., first-time voter).
- **Error-Resilient Architecture**: Implemented a robust fallback mechanism using Gemini 2.0 Flash to gracefully handle model availability inconsistencies across environments, ensuring uninterrupted agent responses.

## Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3 (Glassmorphism design).
- **Backend**: Node.js, Express.
- **Styling**: Vanilla CSS with modern aesthetics.

## Getting Started
1. Run `npm install` to install dependencies.
2. Run `npm start` to start the backend server.
3. Open `frontend/index.html` in your browser (or serve it via the backend).

## Project Structure
- `/backend`: Contains server logic and autonomous agents.
- `/frontend`: Contains the UI and component logic.
- `/data`: Sample election data for India.
