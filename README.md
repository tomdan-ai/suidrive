<div align="center">

# SuiDrive

**Immutable File History Protocol on Sui + Walrus**

Permanent, verifiable version history for any file — anchored on the Sui blockchain, stored on Walrus, and analyzed with NVIDIA Nemotron.

[![Sui](https://img.shields.io/badge/Sui-testnet-4DA2FF?logo=sui&logoColor=white)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Walrus-testnet-00CFFF)](https://docs.wal.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Move](https://img.shields.io/badge/Move-2024.beta-orange)](https://move-language.github.io/move/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Routes & API](#routes--api)
- [Smart Contracts](#smart-contracts)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

SuiDrive is a decentralized "Google Drive + Git history" built on Sui and Walrus. Every uploaded file becomes a content-addressed Walrus blob, and every version is recorded as an immutable Move object on Sui. The result is a tamper-proof timeline of file evolution that anyone can verify cryptographically — without trusting any centralized service.

The protocol layers in NVIDIA Nemotron 120B for AI-generated summaries and version-diff analysis, turning an audit log into a human-readable changelog.

### Why SuiDrive

- **Immutable**: blob IDs are content hashes — the file cannot be silently mutated
- **Verifiable**: every version is a public Sui object owned by a wallet address
- **Decentralized**: no central server holds the canonical copy of your file
- **Auditable**: full version history with AI summaries, viewable by anyone given a blob ID
- **Permissionless**: anyone can verify a blob's authenticity through the public verification portal

---

## Features

### Storage & Versioning
- **Direct Walrus uploads** to the testnet publisher (`PUT /v1/store?epochs=5`)
- **Content-addressed retrieval** via the Walrus aggregator
- **Version timeline** — Git-style history per file, ordered by on-chain timestamp
- **New version uploads** preserve the original `fileId` so the lineage is unbroken

### Multi-format File Preview
| Type | Renderer |
| --- | --- |
| Images (`image/*`) | Inline `<img>` |
| Video (`video/*`) | HTML5 `<video controls>` with range-request streaming |
| Audio (`audio/*`) | HTML5 `<audio controls>` |
| PDF (`application/pdf`) | Embedded `<iframe>` |
| Text / JSON | Fetched and rendered in `<pre>` (4 KB preview) |
| Other | Fallback download link |

### AI Intelligence (NVIDIA Nemotron 120B)
- **Server-side analysis** at `/api/analyze` (keys never reach the browser)
- **Thinking-mode disabled** (`enable_thinking: false`) so summaries are clean, not chain-of-thought
- **Reasoning leak filter** strips any `<think>...</think>` blocks the model emits
- **Version diff** at `/api/compare`:
  - Text files: fetches both blobs and diffs the actual content
  - Binary files: builds a structured prompt from blob hashes, sizes, size delta, and time gap
  - Identical blob IDs short-circuit to "byte-for-byte identical"
- **Provider fallback**: NVIDIA NIM primary → OpenRouter Nemotron-free tier

### Public Verification Portal (`/verify`)
Anyone can paste a Walrus blob ID and receive a verification report:
1. **Walrus check** — blob exists, content type, size, content hash (ETag)
2. **On-chain check** — queries `VersionCreated` events to surface owner, timestamp, file name, AI summary, and a link to the full version history
3. **Trust banner** — green "Authenticity Verified" when both checks pass

### Dashboard
- Total files, total versions, **storage used** (sum of all version sizes), latest upload
- Search by name, MIME type, or file ID
- Sort by newest, oldest, name (A-Z), or most versions

---

## Architecture

```
┌──────────────┐   uploads   ┌───────────────────────┐   blobId    ┌──────────────┐
│   Browser    │────────────▶│  Walrus Publisher     │────────────▶│   Walrus     │
│  (Next.js)   │             │ (testnet)             │             │   Storage    │
└──────┬───────┘             └───────────────────────┘             └──────┬───────┘
       │                                                                   │
       │  signs tx (dapp-kit)                                              │
       ▼                                                                   │
┌──────────────┐  create_file/version   ┌───────────────────────┐          │
│  Sui Wallet  │───────────────────────▶│  Sui Move Package     │          │
└──────────────┘                        │  ::file_object        │          │
                                        │  ::version_object     │          │
                                        └──────────┬────────────┘          │
                                                   │                       │
                                                   │ events + objects      │
                                                   ▼                       │
                                        ┌───────────────────────┐          │
                                        │   Sui RPC (testnet)   │          │
                                        └──────────┬────────────┘          │
                                                   │                       │
                                                   ▼                       │
                                        ┌───────────────────────┐          │
                                        │  /api/analyze         │          │
                                        │  /api/compare         │          │
                                        │  /api/download (proxy)│──────────┘
                                        └──────────┬────────────┘
                                                   │
                                                   ▼
                                        ┌───────────────────────┐
                                        │  NVIDIA Nemotron 120B │
                                        │  (NIM + OpenRouter)   │
                                        └───────────────────────┘
```

**Two-write model**: each upload performs *two* on-chain transactions when creating a new file (one for `FileObject`, one for the first `VersionObject`), and a single transaction when adding subsequent versions to an existing file.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16.2 (App Router, Turbopack), React 19, Tailwind 4 |
| Wallet | `@mysten/dapp-kit`, `@mysten/sui` |
| Storage | Walrus testnet (publisher + aggregator HTTP API) |
| Smart contracts | Move 2024.beta on Sui |
| AI | NVIDIA NIM (`nvidia/nemotron-3-super-120b-a12b`), OpenRouter free tier fallback |
| Sui RPC | Tatum-managed gateway (configurable) |
| Language | TypeScript 5 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Sui wallet (Suiet, Sui Wallet, Slush) on testnet
- Some testnet SUI for gas ([faucet](https://docs.sui.io/guides/developer/getting-started/get-coins))
- (Optional) NVIDIA NIM API key and/or OpenRouter API key for AI features

### Installation

```bash
git clone <repository-url> suidrive
cd suidrive
npm install
cp .env.local.example .env.local
# Edit .env.local with your keys
npm run dev
```

The app will be available at <http://localhost:3000>.

---

## Configuration

All environment variables live in `.env.local`. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; the rest stay server-side.

```env
# Walrus (browser-accessible, must use NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x29198b8ae874e4dcee4659e6e8556e0c5084e6839740f42f92e246aaed1346d6

# AI providers (server-only — never exposed to the browser)
NVIDIA_API_KEY=nvapi-...
OPENROUTER_API_KEY=sk-or-v1-...

# Optional Sui RPC gateway
TATUM_API_KEY=t-...
NEXT_PUBLIC_TATUM_API_KEY=t-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Walrus URLs require the `NEXT_PUBLIC_` prefix.** The Walrus client runs in the browser; without the prefix, `process.env.WALRUS_*` will be `undefined` and uploads will hit `undefined/v1/store?epochs=5` (404).

> ⚠️ **AI keys do not use `NEXT_PUBLIC_`.** They are read server-side by `/api/analyze` and `/api/compare` only.

---

## Usage

### 1. Connect your wallet

Click the wallet button in the top-right of any page. SuiDrive uses `@mysten/dapp-kit`, so any Sui-compatible wallet on testnet will work.

### 2. Upload a file

Navigate to `/upload`. Pick any file. SuiDrive will:

1. **PUT** the bytes to the Walrus publisher with `?epochs=5`
2. Read the response (`newlyCreated` or `alreadyCertified`) and extract the `blobId`
3. (For text files) Send a content snippet to `/api/analyze` for an AI summary
4. Sign and execute `file_object::create_file` on Sui
5. Sign and execute `version_object::create_version` on Sui

### 3. View history & preview

Each file in the dashboard links to `/files/{objectId}`. The detail page shows:
- File metadata sidebar
- Vertical timeline of versions
- Preview of the selected version (image / video / PDF / text)
- AI summary for the selected version
- "Compare with AI" widget once there are ≥ 2 versions

### 4. Upload a new version

From a file's detail page, click **Upload New Version**. The upload page detects the `fileId` and `objectId` query params and skips the `create_file` step, so you only sign one transaction.

### 5. Verify a file publicly

Anyone (no wallet required) can paste a Walrus blob ID into `/verify` and get a full provenance report.

---

## Routes & API

### Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/dashboard` | User's files with stats, search, and sort |
| `/upload` | New file upload (or new version when `?fileId=...&objectId=...`) |
| `/files/[fileId]` | Version timeline + preview + comparison (`fileId` here is the Sui object ID) |
| `/verify` | Public verification search |
| `/verify/[blobId]` | Verification report for a Walrus blob |

### API endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/analyze` | `POST` | AI summary for a file (server-side keys) |
| `/api/compare` | `POST` | AI diff between two versions (text or binary metadata) |
| `/api/download` | `GET` | Server-side proxy to the Walrus aggregator |

#### `/api/analyze` request

```json
{
  "fileName": "report.md",
  "mimeType": "text/markdown",
  "fileContent": "first 3000 chars of the file"
}
```

#### `/api/compare` request

```json
{
  "fileName": "report.md",
  "mimeType": "text/markdown",
  "oldBlobId": "abc...",
  "newBlobId": "def...",
  "oldSummary": "previous AI summary (optional)",
  "newSummary": "current AI summary (optional)",
  "oldTimestamp": 1716636000000,
  "newTimestamp": 1716808800000
}
```

---

## Smart Contracts

The Move package lives in [`contracts/suidrive`](contracts/suidrive). Two modules:

### `file_object`

```move
public struct FileObject has key, store {
    id: UID,
    file_id: String,
    owner: address,
    latest_version: u64,
    created_at: u64,
    name: String,
    mime_type: String,
}

public entry fun create_file(file_id, name, mime_type, ctx)
public entry fun update_version(file: &mut FileObject, ctx)

public struct FileCreated has copy, drop { file_id, owner, name, timestamp }
public struct FileUpdated has copy, drop { file_id, new_version, timestamp }
```

### `version_object`

```move
public struct VersionObject has key, store {
    id: UID,
    version_id: String,
    file_id: String,
    walrus_blob_id: String,
    previous_version: Option<String>,
    timestamp: u64,
    ai_summary: String,
    size: u64,
    owner: address,
}

public entry fun create_version(
    version_id, file_id, walrus_blob_id,
    previous_version, ai_summary, size, ctx
)

public struct VersionCreated has copy, drop {
    version_id, file_id, walrus_blob_id, owner, timestamp
}
```

### Deployment

The package is published on Sui testnet at:

```
0x29198b8ae874e4dcee4659e6e8556e0c5084e6839740f42f92e246aaed1346d6
```

To re-publish (e.g., after editing the modules):

```bash
cd contracts/suidrive
sui move build
sui client publish --gas-budget 100000000
```

Update `NEXT_PUBLIC_SUI_PACKAGE_ID` in `.env.local` with the new package ID.

---

## Development

### Scripts

```bash
npm run dev      # Start Turbopack dev server on :3000
npm run build    # Production build
npm run start    # Run the production server
npm run lint     # ESLint
```

### Project conventions

- All client components must declare `'use client'`
- Pages that use `useSearchParams` must be wrapped in `<Suspense>` for static generation
- Walrus URLs use the path `/v1/blobs/{blobId}` (the trailing `/blobs` is required for retrieval)
- The `fileId` field on `FileObject` is a SuiDrive-internal identifier; the routing key for `/files/[id]` is the Sui **object ID** (`obj.data.objectId`)

### Tested environment

- Linux, Node 20, Next.js 16.2.6 (Turbopack), Sui testnet, Walrus testnet
- 11 routes total, build size ~1.2 MB JS gzipped

---

## Deployment

Any Next.js host works (Vercel, Netlify, self-hosted). Make sure to:

1. Set every env var listed in [Configuration](#configuration) on the host
2. Re-deploy any time you republish the Move package and update `NEXT_PUBLIC_SUI_PACKAGE_ID`
3. Walrus testnet has no SLA — for production, swap to a Walrus mainnet publisher/aggregator and the corresponding Sui mainnet package

---

## Project Structure

```
suidrive/
├── contracts/suidrive/         # Move package
│   ├── Move.toml
│   ├── Published.toml          # Tracks deployed package ID per network
│   └── sources/
│       ├── file_object.move
│       └── version_object.move
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/        # Server-side AI summary
│   │   │   ├── compare/        # Server-side version diff
│   │   │   ├── download/       # Walrus blob proxy
│   │   │   └── upload/         # Legacy mock route
│   │   ├── dashboard/          # User files
│   │   ├── files/[fileId]/     # Version history + preview
│   │   ├── upload/             # New file or new version
│   │   ├── verify/             # Public verification portal
│   │   │   └── [blobId]/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── Timeline.tsx
│   │   ├── VersionComparison.tsx
│   │   └── WalletButton.tsx
│   ├── contexts/
│   │   └── WalletProvider.tsx  # @mysten/dapp-kit setup
│   ├── hooks/
│   │   ├── useFileHistory.ts
│   │   └── useSuiClient.ts
│   ├── lib/
│   │   ├── ai/analyze.ts       # NVIDIA + OpenRouter integration
│   │   ├── sui/client.ts       # Move call helpers
│   │   ├── walrus/client.ts    # Walrus publisher integration
│   │   ├── config.ts
│   │   └── utils.ts
│   └── types/index.ts
├── docs/
│   └── TECHNICAL.md
├── .env.local.example
├── package.json
└── README.md
```

---

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Core upload + Sui Move package | ✅ |
| 2 | Wallet integration + real Walrus uploads | ✅ |
| 3 | Version history + timeline UI | ✅ |
| 4 | AI analysis + version comparison | ✅ |
| 5 | Dashboard + public verification portal | ✅ |
| 6 | Client-side encryption (AES-GCM) before upload | ✅ |
| 7 | File sharing (public links + wallet-based access) | ✅ |
| 8 | Exportable proof certificates (PDF/JSON) | ✅ |
| 9 | AI Assistant (natural language file search) | ✅ |
| 10 | Mainnet deploy | ☐ |

---

## Acknowledgments

- [Mysten Labs](https://github.com/MystenLabs) for Sui and Walrus
- [NVIDIA](https://build.nvidia.com) for the Nemotron 120B model and free NIM tier
- [OpenRouter](https://openrouter.ai) for the free Nemotron fallback
- [Tatum](https://tatum.io) for the managed Sui RPC gateway

---

## License

MIT — see [LICENSE](LICENSE) for details.
