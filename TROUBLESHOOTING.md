# Troubleshooting Guide

## Common Issues and Solutions

### 1. Dependencies Won't Install

**Problem:** `npm install` fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules in backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Delete node_modules in frontend
cd ../frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Check Node version:**
```bash
node --version  # Should be 18+
```

---

### 2. MongoDB Connection Failed

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**

**For Local MongoDB:**
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl status mongod
```

**For MongoDB Atlas:**
- Check connection string is correct
- Verify IP address is whitelisted (or use 0.0.0.0/0 for testing)
- Check username/password are correct
- Ensure network access is configured

**Test connection:**
```bash
# Using mongosh
mongosh "mongodb://localhost:27017/whatsapp_flow_builder"
```

---

### 3. WhatsApp Messages Not Sending

**Problem:** Flow executes but no WhatsApp messages received

**Check 1: Token Validity**
```bash
# Test token with curl
curl -X GET "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"
```

If error: Token expired (test tokens expire after 24 hours)
- Go to Meta Developer Console
- WhatsApp → Getting Started
- Copy new temporary token
- Update backend/.env

**Check 2: Phone Number ID**
```bash
# Verify phone number ID
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID?access_token=YOUR_TOKEN"
```

**Check 3: Phone Number Verified**
- Go to Meta Developer Console
- WhatsApp → Getting Started
- Ensure your phone is in "To" field and verified

**Check 4: Backend Logs**
```bash
# Look for errors in backend console
# Should see: "Text sent to..." or "Buttons sent to..."
```

---

### 4. Webhook Not Receiving Messages

**Problem:** Send message to WhatsApp but webhook not triggered

**Check 1: Webhook URL Accessible**
```bash
# Test webhook verification
curl "http://your-domain.com/webhook?hub.mode=subscribe&hub.verify_token=my_verify_token&hub.challenge=test"

# Should return: test
```

**Check 2: ngrok Running (if using)**
```bash
# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Restart ngrok if needed
ngrok http 5000
```

**Check 3: Webhook Configured in Meta**
- Go to WhatsApp → Configuration
- Verify Callback URL is correct
- Verify Verify Token matches .env
- Check "messages" is subscribed

**Check 4: Backend Running**
```bash
# Backend should be running on port 5000
curl http://localhost:5000
# Should return: {"message":"WhatsApp Flow Builder API"}
```

**Check 5: Webhook Logs**
```bash
# Backend should log incoming webhooks
# Look for: "Webhook verified" or webhook POST logs
```

---

### 5. Flow Not Executing

**Problem:** Webhook receives message but flow doesn't run

**Check 1: Flow Saved**
```bash
# Check MongoDB
mongosh
use whatsapp_flow_builder
db.flows.findOne({ name: "default" })
```

Should return flow with nodes and edges.

**Check 2: Start Node Exists**
```javascript
// In MongoDB
db.flows.findOne({ name: "default" }).nodes.find(n => n.type === "start")
```

**Check 3: Nodes Connected**
- Verify Start node has outgoing edge
- Check all nodes are properly connected
- Look for orphaned nodes

**Check 4: Backend Logs**
```bash
# Should see execution logs:
# "Text sent to..."
# "Buttons sent to..."
# "Waiting for button click"
```

**Check 5: Trigger Words**
- Only "hi", "hello", "start" trigger flow
- Case insensitive
- Must be exact match (no extra text)

---

### 6. Button Clicks Not Working

**Problem:** Buttons appear but clicking doesn't continue flow

**Check 1: Button IDs Match**
```javascript
// In flow JSON, button node:
{
  "data": {
    "buttons": [
      { "id": "buy_btn", "title": "Buy" }
    ]
  }
}

// Edge must have matching sourceHandle:
{
  "source": "button-node-id",
  "sourceHandle": "buy_btn",  // Must match button id
  "target": "next-node-id"
}
```

**Check 2: Session State**
```bash
# Check MongoDB
db.sessions.findOne({ phone: "919999999999" })
```

Should show:
- `waitingForButton: true`
- `waitingNodeId: "button-node-id"`

**Check 3: Webhook Receiving Clicks**
```bash
# Backend logs should show:
# Interactive button reply received
```

**Check 4: Edge Exists**
- Verify edge connects button node to next node
- Check sourceHandle matches button id
- Ensure target node exists

---

### 7. Frontend Won't Start

**Problem:** `npm run dev:frontend` fails

**Check 1: Port 3000 Available**
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Kill process if needed
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>
```

**Check 2: Dependencies Installed**
```bash
cd frontend
npm install
```

**Check 3: Node Modules**
```bash
# Delete and reinstall
rm -rf node_modules
npm install
```

---

### 8. Backend Won't Start

**Problem:** `npm run dev:backend` fails

**Check 1: Port 5000 Available**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**Check 2: .env File Exists**
```bash
cd backend
ls -la .env
# If not found: cp .env.example .env
```

**Check 3: Environment Variables**
```bash
# Check all required vars are set
cat backend/.env
```

**Check 4: TypeScript Compilation**
```bash
cd backend
npx tsc --noEmit
# Should show no errors
```

---

### 9. CORS Errors in Browser

**Problem:** Frontend can't connect to backend

**Solution:**
Backend already has CORS enabled. Check:

```typescript
// backend/src/server.ts
app.use(cors());  // Should be present
```

If still issues:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### 10. React Flow Not Rendering

**Problem:** Blank canvas or nodes not appearing

**Check 1: React Flow CSS**
```typescript
// App.tsx should import:
import 'reactflow/dist/style.css';
```

**Check 2: Container Height**
```typescript
// Wrapper div should have height
<div className="flex-1">  // flex-1 gives it height
  <ReactFlow ... />
</div>
```

**Check 3: Browser Console**
- Open DevTools (F12)
- Check for React errors
- Look for missing dependencies

---

### 11. Nodes Not Draggable

**Problem:** Can't drag nodes from sidebar

**Check:**
- `draggable` attribute on sidebar items
- `onDragStart` handler present
- `onDrop` and `onDragOver` on canvas

**Test:**
```typescript
// Sidebar.tsx
<div
  draggable  // Must be present
  onDragStart={(e) => onDragStart(e, 'plainMessage')}
>
```

---

### 12. Edges Not Connecting

**Problem:** Can't connect nodes

**Check 1: Handles Present**
```typescript
// Each node should have:
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
```

**Check 2: onConnect Handler**
```typescript
// App.tsx
const onConnect = useCallback(
  (params: Connection) => setEdges((eds) => addEdge(params, eds)),
  [setEdges]
);
```

---

### 13. Node Editor Not Opening

**Problem:** Click node but editor doesn't appear

**Check:**
```typescript
// App.tsx
const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
  setSelectedNode(node);
}, []);

// ReactFlow component
<ReactFlow
  onNodeClick={onNodeClick}  // Must be present
  ...
/>
```

---

### 14. Save/Load Not Working

**Problem:** Flow doesn't persist

**Check 1: Backend API**
```bash
# Test save
curl -X POST http://localhost:5000/api/flow/save \
  -H "Content-Type: application/json" \
  -d '{"nodes":[],"edges":[]}'

# Test load
curl http://localhost:5000/api/flow
```

**Check 2: MongoDB**
```bash
mongosh
use whatsapp_flow_builder
db.flows.find()
```

**Check 3: Frontend API URL**
```typescript
// App.tsx
const API_URL = 'http://localhost:5000';  // Check this
```

---

### 15. Export/Import Not Working

**Problem:** JSON export/import fails

**Check:**
```typescript
// utils/flowExportImport.ts should exist
// Check browser console for errors
// Verify file picker appears
```

**Manual Test:**
```javascript
// In browser console
const flow = { nodes: [], edges: [] };
const dataStr = JSON.stringify(flow);
console.log(dataStr);  // Should work
```

---

## Debug Mode

### Enable Verbose Logging

**Backend:**
```typescript
// server.ts - Add after imports
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

**Frontend:**
```typescript
// App.tsx - Add in component
useEffect(() => {
  console.log('Nodes:', nodes);
  console.log('Edges:', edges);
}, [nodes, edges]);
```

### MongoDB Queries

```javascript
// View all flows
db.flows.find().pretty()

// View all sessions
db.sessions.find().pretty()

// Clear sessions
db.sessions.deleteMany({})

// Delete flow
db.flows.deleteOne({ name: "default" })

// Count documents
db.flows.countDocuments()
db.sessions.countDocuments()
```

### Test WhatsApp API Directly

```bash
# Send test message
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919999999999",
    "type": "text",
    "text": { "body": "Test message" }
  }'
```

---

## Getting Help

### Check Logs
1. Backend console output
2. Frontend browser console (F12)
3. MongoDB logs
4. ngrok web interface (http://127.0.0.1:4040)

### Verify Setup
```bash
npm run test:setup
```

### Reset Everything
```bash
# Stop all processes
# Delete databases
mongosh
use whatsapp_flow_builder
db.dropDatabase()

# Reinstall
npm run install:all

# Reconfigure
cd backend
cp .env.example .env
# Edit .env

# Restart
npm run dev:backend
npm run dev:frontend
```

### Still Stuck?

1. Check Meta API Status: https://developers.facebook.com/status
2. Review WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp
3. Check GitHub issues (if applicable)
4. Review SETUP.md step by step
5. Test with minimal flow (Start → Plain Message)
