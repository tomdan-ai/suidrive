# SuiDrive — Technical Documentation

**Immutable File History Protocol powered by Walrus + Sui + Tatum**

---

## 1. Executive Summary

SuiDrive is an immutable onchain file history protocol built on Walrus decentralized storage and the Sui blockchain via Tatum RPC infrastructure.

Instead of replacing cloud storage providers, SuiDrive focuses on one core problem:
**preserving permanent, verifiable file history for every type of file on the internet.**

Every upload creates a new immutable version object. Nothing is overwritten. Nothing is lost.

SuiDrive combines:
- **Walrus** for decentralized append-only file storage
- **Sui** for immutable ownership and version metadata
- **Tatum RPC** infrastructure for all blockchain reads/writes
- **NVIDIA NIM + DeepSeek AI** for file analysis and version understanding

The result is Git-style version history for normal users — without Git complexity.

---

## 2. The Problem

Current storage systems fail users in critical ways:
- Files are overwritten accidentally
- Version history is limited or hidden
- Platforms can suspend or delete accounts
- Proof of original creation is weak
- Collaboration tools are too technical for normal users
- Existing systems are centralized and trust-based

Git solved version history for code. SuiDrive extends immutable version history to every file type.

---

## 3. Core Product Vision

SuiDrive is not "Google Drive on blockchain."

SuiDrive is: **"An immutable file history protocol for the internet."**

Every file becomes a permanent version chain:

```
V1 → V2 → V3 → V4
```

Each version:
- Stored permanently on Walrus
- Recorded immutably on Sui
- Linked cryptographically to previous versions
- Owned directly by the user's wallet

---

## 4. Core MVP Features

### 4.1 Immutable File Uploads
- Upload any file type
- Every upload creates a permanent Walrus blob
- Files are append-only and never overwritten

### 4.2 Universal Version History
- Every update creates a new immutable version object
- Timeline slider allows users to scrub through history
- Restore any previous version instantly

### 4.3 AI File Intelligence

Powered by **NVIDIA NIM + DeepSeek** (fallback: OpenRouter)

AI capabilities:
- File summaries
- Change explanations between versions
- Content analysis
- Context-aware insights

### 4.4 Ownership Verification
- Every version timestamped on Sui
- Ownership tied to Sui wallet
- Public verification by version hash/blob ID

### 4.5 Time Travel UI
A GitHub-style history viewer for normal users.

---

## 5. Architecture

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

**Core Principle:** No traditional database required for MVP. Walrus + Sui become the source of truth.

---

## 6. Authentication & Identity

Authentication is fully wallet-native.

Identity stack:
- Sui Wallet
- zkLogin
- Wallet address as universal user identity

No email auth, passwords, or centralized user accounts.

Example identity: `0x7ab3f91e...`

---

## 7. Onchain Data Model

**File Object:**
```json
{
  "fileId": "string",
  "owner": "0x...",
  "latestVersion": "number",
  "createdAt": "timestamp"
}
```

**Version Object:**
```json
{
  "versionId": "string",
  "fileId": "string",
  "walrusBlobId": "string",
  "previousVersion": "string | null",
  "timestamp": "number",
  "aiSummary": "string"
}
```

All version metadata exists on Sui. Actual files exist on Walrus.

---

## 8. Core Upload Flow

**Step 1:** User authenticates with zkLogin wallet

**Step 2:** File uploaded to Walrus
```json
{ "blobId": "walrus://abc123" }
```

**Step 3:** Next.js server action calls Tatum Sui RPC — creates immutable Version Object:
```json
{
  "fileId": "file_xyz",
  "version": 4,
  "blobId": "abc123",
  "previousVersion": 3,
  "owner": "0xabc...",
  "timestamp": 1712345678
}
```

**Step 4:** AI analyzes file and generates summary

**Step 5:** Frontend timeline updates instantly

---

## 9. Why Walrus Matters

Walrus powers:
- Permanent file storage
- Immutable version preservation
- Append-only architecture
- Decentralized binary storage

Every file version is an independent Walrus blob. This makes true historical recovery possible.

---

## 10. Why Tatum Matters

Tatum powers:
- Sui RPC abstraction
- Onchain object creation
- Version chain retrieval
- Ownership verification
- Blockchain indexing
- Transaction infrastructure

Tatum acts as the unified infrastructure layer for all Sui reads and writes.

---

## 11. Frontend Experience

**Main UI Components:**
- Dashboard
- File Upload Panel
- Version Timeline Slider
- AI Insights Panel
- Verification Portal

**Timeline Example:**
```
V1 ────●────────●────────●────────● V5
                          ↑
                  Currently Viewing
```

Users can navigate history, restore old versions, and compare AI summaries between versions.

---

## 12. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS |
| Storage | Walrus |
| Blockchain | Sui |
| RPC Infrastructure | Tatum |
| AI | NVIDIA NIM, DeepSeek, OpenRouter (fallback) |
| Auth | Sui Wallet + zkLogin |

---

## 13. Hackathon Positioning

**Best Walrus Integration:** Walrus stores 100% of immutable file history.

**Best Use of Tatum:** Tatum powers all Sui interactions and onchain indexing.

**Core Innovation:** Git-style immutable history for every file type — accessible to normal users.

---

## 14. Final Vision

SuiDrive transforms files from temporary cloud objects into permanent onchain assets with immutable history.

Not just storage. Not just blockchain.

**A permanent memory layer for the internet.**
