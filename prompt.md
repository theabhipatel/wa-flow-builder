````md
# ✅ Prompt: Build WhatsApp Bot Flow Builder Prototype (React Flow + Node.js + MongoDB + WhatsApp Cloud API)

You are a **Senior Full Stack Developer**. Build a **simple but real working prototype** of a **WhatsApp Bot Flow Builder**.

## 🎯 Main Goal (Very Clear)
I want **ONLY ONE SINGLE PAGE APPLICATION** where I can:

✅ Drag & drop nodes  
✅ Connect nodes using edges  
✅ Build WhatsApp bot flows visually  
✅ Save flow in MongoDB  
✅ Run the flow in **REAL WhatsApp** (Meta WhatsApp Cloud API)  

This is NOT just a UI. It must be a **working WhatsApp bot prototype**.

No extra features, no auth, no multi-page dashboard.  
Just **one page flow builder + real WhatsApp execution**.

---

# 🧱 Tech Stack (Strict)

## Frontend
- React + TypeScript
- React Flow
- Tailwind CSS
- shadcn/ui

## Backend
- Node.js + Express
- TypeScript
- WhatsApp Cloud API integration (Meta)

## Database
- MongoDB + Mongoose (for persistence)

---

# 🧩 Flow Builder Requirements

## Node Types (ONLY TWO)
### 1. Plain Message Node
- Contains only message text
- Automatically continues to the next node

### 2. Message With Buttons Node
- Contains message text + 1 to 3 buttons
- Flow pauses here until user selects a button
- After button selection, continue the flow from the selected button branch

---

# 🟢 Start Node (Entry Point)
- Start node must always exist
- Has only 1 output handle
- The flow starts from the node connected to Start node

Flow starts when WhatsApp user sends:
- "hi"
- "hello"
- "start"

---

# 🎨 UI Layout (Single Page Only)

The page must have:

## Top Header Bar
Buttons:
- Save Flow
- Load Flow
- Export JSON
- Import JSON
- Run Test (send flow to WhatsApp manually)

## Left Sidebar
Draggable nodes:
- Plain Message Node
- Button Message Node

## Center Canvas
React Flow canvas where nodes are dropped and connected.

## Right Panel (Node Editor)
When user clicks a node:
- show editor
- allow editing node message
- allow editing buttons (if button node)
- allow add/remove buttons (max 3)

Use Tailwind + shadcn components:
- Card
- Button
- Input
- Textarea

---

# 🧷 Node Handle Rules

## Plain Message Node Handles
- Input handle (top)
- Output handle (bottom)

## Button Message Node Handles
- Input handle (top)
- Multiple output handles (bottom)
- Each button must map to a unique output handle

Example buttons:
- Buy
- Support

Handles must be:
- buy_btn
- support_btn

Edges must support `sourceHandle`.

---

# 📌 Flow Execution Logic (Critical)

## Rule A: Plain Message Node
- Send WhatsApp text message
- Automatically continue to the next connected node
- Continue until reaching a button node or flow ends

## Rule B: Button Message Node
- Send WhatsApp interactive message (buttons)
- STOP execution here
- Wait for user response
- Once user clicks a button, continue from that selected button’s outgoing edge

---

# 📲 WhatsApp Cloud API Requirements

## Plain Message Format
Send as WhatsApp Cloud API `text` message.

## Button Message Format
Send as WhatsApp Cloud API `interactive` message:

- type: "button"
- max 3 buttons
- each button must have unique id

Use official Meta WhatsApp Cloud API JSON format.

---

# 🏗 Backend Responsibilities

## Required Endpoints

### 1. Webhook verification (Meta requirement)
`GET /webhook?hub.verify_token=...`

### 2. Webhook receiver
`POST /webhook`

This will receive:
- user messages like "hi"
- interactive button click replies

### 3. Save Flow
`POST /api/flow/save`

### 4. Load Flow
`GET /api/flow`

### 5. Run Test Flow Manually
`POST /api/test-run`

Payload:
```json
{ "phone": "919999999999" }
````

---

# 🗄 MongoDB Persistence (Must Use)

Store the flow in MongoDB using Mongoose.

## MongoDB Collection: flows

Example schema:

```ts
{
  name: "default",
  nodes: [...],
  edges: [...],
  updatedAt: Date
}
```

Only one flow is required for prototype (store as `"default"`).

---

# 🧾 Flow JSON Structure

## Plain Node Example

```json
{
  "id": "node-1",
  "type": "plainMessage",
  "data": {
    "message": "Welcome to our bot!"
  }
}
```

## Button Node Example

```json
{
  "id": "node-2",
  "type": "buttonMessage",
  "data": {
    "message": "Choose an option",
    "buttons": [
      { "id": "buy_btn", "title": "Buy" },
      { "id": "support_btn", "title": "Support" }
    ]
  }
}
```

## Edge Example

```json
{
  "id": "e1-2",
  "source": "node-1",
  "target": "node-2",
  "sourceHandle": null
}
```

For button node branching:

```json
{
  "id": "e2-buy",
  "source": "node-2",
  "sourceHandle": "buy_btn",
  "target": "node-3"
}
```

---

# 🧠 Runtime Session Engine (Very Important)

Backend must maintain user session state in MongoDB  (flow must persist in MongoDB).

## Session State Structure

```ts
type SessionState = {
  phone: string;
  currentNodeId: string | null;
  waitingForButton: boolean;
  waitingNodeId?: string;
  updatedAt: Date;
};
```

Store session state in MongoDB for reliability.

---

# ▶️ Execution Engine Algorithm

## startFlow(phone)

* load flow JSON from MongoDB
* find Start node
* follow outgoing edge to first node
* execute sequentially until:

  * no next node exists OR
  * button node is reached

## executeNode(nodeId, phone)

### if Plain Message Node:

* send WhatsApp text message
* find next node from outgoing edge
* execute next node

### if Button Message Node:

* send WhatsApp interactive button message
* save session:

  * waitingForButton = true
  * waitingNodeId = current node id
* STOP execution

---

# 🟦 Button Click Handling

When webhook receives interactive reply:

* detect button id clicked (example: "buy_btn")
* load session for that phone
* get waitingNodeId
* find outgoing edge from waitingNodeId where:

  * `sourceHandle === clickedButtonId`
* continue execution from edge.target

After continuing:

* update session waitingForButton = false

---

# 🧪 WhatsApp Trigger Rules

If user sends:

* "hi"
* "hello"
* "start"

Then backend should:

* reset session state
* start flow from Start node

---

# ⚙️ Environment Variables (.env)

Backend must use `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp_flow_builder

WHATSAPP_TOKEN=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx
VERIFY_TOKEN=my_verify_token
```

---

# 📁 Recommended Project Structure

## Frontend

```
frontend/
  src/
    components/
      Sidebar.tsx
      Topbar.tsx
      NodeEditorPanel.tsx
    nodes/
      StartNode.tsx
      PlainMessageNode.tsx
      ButtonMessageNode.tsx
    pages/
      FlowBuilderPage.tsx
    utils/
      flowExportImport.ts
```

## Backend

```
backend/
  src/
    server.ts
    config/
      db.ts
    models/
      Flow.ts
      Session.ts
    routes/
      flowRoutes.ts
      webhookRoutes.ts
    whatsapp/
      sendText.ts
      sendButtons.ts
    engine/
      flowExecutor.ts
```

---

# 🚀 Deliverables (Must Be Working)

The final prototype must support:

✅ Drag & drop flow builder UI
✅ Connect nodes using edges
✅ Edit node messages and buttons
✅ Save flow in MongoDB
✅ Load flow from MongoDB
✅ Export/import JSON
✅ Real WhatsApp Cloud API webhook support
✅ Real flow execution engine
✅ Auto-run plain message nodes
✅ Pause at button nodes
✅ Continue flow based on selected button branch
✅ Support multiple WhatsApp users using sessions

---

# 📌 Final Real World WhatsApp Example Behavior

Flow:
Start -> Plain Message -> Plain Message -> Button Node -> Branch -> Plain -> End

Expected WhatsApp behavior:

1. User sends: "hi"
2. Bot sends message 1
3. Bot sends message 2
4. Bot sends message with buttons (pauses)
5. User clicks button "Buy"
6. Bot continues flow connected to Buy button
7. Flow continues until end

---

# ⚠️ Important Constraints

* Only TWO node types (Plain + Button)
* Single page application only
* Must be compatible with WhatsApp Cloud API
* Must use MongoDB for persistence
* Must be a real working prototype (not fake UI)

---
# Build it as a real-world usable prototype, not a demo diagram tool.

CIRTICAL: don't create any documentation or change log files not even a .md or .txt file completely 