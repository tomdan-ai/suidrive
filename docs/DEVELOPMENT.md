# SuiDrive Development Guide

## 🎯 Current Status: Phase 1 Complete ✅

### What's Built

#### ✅ Infrastructure Layer
- **Walrus Client** (`src/lib/walrus/client.ts`)
  - File upload to Walrus
  - File retrieval by blob ID
  - Blob existence checking
  
- **Sui Client** (`src/lib/sui/client.ts`)
  - Tatum RPC integration
  - Placeholder methods for Move contract calls
  - Ready for Phase 2 implementation

- **AI Analysis** (`src/lib/ai/analyze.ts`)
  - NVIDIA NIM integration
  - DeepSeek fallback via OpenRouter
  - File content analysis
  - Version comparison

- **Upload Orchestration** (`src/lib/upload.ts`)
  - Complete upload flow
  - Progress tracking
  - Error handling

#### ✅ Frontend Pages
- **Home Page** — Landing page with features
- **Upload Page** — File upload interface
- **Dashboard Page** — File management (skeleton)

#### ✅ Type System
- Complete TypeScript definitions
- Type-safe API contracts

---

## 🚀 Phase 2: Core Upload Flow

### Goal
Complete the end-to-end upload flow with real blockchain integration.

### Tasks

#### 1. Deploy Sui Move Contracts

**Create Move Package:**
```bash
sui move new suidrive_contracts
cd suidrive_contracts
```

**File Object Struct:**
```move
module suidrive::file_object {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    
    struct FileObject has key, store {
        id: UID,
        file_id: vector<u8>,
        owner: address,
        latest_version: u64,
        created_at: u64,
        name: vector<u8>,
        mime_type: vector<u8>,
    }
    
    public entry fun create_file(
        file_id: vector<u8>,
        name: vector<u8>,
        mime_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Implementation
    }
}
```

**Version Object Struct:**
```move
module suidrive::version_object {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    
    struct VersionObject has key, store {
        id: UID,
        version_id: vector<u8>,
        file_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        previous_version: Option<vector<u8>>,
        timestamp: u64,
        ai_summary: vector<u8>,
    }
    
    public entry fun create_version(
        file_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        previous_version: Option<vector<u8>>,
        ai_summary: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Implementation
    }
}
```

**Deploy:**
```bash
sui client publish --gas-budget 100000000
```

**Save Package ID:**
```bash
# Add to .env.local
SUI_PACKAGE_ID=0x...
```

#### 2. Implement Sui Client Methods

**Update `src/lib/sui/client.ts`:**

```typescript
async createFileObject(
  owner: string,
  fileId: string,
  name?: string,
  mimeType?: string
): Promise<string> {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${this.packageId}::file_object::create_file`,
    arguments: [
      tx.pure(fileId),
      tx.pure(name || ''),
      tx.pure(mimeType || ''),
    ],
  });
  
  // Sign and execute transaction
  const result = await this.client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair, // TODO: Get from wallet
  });
  
  return result.digest;
}
```

#### 3. Add Wallet Integration

**Install Sui Wallet Adapter:**
```bash
npm install @mysten/wallet-adapter-react
```

**Create Wallet Context:**
```typescript
// src/contexts/WalletContext.tsx
import { WalletProvider } from '@mysten/wallet-adapter-react';

export function WalletContextProvider({ children }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
```

**Update Upload Page:**
```typescript
import { useWallet } from '@mysten/wallet-adapter-react';

export default function UploadPage() {
  const { connected, address } = useWallet();
  
  // Use wallet address instead of manual input
}
```

#### 4. Test End-to-End

**Test Checklist:**
- [ ] Upload file to Walrus
- [ ] Create FileObject on Sui
- [ ] Create VersionObject on Sui
- [ ] AI analysis completes
- [ ] Transaction confirmed
- [ ] Objects queryable on-chain

---

## 📋 Phase 3: Version History & Timeline

### Tasks

#### 1. Implement Version Chain Retrieval

```typescript
async getVersionChain(fileId: string): Promise<VersionObject[]> {
  // Query all VersionObjects for fileId
  // Follow previousVersion links
  // Return sorted by timestamp
}
```

#### 2. Build Timeline Component

```typescript
// src/components/Timeline.tsx
export function Timeline({ versions }: { versions: VersionObject[] }) {
  return (
    <div className="timeline">
      {versions.map((v, i) => (
        <TimelineNode key={v.versionId} version={v} index={i} />
      ))}
    </div>
  );
}
```

#### 3. Add Version Navigation

- Slider to scrub through versions
- Click to view specific version
- Download any version
- Compare versions side-by-side

#### 4. Implement Restore

```typescript
async restoreVersion(versionId: string): Promise<Blob> {
  const version = await suiClient.getVersionObject(versionId);
  const file = await walrusClient.getFile(version.walrusBlobId);
  return file;
}
```

---

## 🤖 Phase 4: AI Intelligence Layer

### Tasks

#### 1. Enhanced File Analysis

- Detect file type automatically
- Extract metadata
- Generate detailed summaries
- Identify key changes

#### 2. Version Comparison

```typescript
async compareVersions(v1: string, v2: string): Promise<Comparison> {
  const version1 = await getVersionObject(v1);
  const version2 = await getVersionObject(v2);
  
  // AI-powered diff
  const changes = await aiAnalyzer.compareVersions(
    version1.aiSummary,
    version2.aiSummary,
    fileName
  );
  
  return changes;
}
```

#### 3. Insights Generation

- Suggest improvements
- Detect patterns
- Highlight important changes
- Generate changelog

---

## 🎨 Phase 5: Dashboard & Verification

### Tasks

#### 1. User Dashboard

- List all files owned by user
- Show version counts
- Display storage usage
- Quick actions (upload, view, share)

#### 2. Public Verification Portal

```typescript
// /verify/[blobId]
export default function VerifyPage({ params }) {
  const { blobId } = params;
  
  // Verify blob exists on Walrus
  // Show blockchain proof
  // Display ownership info
  // Show version history
}
```

#### 3. Ownership Verification

- Verify wallet owns file
- Show transaction history
- Display timestamps
- Export proof certificate

---

## 🧪 Testing Strategy

### Unit Tests

```bash
npm install --save-dev vitest @testing-library/react
```

```typescript
// src/lib/__tests__/upload.test.ts
import { describe, it, expect } from 'vitest';
import { uploadFile } from '../upload';

describe('uploadFile', () => {
  it('should upload file to Walrus', async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test Walrus upload
- Test Sui transactions
- Test AI analysis
- Test end-to-end flow

### E2E Tests

```bash
npm install --save-dev playwright
```

```typescript
// e2e/upload.spec.ts
test('user can upload file', async ({ page }) => {
  await page.goto('/upload');
  await page.setInputFiles('input[type="file"]', 'test.txt');
  await page.click('button:has-text("Upload")');
  await expect(page.locator('.success')).toBeVisible();
});
```

---

## 🐛 Debugging

### Check Walrus Connection

```bash
curl https://aggregator.walrus-testnet.walrus.space/v1/health
```

### Check Sui Connection

```bash
curl https://fullnode.testnet.sui.io:443 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getLatestCheckpointSequenceNumber"}'
```

### Check Tatum API

```bash
curl https://api.tatum.io/v4/sui/testnet/block/current \
  -H "x-api-key: YOUR_API_KEY"
```

### Debug Logs

```typescript
// Enable debug logging
localStorage.setItem('debug', 'suidrive:*');
```

---

## 📊 Performance Optimization

### Phase 2+

- Implement file chunking for large files
- Add upload progress streaming
- Cache blockchain queries
- Optimize AI analysis
- Add CDN for static assets

---

## 🔒 Security Considerations

### Current

- Client-side wallet signing
- No server-side secrets exposed
- Environment variables for API keys

### Phase 2+

- Rate limiting on API routes
- File size limits
- Content type validation
- Malware scanning
- CORS configuration

---

## 📦 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `TATUM_API_KEY`
- `NVIDIA_API_KEY`
- `OPENROUTER_API_KEY`
- `SUI_PACKAGE_ID`

---

## 🎯 Success Metrics

### Phase 2
- [ ] 100% upload success rate
- [ ] < 5s average upload time
- [ ] Blockchain confirmation < 10s

### Phase 3
- [ ] Version history loads < 2s
- [ ] Timeline renders smoothly
- [ ] Restore works for all file types

### Phase 4
- [ ] AI analysis < 3s
- [ ] 90%+ summary accuracy
- [ ] Version comparison works

### Phase 5
- [ ] Dashboard loads < 1s
- [ ] Verification instant
- [ ] Mobile responsive

---

## 🤝 Team Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/phase-2-contracts

# Make changes
git add .
git commit -m "feat: add Move contracts"

# Push and create PR
git push origin feature/phase-2-contracts
```

### Code Review Checklist

- [ ] TypeScript types correct
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Tests passing

---

## 📚 Resources

- [Walrus Docs](https://docs.walrus.site/)
- [Sui Docs](https://docs.sui.io/)
- [Tatum Docs](https://docs.tatum.io/)
- [NVIDIA NIM](https://build.nvidia.com/)
- [Next.js 15 Docs](https://nextjs.org/docs)

---

Ready to build Phase 2! 🚀
