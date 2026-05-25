# 🚀 SuiDrive Quick Start

Get SuiDrive running in 5 minutes!

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Get API Keys

### Tatum API Key (Required)
1. Go to https://dashboard.tatum.io/
2. Sign up for free account
3. Create new API key
4. Copy the key

### AI Provider Key (Required - Choose One)

**Option A: NVIDIA NIM (Recommended)**
1. Go to https://build.nvidia.com/
2. Sign up for free account
3. Get API key
4. Copy the key

**Option B: OpenRouter (Fallback)**
1. Go to https://openrouter.ai/
2. Sign up for account
3. Add credits ($5 minimum)
4. Get API key

---

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Minimum required configuration:**

```env
# Tatum (Required)
TATUM_API_KEY=your_tatum_key_here
TATUM_TESTNET=true

# AI Provider (Choose one)
NVIDIA_API_KEY=your_nvidia_key_here
# OR
OPENROUTER_API_KEY=your_openrouter_key_here

# Walrus (defaults work for testnet)
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui
SUI_NETWORK=testnet
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 5: Test Upload

1. Go to http://localhost:3000/upload
2. Enter a test Sui wallet address (e.g., `0x1234...`)
3. Select a small text file
4. Click "Upload to SuiDrive"

**Expected behavior:**
- ✅ File uploads to Walrus
- ⚠️ Blockchain recording shows "Move contract not yet deployed" (Phase 2)
- ✅ AI analysis generates summary (if text file)

---

## 🎯 Current Status

### ✅ Working Now
- Walrus file upload
- AI file analysis
- Upload UI
- Dashboard UI
- Home page

### ⏳ Coming in Phase 2
- Sui blockchain integration
- Move contract deployment
- Real wallet connection (zkLogin)
- Version history retrieval

---

## 🐛 Troubleshooting

### "Failed to upload to Walrus"
- Check internet connection
- Verify Walrus testnet is online: https://walrus-testnet.walrus.space/
- Try a smaller file (< 1MB for testing)

### "No AI provider configured"
- Make sure you set either `NVIDIA_API_KEY` or `OPENROUTER_API_KEY`
- Check the key is valid
- Restart dev server after changing .env.local

### "Tatum API error"
- Verify your Tatum API key is correct
- Check you have API credits
- Make sure `TATUM_TESTNET=true` is set

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📖 Next Steps

1. **Read the docs:**
   - `TECHNICAL.md` — Full technical specification
   - `DEVELOPMENT.md` — Development roadmap
   - `README.md` — Project overview

2. **Start Phase 2:**
   - Deploy Sui Move contracts
   - Implement blockchain integration
   - Connect real wallet

3. **Join the community:**
   - Report issues
   - Suggest features
   - Contribute code

---

## 🎉 You're Ready!

SuiDrive is now running locally. Start uploading files and exploring the immutable file history protocol!

**Need help?** Check the troubleshooting section or open an issue.

---

Happy building! 🚀
