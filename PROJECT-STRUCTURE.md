# Project Structure

```
wa-flow-builder/
│
├── frontend/                      # React + React Flow frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx       # Draggable node palette
│   │   │   ├── Topbar.tsx        # Action buttons (Save, Load, etc.)
│   │   │   └── NodeEditorPanel.tsx  # Right panel for editing nodes
│   │   │
│   │   ├── nodes/
│   │   │   ├── StartNode.tsx     # Green start node
│   │   │   ├── PlainMessageNode.tsx   # Blue text message node
│   │   │   └── ButtonMessageNode.tsx  # Purple button node
│   │   │
│   │   ├── utils/
│   │   │   └── flowExportImport.ts    # JSON export/import logic
│   │   │
│   │   ├── App.tsx               # Main flow builder component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Tailwind styles
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                       # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts             # MongoDB connection
│   │   │
│   │   ├── models/
│   │   │   ├── Flow.ts           # Flow schema (nodes + edges)
│   │   │   └── Session.ts        # User session schema
│   │   │
│   │   ├── routes/
│   │   │   ├── flowRoutes.ts     # Save/load flow endpoints
│   │   │   ├── webhookRoutes.ts  # WhatsApp webhook handlers
│   │   │   └── testRoutes.ts     # Manual test trigger
│   │   │
│   │   ├── whatsapp/
│   │   │   ├── sendText.ts       # Send plain text message
│   │   │   └── sendButtons.ts    # Send interactive buttons
│   │   │
│   │   ├── engine/
│   │   │   └── flowExecutor.ts   # Flow execution logic
│   │   │
│   │   └── server.ts             # Express app entry point
│   │
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── README.md                 # Main documentation
│   ├── SETUP.md                  # Detailed setup guide
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── QUICK-REFERENCE.md        # Quick command reference
│   └── PROJECT-STRUCTURE.md      # This file
│
├── example-flow.json             # Sample flow for testing
├── test-setup.js                 # Setup verification script
├── package.json                  # Root workspace config
└── .gitignore

```

## File Descriptions

### Frontend Components

**Sidebar.tsx**
- Displays draggable node types
- Handles drag start events
- Simple, clean UI with icons

**Topbar.tsx**
- Action buttons for flow management
- Save, Load, Export, Import, Test
- Consistent button styling

**NodeEditorPanel.tsx**
- Right panel that appears when node is selected
- Edit message text
- Add/remove/edit buttons (for button nodes)
- Save changes back to node

### Frontend Nodes

**StartNode.tsx**
- Green node, always present
- Single output handle
- Non-editable

**PlainMessageNode.tsx**
- Blue node for text messages
- Shows message preview
- Single input, single output

**ButtonMessageNode.tsx**
- Purple node for interactive buttons
- Shows button list
- Single input, multiple outputs (one per button)
- Dynamic handle positioning

### Backend Routes

**flowRoutes.ts**
- `POST /api/flow/save` - Persist flow to MongoDB
- `GET /api/flow` - Retrieve saved flow
- Handles default flow name

**webhookRoutes.ts**
- `GET /webhook` - Webhook verification (Meta requirement)
- `POST /webhook` - Receive WhatsApp messages
- Handles text messages and button clicks
- Triggers flow execution

**testRoutes.ts**
- `POST /api/test-run` - Manual flow trigger
- Useful for testing without WhatsApp
- Accepts phone number in request body

### Backend WhatsApp Integration

**sendText.ts**
- Sends plain text messages via WhatsApp Cloud API
- Handles API authentication
- Error logging

**sendButtons.ts**
- Sends interactive button messages
- Formats buttons according to WhatsApp API spec
- Max 3 buttons enforced

### Backend Engine

**flowExecutor.ts**
- Core flow execution logic
- `startFlow()` - Initialize flow from Start node
- `executeNode()` - Execute single node
- `handleButtonClick()` - Resume flow after button click
- Session management
- Recursive execution for plain messages
- Pause/resume for button messages

### Backend Models

**Flow.ts**
- MongoDB schema for flows
- Stores nodes and edges arrays
- Single flow named "default"
- Timestamp tracking

**Session.ts**
- MongoDB schema for user sessions
- Tracks current node
- Waiting state for buttons
- One session per phone number

## Data Flow

### 1. Flow Creation
```
User drags node → Drop on canvas → Node added to state
User connects nodes → Edge created
User clicks node → Editor panel opens
User edits → Node data updated
User clicks Save → POST to /api/flow/save → Saved in MongoDB
```

### 2. Flow Execution
```
WhatsApp message "hi" → POST to /webhook
→ startFlow(phone)
→ Find Start node
→ Execute first connected node
→ If plain: send & continue
→ If button: send & pause
→ Save session state
```

### 3. Button Click
```
User clicks button → POST to /webhook
→ Extract button ID
→ Load session
→ Find edge with matching sourceHandle
→ Continue execution from target node
→ Update session
```

## Key Design Decisions

### Why Single Page?
- Simplicity for prototype
- Focus on core functionality
- Easy to understand and modify

### Why Two Node Types?
- Covers 90% of bot use cases
- Simple mental model
- Easy to extend later

### Why MongoDB?
- Flexible schema for nodes/edges
- Easy session management
- Good for prototyping
- Can scale to production

### Why React Flow?
- Built for node-based editors
- Handles drag & drop
- Edge routing automatic
- Customizable nodes

### Why TypeScript?
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

## Extension Points

### Add New Node Types
1. Create node component in `frontend/src/nodes/`
2. Add to `nodeTypes` in `App.tsx`
3. Add to sidebar in `Sidebar.tsx`
4. Handle in `flowExecutor.ts`

### Add New Features
- **Analytics**: Track node visits, button clicks
- **A/B Testing**: Multiple flow versions
- **Conditions**: Branch based on user data
- **Variables**: Store user responses
- **Integrations**: CRM, payment, etc.

### Scale for Production
- **Multi-tenancy**: Add user/org models
- **Redis**: Session management at scale
- **Queue**: Message processing (Bull, RabbitMQ)
- **Monitoring**: Sentry, DataDog
- **Rate Limiting**: Prevent abuse
- **Caching**: Flow caching for performance

## Testing Strategy

### Manual Testing
1. Create flow in UI
2. Save to MongoDB
3. Verify in database
4. Send WhatsApp message
5. Check backend logs
6. Verify messages received
7. Test button clicks
8. Verify flow continues

### Automated Testing (Future)
- Unit tests for execution engine
- Integration tests for API endpoints
- E2E tests for flow execution
- Mock WhatsApp API responses

## Deployment Checklist

### Backend
- [ ] Set environment variables
- [ ] Configure MongoDB connection
- [ ] Enable HTTPS
- [ ] Set up domain/subdomain
- [ ] Configure webhook in Meta
- [ ] Add error monitoring
- [ ] Set up logging
- [ ] Add rate limiting

### Frontend
- [ ] Update API_URL to production
- [ ] Build production bundle
- [ ] Deploy to CDN/hosting
- [ ] Configure CORS
- [ ] Add analytics (optional)

### WhatsApp
- [ ] Get permanent access token
- [ ] Complete business verification
- [ ] Add production phone number
- [ ] Test with real users
- [ ] Monitor message delivery

## Maintenance

### Regular Tasks
- Monitor error logs
- Check message delivery rates
- Update dependencies
- Backup MongoDB
- Review session cleanup
- Check API rate limits

### Updates
- WhatsApp API version updates
- Security patches
- Feature additions
- Bug fixes
- Performance optimization
