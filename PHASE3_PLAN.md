# 🔗 Phase 3: Version History & Timeline

## 🎯 Goals

Build the version history retrieval system and timeline UI to allow users to:
- View all versions of a file
- Navigate through version history
- Restore previous versions
- Compare versions
- See AI summaries for each version

---

## 📋 Tasks

### 1. Version Chain Retrieval

**Implement in `src/lib/sui/client.ts`:**

- [ ] `getVersionChain()` - Retrieve all versions for a file
- [ ] `getVersionsByOwner()` - Get all versions owned by user
- [ ] `getLatestVersion()` - Get most recent version
- [ ] Query optimization for large version chains

**Challenges:**
- Following `previousVersion` links
- Handling pagination
- Efficient querying

### 2. Timeline Component

**Create `src/components/Timeline.tsx`:**

- [ ] Visual timeline with version nodes
- [ ] Hover states showing version details
- [ ] Click to view version
- [ ] Slider for scrubbing through history
- [ ] Responsive design

**Features:**
- Date/time display
- Version numbers
- AI summaries preview
- File size indicators

### 3. Version Detail View

**Create `src/app/files/[fileId]/page.tsx`:**

- [ ] File metadata display
- [ ] Version timeline
- [ ] Selected version preview
- [ ] Download button
- [ ] Restore functionality
- [ ] Share link

### 4. Version Comparison

**Create `src/components/VersionCompare.tsx`:**

- [ ] Side-by-side comparison
- [ ] Diff highlighting (for text files)
- [ ] AI-generated change summary
- [ ] Metadata comparison

### 5. Restore Functionality

**Implement restore flow:**

- [ ] Download previous version
- [ ] Create new version from old content
- [ ] Update file object
- [ ] Transaction signing

---

## 🏗️ Implementation Plan

### Step 1: Enhanced Sui Client Methods

```typescript
// src/lib/sui/client.ts

async getVersionChain(fileId: string): Promise<VersionObject[]> {
  // Query all VersionObjects with matching fileId
  // Sort by timestamp
  // Build chain by following previousVersion links
  // Return ordered array
}

async getFileWithVersions(fileId: string): Promise<FileHistory> {
  const file = await this.getFileObject(fileId);
  const versions = await this.getVersionChain(fileId);
  return { file, versions };
}
```

### Step 2: Timeline Component

```typescript
// src/components/Timeline.tsx

interface TimelineProps {
  versions: VersionObject[];
  selectedVersion?: number;
  onVersionSelect: (version: VersionObject) => void;
}

export function Timeline({ versions, selectedVersion, onVersionSelect }: TimelineProps) {
  return (
    <div className="timeline">
      {versions.map((version, index) => (
        <TimelineNode
          key={version.versionId}
          version={version}
          isSelected={selectedVersion === index}
          onClick={() => onVersionSelect(version)}
        />
      ))}
    </div>
  );
}
```

### Step 3: File Detail Page

```typescript
// src/app/files/[fileId]/page.tsx

export default function FileDetailPage({ params }: { params: { fileId: string } }) {
  const [fileHistory, setFileHistory] = useState<FileHistory | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VersionObject | null>(null);

  // Load file and versions
  // Display timeline
  // Show selected version details
  // Handle restore
}
```

### Step 4: Version Comparison

```typescript
// src/components/VersionCompare.tsx

interface VersionCompareProps {
  version1: VersionObject;
  version2: VersionObject;
}

export function VersionCompare({ version1, version2 }: VersionCompareProps) {
  // Fetch both versions from Walrus
  // Generate diff
  // Display side-by-side
  // Show AI comparison
}
```

---

## 🎨 UI Design

### Timeline Visual

```
V1 ────●────────●────────●────────● V4
       │        │        │        │
     Jan 1    Jan 5    Jan 10   Jan 15
     1.2KB    1.5KB    1.8KB    2.0KB
```

### Version Card

```
┌─────────────────────────────────┐
│ Version 3                       │
│ Jan 10, 2026 • 1.8 KB          │
├─────────────────────────────────┤
│ AI Summary:                     │
│ Added new features and fixed    │
│ bugs in the authentication...   │
├─────────────────────────────────┤
│ [Download] [Restore] [Compare]  │
└─────────────────────────────────┘
```

---

## 🔧 Technical Considerations

### Querying Versions

**Option 1: Query by File ID**
```typescript
const objects = await client.getOwnedObjects({
  owner,
  filter: {
    StructType: `${packageId}::version_object::VersionObject`,
  },
});

// Filter by fileId in application
const versions = objects.filter(obj => obj.fileId === fileId);
```

**Option 2: Event-based Indexing**
```typescript
// Query VersionCreated events
const events = await client.queryEvents({
  query: {
    MoveEventType: `${packageId}::version_object::VersionCreated`,
  },
});

// Build version chain from events
```

### Pagination

For files with many versions:
- Implement cursor-based pagination
- Load versions in batches
- Virtual scrolling for timeline

### Caching

- Cache version chains in React Query
- Invalidate on new version upload
- Persist to localStorage

---

## 📊 Data Flow

```
User visits /files/[fileId]
         ↓
Load FileObject from Sui
         ↓
Query all VersionObjects
         ↓
Build version chain
         ↓
Display timeline
         ↓
User selects version
         ↓
Fetch blob from Walrus
         ↓
Display version content
```

---

## ✅ Success Criteria

- [ ] Version chain retrieval works
- [ ] Timeline displays all versions
- [ ] Version selection works
- [ ] Download previous versions
- [ ] Restore creates new version
- [ ] AI summaries display
- [ ] Responsive on mobile
- [ ] Performance < 2s load time

---

## 🧪 Testing Plan

### Unit Tests

```typescript
describe('getVersionChain', () => {
  it('should retrieve all versions in order', async () => {
    const versions = await client.getVersionChain('file_123');
    expect(versions).toHaveLength(4);
    expect(versions[0].timestamp).toBeLessThan(versions[1].timestamp);
  });
});
```

### Integration Tests

- Upload multiple versions
- Verify chain retrieval
- Test timeline navigation
- Verify restore functionality

### E2E Tests

```typescript
test('user can view version history', async ({ page }) => {
  await page.goto('/files/file_123');
  await expect(page.locator('.timeline')).toBeVisible();
  await page.click('.timeline-node:nth-child(2)');
  await expect(page.locator('.version-details')).toContainText('Version 2');
});
```

---

## 📈 Performance Optimization

- Lazy load version content
- Virtual scrolling for long timelines
- Debounce timeline scrubbing
- Cache Walrus blob fetches
- Optimize Sui queries

---

## 🚀 Deployment

After Phase 3:
- No contract changes needed
- Frontend-only updates
- Deploy to Vercel
- Test on testnet

---

Ready to build Phase 3! 🔗
