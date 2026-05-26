# File Preview Fix - Direct Walrus URLs

## Issue
File preview was showing empty content because:
1. The Walrus aggregator URL path was wrong (`/v1/{blobId}` instead of `/v1/blobs/{blobId}`)
2. The proxy through `/api/download` was returning 404

## Root Cause
The correct Walrus aggregator endpoint is:
```
https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}
```

NOT:
```
https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
```

## Solution
Updated all URL constructions to use the correct path `/v1/blobs/{blobId}` and switched to direct Walrus URLs since the aggregator supports CORS (`Access-Control-Allow-Origin: *`).

## Verified Walrus Response
```bash
$ curl -I "https://aggregator.walrus-testnet.walrus.space/v1/blobs/lmh69oKWUcZ5fbRLDG5pIfTGQdYvChy3eJNn3iY9028"
HTTP/2 200 
content-length: 1448750
access-control-allow-origin: *
cache-control: public, max-age=86400
```

## Enhanced FilePreview Component
Now supports:
- ✅ **Images** (image/*) - Direct `<img>` from Walrus
- ✅ **Videos** (video/*) - HTML5 `<video>` with streaming
- ✅ **Audio** (audio/*) - HTML5 `<audio>` element
- ✅ **PDFs** (application/pdf) - Embedded `<iframe>` viewer
- ✅ **Text/JSON** (text/*, application/json) - Fetched and displayed in `<pre>`
- ✅ **Other files** - Direct download link to Walrus

## Files Updated
- `src/app/files/[fileId]/page.tsx` - Direct Walrus URLs in FilePreview
- `src/app/api/download/route.ts` - Fixed `/v1/blobs/` path
- `src/lib/utils.ts` - Fixed `getWalrusBlobUrl` helper

## Why Direct URLs Work
Walrus aggregator supports:
- CORS (`Access-Control-Allow-Origin: *`)
- Range requests (`accept-ranges: bytes`) - good for video streaming
- Public access by default
- 24-hour cache (`cache-control: public, max-age=86400`)

This makes direct browser access ideal for previews.

## Testing
1. Refresh the file detail page
2. Click on a version in the timeline
3. Image preview should now load directly from Walrus
4. Try other file types (PDF, video, text) for confirmation
