# Installation Guide

## Quick Install

### Step 1: Install Backend
```bash
cd backend
npm install
```

### Step 2: Install Frontend
```bash
cd frontend
npm install
```

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:
- MONGO_URI
- WHATSAPP_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- VERIFY_TOKEN

### Step 4: Run Backend
```bash
cd backend
npm run dev
```

### Step 5: Run Frontend (new terminal)
```bash
cd frontend
npm run dev
```

### Step 6: Open Browser
http://localhost:3000

## Verify Installation

```bash
node test-setup.js
```

## Troubleshooting

### If npm install fails:
```bash
# Clear cache
npm cache clean --force

# Try again
cd backend
npm install

cd ../frontend
npm install
```

### If you see ENOTEMPTY errors:
```bash
# Delete node_modules and try again
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## Next Steps

See [GETTING-STARTED.md](GETTING-STARTED.md) for complete setup guide.
