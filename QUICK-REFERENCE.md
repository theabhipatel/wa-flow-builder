# Quick Reference Guide

## Common Commands

```bash
# Install backend
cd backend && npm install

# Install frontend
cd frontend && npm install

# Run backend (port 5000)
cd backend && npm run dev

# Run frontend (port 3000)
cd frontend && npm run dev

# Build for production
cd frontend && npm run build
cd backend && npm run build
```

## Environment Variables

```env
# Backend (.env)
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp_flow_builder
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
VERIFY_TOKEN=my_verify_token
```

## Trigger Words

Send these to WhatsApp to start the flow:
- `hi`
- `hello`
- `start`

## Node Types Quick Guide

| Node Type | Purpose | Behavior | Handles |
|-----------|---------|----------|---------|
| Start | Entry point | Always exists | 1 output |
| Plain Message | Send text | Auto-continue | 1 in, 1 out |
| Button Message | Send buttons | Wait for click | 1 in, multiple out |

## Flow Execution Rules

1. **Plain Message Node**
   - Sends WhatsApp text
   - Immediately continues to next node
   - Keeps going until button node or end

2. **Button Message Node**
   - Sends WhatsApp interactive buttons
   - STOPS execution
   - Waits for user to click
   - Continues from selected button's path

## API Quick Reference

### Save Flow
```bash
POST http://localhost:5000/api/flow/save
Content-Type: application/json

{
  "nodes": [...],
  "edges": [...]
}
```

### Load Flow
```bash
GET http://localhost:5000/api/flow
```

### Test Run
```bash
POST http://localhost:5000/api/test-run
Content-Type: application/json

{
  "phone": "919999999999"
}
```

### Webhook Verification
```bash
GET http://localhost:5000/webhook?hub.mode=subscribe&hub.verify_token=my_verify_token&hub.challenge=test
```

## Phone Number Format

Always use country code without + or spaces:
- ✅ Correct: `919999999999` (India)
- ✅ Correct: `14155551234` (USA)
- ❌ Wrong: `+91 9999999999`
- ❌ Wrong: `9999999999`

## Button Configuration

```typescript
{
  "id": "unique_btn_id",  // Used for routing
  "title": "Button Text"  // Shown to user (max 20 chars)
}
```

Max 3 buttons per message.

## Edge Configuration

### Plain Message Edge
```json
{
  "source": "node-1",
  "target": "node-2",
  "sourceHandle": null
}
```

### Button Edge
```json
{
  "source": "button-node",
  "target": "next-node",
  "sourceHandle": "buy_btn"  // Must match button id
}
```

## Session State

```typescript
{
  phone: "919999999999",
  currentNodeId: "node-2",
  waitingForButton: true,
  waitingNodeId: "node-2",
  updatedAt: Date
}
```

## Webhook Payload Examples

### Text Message Received
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919999999999",
          "type": "text",
          "text": { "body": "hi" }
        }]
      }
    }]
  }]
}
```

### Button Click Received
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919999999999",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": {
              "id": "buy_btn",
              "title": "Buy"
            }
          }
        }]
      }
    }]
  }]
}
```

## Troubleshooting Checklist

### Messages not sending?
- [ ] Check WHATSAPP_TOKEN is valid
- [ ] Verify WHATSAPP_PHONE_NUMBER_ID
- [ ] Ensure phone number is verified in Meta
- [ ] Check backend logs for errors

### Webhook not working?
- [ ] Verify webhook URL is accessible
- [ ] Check VERIFY_TOKEN matches
- [ ] Ensure ngrok is running (if using)
- [ ] Check webhook is subscribed to 'messages'

### Flow not executing?
- [ ] Verify flow is saved in MongoDB
- [ ] Check Start node exists
- [ ] Ensure nodes are connected
- [ ] Look at backend console logs

### MongoDB connection failed?
- [ ] Check MongoDB is running
- [ ] Verify MONGO_URI is correct
- [ ] For Atlas, check IP whitelist

## Testing Workflow

1. Create simple flow (Start → Plain → Button → Plain)
2. Save flow
3. Check MongoDB has the flow
4. Send "hi" to WhatsApp
5. Check backend logs
6. Verify messages received
7. Click button
8. Verify flow continues

## Production Deployment

### Backend (Heroku example)
```bash
heroku create your-app-name
heroku addons:create mongolab
heroku config:set WHATSAPP_TOKEN=xxx
heroku config:set WHATSAPP_PHONE_NUMBER_ID=xxx
heroku config:set VERIFY_TOKEN=xxx
git push heroku main
```

### Frontend (Vercel example)
```bash
cd frontend
vercel --prod
```

Update frontend API_URL to point to production backend.

## Useful MongoDB Queries

```javascript
// View saved flow
db.flows.findOne({ name: "default" })

// View all sessions
db.sessions.find()

// Clear all sessions
db.sessions.deleteMany({})

// Delete flow
db.flows.deleteOne({ name: "default" })
```

## Meta Developer Console Links

- Dashboard: https://developers.facebook.com/apps
- WhatsApp Getting Started: Your App → WhatsApp → Getting Started
- Webhook Configuration: Your App → WhatsApp → Configuration
- API Documentation: https://developers.facebook.com/docs/whatsapp

## Support Resources

- WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- React Flow Docs: https://reactflow.dev
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
