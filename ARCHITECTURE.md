# Architecture Overview

## System Components

### Frontend (React + React Flow)
- Single page application
- Visual flow builder with drag & drop
- Node editor panel
- Real-time flow visualization

### Backend (Node.js + Express)
- REST API for flow management
- WhatsApp Cloud API integration
- Flow execution engine
- Session management

### Database (MongoDB)
- Flow storage (nodes + edges)
- User session state
- Persistent across restarts

## Data Flow

### 1. Flow Creation
```
User → Drag Nodes → Connect Edges → Edit Properties → Save to MongoDB
```

### 2. Flow Execution
```
WhatsApp Message → Webhook → Session Check → Execute Node → Send WhatsApp → Update Session
```

### 3. Button Handling
```
Button Click → Webhook → Load Session → Find Edge → Continue Flow → Update Session
```

## Node Types

### Start Node
- Entry point (always exists)
- Single output handle
- Triggers on: "hi", "hello", "start"

### Plain Message Node
- Sends text message
- Auto-continues to next node
- Single input, single output

### Button Message Node
- Sends interactive buttons (max 3)
- Pauses execution
- Multiple outputs (one per button)
- Continues based on user selection

## Session State Machine

```
States:
- IDLE: No active flow
- EXECUTING: Running through plain messages
- WAITING: Paused at button node

Transitions:
- Trigger word → EXECUTING
- Plain message → EXECUTING (continue)
- Button message → WAITING
- Button click → EXECUTING (resume)
- Flow end → IDLE
```

## API Structure

### Flow Routes (`/api/flow`)
- `POST /save` - Persist flow to MongoDB
- `GET /` - Retrieve saved flow

### Webhook Routes (`/webhook`)
- `GET /` - Verification (Meta requirement)
- `POST /` - Receive messages and button clicks

### Test Routes (`/api/test-run`)
- `POST /` - Manually trigger flow for testing

## Execution Engine

### Algorithm
```typescript
function startFlow(phone) {
  resetSession(phone)
  startNode = findStartNode()
  firstNode = getConnectedNode(startNode)
  executeNode(firstNode, phone)
}

function executeNode(nodeId, phone) {
  node = getNode(nodeId)
  
  if (node.type === 'plainMessage') {
    sendText(phone, node.message)
    nextNode = getNextNode(nodeId)
    if (nextNode) executeNode(nextNode, phone)
  }
  
  if (node.type === 'buttonMessage') {
    sendButtons(phone, node.message, node.buttons)
    saveSession(phone, nodeId, WAITING)
    // Stop here
  }
}

function handleButtonClick(phone, buttonId) {
  session = getSession(phone)
  edge = findEdge(session.nodeId, buttonId)
  updateSession(phone, EXECUTING)
  executeNode(edge.target, phone)
}
```

## WhatsApp API Integration

### Text Message Format
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "text",
  "text": { "body": "Message text" }
}
```

### Interactive Button Format
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Message text" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_1", "title": "Button 1" } }
      ]
    }
  }
}
```

## Database Schema

### Flow Collection
```typescript
{
  name: "default",
  nodes: [
    {
      id: "node-1",
      type: "plainMessage",
      position: { x: 100, y: 100 },
      data: { message: "Hello" }
    }
  ],
  edges: [
    {
      id: "e1-2",
      source: "node-1",
      target: "node-2",
      sourceHandle: null
    }
  ],
  updatedAt: Date
}
```

### Session Collection
```typescript
{
  phone: "919999999999",
  currentNodeId: "node-2",
  waitingForButton: true,
  waitingNodeId: "node-2",
  updatedAt: Date
}
```

## Security Considerations

### Webhook Verification
- Verify token on GET request
- Validate signature (production)
- Rate limiting

### API Security
- CORS configuration
- Input validation
- Error handling
- Token expiration handling

## Scalability

### Current Limitations
- Single flow per instance
- In-memory session (use Redis for scale)
- No user authentication
- No flow versioning

### Production Improvements
- Multi-tenant support
- Redis for session management
- Queue system for message processing
- Flow analytics and monitoring
- A/B testing support
- Conversation history
