# WhatsApp Flow Builder - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- WhatsApp Business Account with Cloud API access

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: MongoDB Setup

### Option A: Local MongoDB
```bash
# Install MongoDB locally and start it
mongod --dbpath /path/to/data
```

### Option B: MongoDB Atlas
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Use it in backend .env

## Step 3: WhatsApp Cloud API Setup

### 1. Create Meta Developer Account
- Go to https://developers.facebook.com/
- Create an account or login

### 2. Create WhatsApp Business App
- Go to "My Apps" → "Create App"
- Select "Business" type
- Name your app

### 3. Add WhatsApp Product
- In your app dashboard, click "Add Product"
- Select "WhatsApp" → "Set Up"

### 4. Get Credentials
- Go to WhatsApp → Getting Started
- Copy your:
  - **Temporary Access Token** (WHATSAPP_TOKEN)
  - **Phone Number ID** (WHATSAPP_PHONE_NUMBER_ID)
  - **Test Phone Number** (for testing)

### 5. Add Test Phone Number
- In "Getting Started", add your phone number
- You'll receive a verification code on WhatsApp
- Enter the code to verify

## Step 4: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp_flow_builder

# Your WhatsApp credentials
WHATSAPP_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
VERIFY_TOKEN=my_verify_token_123
```

## Step 5: Setup Webhook (for Production)

### Option A: Using ngrok (for testing)
```bash
# Install ngrok
npm install -g ngrok

# Start backend first
npm run dev:backend

# In another terminal, expose port 5000
ngrok http 5000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Option B: Deploy to Production
Deploy backend to Heroku, Railway, or any cloud provider.

### Configure Webhook in Meta
1. Go to WhatsApp → Configuration
2. Click "Edit" on Webhook
3. Enter:
   - **Callback URL**: `https://your-domain.com/webhook`
   - **Verify Token**: Same as in your .env (e.g., `my_verify_token_123`)
4. Click "Verify and Save"
5. Subscribe to webhook fields:
   - messages
   - message_status (optional)

## Step 6: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will open at: http://localhost:3000

## Step 7: Test the Flow

### Create a Simple Flow
1. Drag "Plain Message" node to canvas
2. Connect Start node to Plain Message node
3. Click Plain Message node to edit
4. Enter message: "Welcome to our bot!"
5. Drag "Button Message" node
6. Connect Plain Message to Button Message
7. Edit Button Message:
   - Message: "What would you like to do?"
   - Buttons: "Buy", "Support"
8. Add more Plain Message nodes
9. Connect each button to different nodes
10. Click "Save Flow"

### Test on WhatsApp
1. Click "Run Test" button
2. Enter your phone number (with country code, no + or spaces)
   - Example: 919999999999 (for +91 9999999999)
3. Check your WhatsApp
4. Send "hi", "hello", or "start" to trigger the flow

## Troubleshooting

### Webhook not receiving messages
- Check ngrok is running
- Verify webhook URL in Meta dashboard
- Check verify token matches
- Look at backend console for errors

### Messages not sending
- Verify WHATSAPP_TOKEN is valid (tokens expire after 24 hours in test mode)
- Check WHATSAPP_PHONE_NUMBER_ID is correct
- Ensure phone number is verified in Meta dashboard
- Check backend logs for API errors

### MongoDB connection error
- Ensure MongoDB is running
- Check MONGO_URI is correct
- For Atlas, ensure IP is whitelisted

### Flow not executing
- Check flow is saved in MongoDB
- Verify Start node exists
- Ensure nodes are properly connected
- Check backend console for execution logs

## Production Considerations

### 1. Get Permanent Access Token
- Temporary tokens expire after 24 hours
- Create a System User in Meta Business Manager
- Generate permanent token

### 2. Verify Business
- Complete business verification in Meta
- Required for production use

### 3. Add Phone Number
- Add your own WhatsApp Business phone number
- Test number only works for verified test users

### 4. Scale MongoDB
- Use MongoDB Atlas for production
- Enable authentication
- Set up backups

### 5. Deploy Backend
- Use environment variables
- Enable HTTPS
- Set up monitoring
- Add rate limiting

## API Endpoints

### Flow Management
- `POST /api/flow/save` - Save flow
- `GET /api/flow` - Load flow

### WhatsApp Webhook
- `GET /webhook` - Webhook verification
- `POST /webhook` - Receive messages

### Testing
- `POST /api/test-run` - Manually trigger flow
  ```json
  { "phone": "919999999999" }
  ```

## Flow Execution Logic

1. User sends "hi", "hello", or "start"
2. Backend resets session
3. Finds Start node
4. Executes connected nodes sequentially
5. Plain Message nodes: Send and continue
6. Button Message nodes: Send and wait
7. User clicks button
8. Backend continues from selected branch
9. Repeat until flow ends

## Support

For issues:
- Check backend console logs
- Check browser console
- Verify all credentials
- Test with simple flow first
- Check Meta API status
