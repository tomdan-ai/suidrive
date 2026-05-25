# SuiDrive — Immutable File History Protocol

**Permanent, verifiable file history for every type of file on the internet.**

Powered by **Walrus** + **Sui** + **Tatum** + **NVIDIA NIM**

---

## 🎯 What is SuiDrive?

SuiDrive is an immutable onchain file history protocol that preserves permanent, verifiable version history for any file type. Think "Git for normal users" — without the complexity.

Every upload creates a new immutable version. Nothing is overwritten. Nothing is lost.

### Core Features

- **📁 Immutable Uploads** — Files stored permanently on Walrus decentralized storage
- **🔗 Universal Version History** — Git-style timeline for all file types
- **🤖 AI Intelligence** — Powered by NVIDIA NIM + DeepSeek for file analysis
- **✓ Ownership Verification** — Cryptographic proof on Sui blockchain

---

## 🏗️ Architecture

```
CLIENT LAYER
Next.js 15 + Tailwind CSS
|
▼
SERVER ACTIONS + API ROUTES
|
▼
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
Walrus Storage   Tatum Sui RPC     NVIDIA NIM
(File Blobs)    (Onchain Metadata) (AI Analysis)
```

---

## 🚀 Development Phases

### ✅ Phase 1: Foundation & Infrastructure (COMPLETE)
- [x] Environment setup & configuration
- [x] Walrus client integration
- [x] Tatum Sui RPC client setup
- [x] AI analysis client (NVIDIA NIM + DeepSeek)
- [x] Core type definitions
- [x] Upload flow orchestration
- [x] Basic UI pages (Home, Upload, Dashboard)

### 🔄 Phase 2: Core Upload Flow (NEXT)
- [ ] Deploy Sui Move contracts
- [ ] Implement file object creation
- [ ] Implement version object creation
- [ ] Complete upload API integration
- [ ] Test end-to-end upload flow

### 📅 Phase 3: Version History & Timeline
- [ ] Version chain retrieval
- [ ] Timeline UI component
- [ ] Version navigation
- [ ] Restore functionality
- [ ] File history viewer

### 🤖 Phase 4: AI Intelligence Layer
- [ ] Enhanced file analysis
- [ ] Version comparison
- [ ] Change detection
- [ ] Insights generation

### 🎨 Phase 5: Dashboard & Verification
- [ ] User dashboard with file list
- [ ] Public verification portal
- [ ] Ownership verification
- [ ] Polish & UX refinements

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS, TypeScript |
| Storage | Walrus (Decentralized) |
| Blockchain | Sui |
| RPC Infrastructure | Tatum |
| AI | NVIDIA NIM, DeepSeek (via OpenRouter) |
| Auth | Sui Wallet + zkLogin (coming soon) |

---

## 📦 Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- Sui wallet (for testing)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd suidrive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   - `TATUM_API_KEY` — Get from [Tatum Dashboard](https://dashboard.tatum.io/)
   - `NVIDIA_API_KEY` — Get from [NVIDIA NIM](https://build.nvidia.com/)
   - `OPENROUTER_API_KEY` — Get from [OpenRouter](https://openrouter.ai/) (fallback)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TATUM_API_KEY` | Tatum API key for Sui RPC | Yes |
| `NVIDIA_API_KEY` | NVIDIA NIM API key | Yes* |
| `OPENROUTER_API_KEY` | OpenRouter API key (fallback) | Yes* |
| `SUI_NETWORK` | Sui network (testnet/mainnet) | No (default: testnet) |
| `SUI_PACKAGE_ID` | Deployed Move contract package ID | No (Phase 2) |

*At least one AI provider key is required

---

## 📝 Core Concepts

### File Object
```typescript
{
  fileId: string;
  owner: string;        // Sui wallet address
  latestVersion: number;
  createdAt: number;    // Unix timestamp
  name?: string;
  mimeType?: string;
}
```

### Version Object
```typescript
{
  versionId: string;
  fileId: string;
  walrusBlobId: string;
  previousVersion: string | null;
  timestamp: number;
  aiSummary?: string;
}
```

### Upload Flow

1. **User uploads file** → Frontend
2. **File stored on Walrus** → Returns `blobId`
3. **Version object created on Sui** → Via Tatum RPC
4. **AI analyzes file** → NVIDIA NIM or DeepSeek
5. **Timeline updated** → User sees new version

---

## 🧪 Testing

### Test Walrus Upload
```bash
# Upload a test file
curl -X PUT https://publisher.walrus-testnet.walrus.space/v1/store \
  --upload-file test.txt
```

### Test Sui Connection
```bash
# Check Sui network status
curl https://fullnode.testnet.sui.io:443 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getLatestCheckpointSequenceNumber"}'
```

---

## 📚 Project Structure

```
suidrive/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx           # Home page
│   │   ├── upload/            # Upload page
│   │   ├── dashboard/         # Dashboard page
│   │   └── api/               # API routes
│   ├── lib/                   # Core libraries
│   │   ├── walrus/            # Walrus client
│   │   ├── sui/               # Sui client (Tatum)
│   │   ├── ai/                # AI analysis
│   │   ├── upload.ts          # Upload orchestration
│   │   ├── utils.ts           # Utilities
│   │   └── config.ts          # Configuration
│   ├── types/                 # TypeScript types
│   └── components/            # React components
├── docs/                      # Documentation
│   └── TECHNICAL.md          # Technical spec
├── .env.local                # Environment variables
└── package.json              # Dependencies
```

---

## 🎯 Next Steps

### For Phase 2 (Core Upload Flow):

1. **Deploy Sui Move Contracts**
   - Create `FileObject` struct
   - Create `VersionObject` struct
   - Implement creation functions
   - Deploy to testnet

2. **Complete Sui Client Integration**
   - Implement `createFileObject()`
   - Implement `createVersionObject()`
   - Add transaction signing
   - Test with real wallet

3. **Test End-to-End Flow**
   - Upload file to Walrus ✓
   - Create objects on Sui
   - Run AI analysis ✓
   - Verify on blockchain

---

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

---

## 📄 License

MIT

---

## 🏆 Hackathon Positioning

**Best Walrus Integration** — 100% of file history stored on Walrus

**Best Use of Tatum** — All Sui interactions powered by Tatum RPC

**Core Innovation** — Git-style immutable history for every file type, accessible to normal users

---

Built with ❤️ for the decentralized web
