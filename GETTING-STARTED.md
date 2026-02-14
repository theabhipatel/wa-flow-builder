# Getting Started - 5 Minute Quick Start

This guide will get you up and running in 5 minutes with a working WhatsApp bot.

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- WhatsApp Business account (free)

## Step 1: Install (2 minutes)

```bash
# Navigate to project
cd wa-flow-builder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

## Step 2: Configure Backend (1 minute)

```bash
# Copy environment template
cd backend
cp .env.example .env
```

Edit `backend/.env` with your text editor:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp_flow_builder

# Get these from Meta Developer Console (next step)
WHATSAPP_TOKEN=paste_your_token_here
WHATSAPP_PHONE_NUMBER_ID=paste_your_phone_id_here
VERIFY_TOKEN=my_secret_token_123
```

## Step 3: Get WhatsApp Credentials (2 minutes)

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App" → Select "Business"
3. Add "WhatsApp" product
4. Go to "Getting Started" tab
5. Copy these values to your `.env`:
   - **Temporary access token** → `WHATSAPP_TOKEN`
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
6. Add your phone number in "To" field and verify it

## Step 4: Start Application (30 seconds)

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `Server running on port 5000` and `MongoDB connected`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Opens automatically at: http://localhost:3000

## Step 5: Create Your First Flow (1 minute)

1. **Drag** "Plain Message" node from left sidebar to canvas
2. **Connect** Start node (green) to Plain Message node
3. **Click** Plain Message node to edit
4. **Type** message: "Hello! Welcome to my bot 👋"
5. **Click** "Save Changes"
6. **Click** "Save Flow" button at top

## Step 6: Test Without Webhook (30 seconds)

1. Click "Run Test" button at top
2. Enter your phone number (with country code, no spaces)
   - Example: `919999999999` for +91 9999999999
3. Check your WhatsApp - you should receive the message!

## Step 7: Setup Webhook for Real Use (Optional)

For production use, set up webhook so users can trigger the bot:

### Using ngrok (easiest for testing):

```bash
# Install ngrok
npm install -g ngrok

# Expose backend (in new terminal)
ngrok http 5000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Configure in Meta:

1. Go to WhatsApp → Configuration
2. Click "Edit" on Webhook
3. Enter:
   - **Callback URL**: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: `my_secret_token_123` (from your .env)
4. Click "Verify and Save"
5. Subscribe to "messages"

### Test:

Send "hi", "hello", or "start" to your WhatsApp test number - bot will respond!

## Next Steps

### Create a More Complex Flow

1. **Add Button Message:**
   - Drag "Button Message" node
   - Connect Plain Message → Button Message
   - Edit to add buttons (e.g., "Buy", "Support")

2. **Add Branches:**
   - Drag more Plain Message nodes
   - Connect each button to different nodes
   - Create different conversation paths

3. **Save and Test:**
   - Click "Save Flow"
   - Send "hi" to WhatsApp
   - Click buttons to navigate flow

### Example Flow Structure

```
Start
  ↓
Plain: "Welcome!"
  ↓
Plain: "We offer great products"
  ↓
Button: "What interests you?"
  ├─ Buy → Plain: "Visit our shop..."
  ├─ Support → Plain: "Contact support..."
  └─ Info → Plain: "Learn more..."
```

## Common Issues

### "MongoDB connection error"
```bash
# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### "WhatsApp messages not sending"
- Check token hasn't expired (test tokens expire after 24h)
- Verify phone number is added in Meta console
- Check backend logs for errors

### "Webhook not working"
- Ensure ngrok is running
- Verify webhook URL in Meta matches ngrok URL
- Check verify token matches

## Verify Setup

Run the setup checker:
```bash
npm run test:setup
```

## Documentation

- **SETUP.md** - Detailed setup instructions
- **ARCHITECTURE.md** - How it works
- **TROUBLESHOOTING.md** - Fix common issues
- **QUICK-REFERENCE.md** - Command cheat sheet
- **PROJECT-STRUCTURE.md** - Code organization

## Example Flow

Import the example flow to see a complete working bot:

1. Click "Import JSON" button
2. Select `example-flow.json`
3. Click "Save Flow"
4. Test with WhatsApp!

## Tips

- **Start Simple:** Begin with just Start → Plain Message
- **Test Often:** Use "Run Test" button frequently
- **Check Logs:** Backend console shows execution details
- **Save Frequently:** Click "Save Flow" after changes
- **Export Backup:** Use "Export JSON" to backup your flow

## Production Checklist

Before going live:

- [ ] Get permanent access token (test tokens expire)
- [ ] Complete business verification in Meta
- [ ] Deploy backend to production server (Heroku, Railway, etc.)
- [ ] Use MongoDB Atlas instead of local
- [ ] Set up proper domain with HTTPS
- [ ] Configure production webhook URL
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Test thoroughly with real users

## Support

If you get stuck:

1. Check **TROUBLESHOOTING.md**
2. Review backend console logs
3. Check browser console (F12)
4. Verify all credentials are correct
5. Test with minimal flow first

## What You Built

You now have a working WhatsApp bot that:

✅ Responds to user messages  
✅ Sends text messages  
✅ Shows interactive buttons  
✅ Branches based on user choices  
✅ Handles multiple users simultaneously  
✅ Persists flows in database  
✅ Can be extended with more features  

## Next Features to Add

- Collect user information
- Integrate with your API
- Add conditions and logic
- Store conversation history
- Add analytics
- Multi-language support
- Rich media (images, videos)
- Payment integration

Happy building! 🚀
