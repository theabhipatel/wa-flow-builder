# WhatsApp Flow Builder

A visual flow builder for creating WhatsApp bot conversations using React Flow and WhatsApp Cloud API.

## Features

✅ Drag & drop visual flow builder  
✅ Two node types: Plain Message & Button Message  
✅ Real WhatsApp Cloud API integration  
✅ MongoDB persistence  
✅ Session management for multiple users  
✅ Export/Import flows as JSON  
✅ Real-time flow execution  

## Tech Stack

**Frontend:** React, TypeScript, React Flow, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript  
**Database:** MongoDB + Mongoose  
**API:** WhatsApp Cloud API (Meta)  

## Quick Start

**New to this project? Start here:** [GETTING-STARTED.md](GETTING-STARTED.md) - 5 minute setup guide

### 1. Install Backend
```bash
cd backend
npm install
```

### 2. Install Frontend
```bash
cd frontend
npm install
```

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with WhatsApp credentials
```

### 4. Run Backend
```bash
cd backend
npm run dev
```

### 5. Run Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 6. Build & Test
1. Open http://localhost:3000
2. Drag nodes and connect them
3. Click "Save Flow"
4. Click "Run Test" and enter your phone number
5. Check WhatsApp for messages!

**Full setup guide:** [SETUP.md](SETUP.md)

## Documentation

📚 **[Complete Documentation Index](DOCUMENTATION-INDEX.md)** - Find all guides and references

### Quick Links
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - 5 minute quick start guide
- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Fix common issues
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command cheat sheet
- **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Code organization
- **[FLOW-DIAGRAM.md](FLOW-DIAGRAM.md)** - Visual diagrams

## Detailed Setup

See [SETUP.md](SETUP.md) for complete setup instructions including:
- WhatsApp Cloud API configuration
- Webhook setup with ngrok
- Production deployment guide
- Troubleshooting tips

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details.

## Example Flow

Import `example-flow.json` to see a working example with:
- Welcome messages
- Button choices (Buy, Support, Info)
- Branching logic
- End message

## How It Works

1. **Build Flow:** Drag nodes, connect them, edit messages/buttons
2. **Save:** Flow stored in MongoDB
3. **Trigger:** User sends "hi", "hello", or "start" on WhatsApp
4. **Execute:** 
   - Plain messages send automatically and continue
   - Button messages pause and wait for user selection
   - Flow continues based on button clicked
5. **Session:** Each user has independent session state

## API Endpoints

- `POST /api/flow/save` - Save flow to database
- `GET /api/flow` - Load saved flow
- `POST /api/test-run` - Manually trigger flow (testing)
- `GET /webhook` - Webhook verification (Meta)
- `POST /webhook` - Receive WhatsApp messages

## Node Types

### Start Node
- Entry point (always present)
- Flow begins from connected node
- Triggered by: "hi", "hello", "start"

### Plain Message Node
- Sends text message
- Automatically continues to next node
- Use for: greetings, information, confirmations

### Button Message Node
- Sends interactive buttons (max 3)
- Pauses flow until user clicks
- Each button connects to different path
- Use for: choices, menus, options

## Production Checklist

- [ ] Get permanent WhatsApp access token
- [ ] Complete business verification
- [ ] Add production phone number
- [ ] Deploy backend with HTTPS
- [ ] Use MongoDB Atlas
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Enable error logging

## Limitations (Prototype)

- Single flow per instance (named "default")
- No user authentication
- No conversation history
- No analytics
- Temporary access token (24h expiry in test mode)

## License

MIT
