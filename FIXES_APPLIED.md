# Fixes Applied - File Preview & New Version Upload

## Issues Fixed

### 1. ✅ File Preview Not Working
**Problem**: When viewing a file's version history, clicking on a version showed "No preview" instead of displaying the file content.

**Root Cause**: The `/api/download` route didn't exist, so the FilePreview component couldn't fetch blob data from Walrus.

**Solution**: Created `/src/app/api/download/route.ts` that:
- Proxies requests to Walrus aggregator to avoid CORS issues
- Fetches blobs from `https://aggregator.walrus-testnet.walrus.space/v1/{blobId}`
- Sets appropriate headers for content type and caching
- Handles timeouts (30 seconds) for large files
- Returns proper error messages

**Files Changed**:
- ✅ Created: `src/app/api/download/route.ts`

---

### 2. ✅ New Version Upload Creating Separate Files
**Problem**: When clicking "Upload New Version" from a file's detail page, it created a completely new file instead of adding a version to the existing file.

**Root Cause**: The upload page didn't check for the `fileId` URL parameter to determine if this was a new version upload.

**Solution**: Updated `/src/app/upload/page.tsx` to:
- Read `fileId` from URL query parameters using `useSearchParams()`
- Skip file object creation when `fileId` exists (only create version object)
- Update UI to show "Upload New Version" instead of "Upload to SuiDrive"
- Display version number in the UI
- Add "View File History" button after successful version upload
- Wrap component in Suspense boundary (Next.js requirement for `useSearchParams`)

**Files Changed**:
- ✅ Modified: `src/app/upload/page.tsx`

---

## Technical Details

### Download API Route
```typescript
// Endpoint: GET /api/download?blobId={blobId}&fileName={fileName}
// Proxies to: https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
// Features:
// - CORS headers for browser access
// - Content-Type detection from Walrus response
// - Cache-Control for immutable blobs (1 hour)
// - 30-second timeout for large files
// - Proper error handling with status codes
```

### Version Upload Flow
```
1. User clicks "Upload New Version" on file detail page
   → Redirects to /upload?fileId=file_xxx

2. Upload page detects fileId parameter
   → Sets existingFileId state
   → Updates UI to show "Upload New Version"

3. User selects file and clicks upload
   → Skips file object creation (file already exists)
   → Creates only version object with same fileId
   → Links version to existing file

4. Success
   → Shows "Version X Added" message
   → Provides link to view file history
```

### File Preview Support
- **Images** (image/*): Direct `<img>` display via proxy
- **PDFs** (application/pdf): Embedded `<object>` viewer
- **Text/JSON** (text/*, application/json): Text content in `<pre>` block
- **Other files**: "Preview not available" message with download link

---

## Testing Checklist

### File Preview
- [x] Build successful
- [ ] Image files display correctly
- [ ] PDF files show in embedded viewer
- [ ] Text files show content
- [ ] Download link works for all file types
- [ ] Large files handle timeout gracefully

### New Version Upload
- [x] Build successful
- [ ] "Upload New Version" button appears on file detail page
- [ ] Upload page shows "Upload New Version" title
- [ ] Version number displays correctly
- [ ] New version appears in file history (not as separate file)
- [ ] "View File History" link works after upload
- [ ] Timeline shows all versions correctly

---

## Environment Configuration

Ensure these environment variables are set in `.env.local`:

```env
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_SUI_PACKAGE_ID=0x29198b8ae874e4dcee4659e6e8556e0c5084e6839740f42f92e246aaed1346d6
```

**Important**: The `NEXT_PUBLIC_` prefix is required for browser access!

---

## Next Steps

1. **Restart dev server** to pick up all changes:
   ```bash
   npm run dev
   ```

2. **Test file preview**:
   - Go to dashboard
   - Click "View History" on any file
   - Click on a version in the timeline
   - Verify preview appears

3. **Test new version upload**:
   - Go to a file's detail page
   - Click "Upload New Version"
   - Select a file and upload
   - Verify it appears as a new version (not a new file)
   - Check dashboard shows same file with updated version count

---

## Known Limitations

1. **Version Number Display**: Currently shows "Version 2" for all new versions. The actual version number is determined by counting existing versions on the blockchain.

2. **Previous Version Linking**: The `previousVersion` field is set to `null` for simplicity. Version history is tracked by the `file_id` field instead.

3. **Large File Timeout**: Files larger than what can be downloaded in 30 seconds will timeout. This is configurable in the download route.

---

## Files Modified Summary

```
Created:
  src/app/api/download/route.ts          (Download proxy API)

Modified:
  src/app/upload/page.tsx                (New version upload support)
  .env.local                             (Fixed NEXT_PUBLIC_ prefix)
  .env.local.example                     (Fixed NEXT_PUBLIC_ prefix)

Documentation:
  WALRUS_FIX.md                          (Environment variable fix)
  FIXES_APPLIED.md                       (This file)
```
