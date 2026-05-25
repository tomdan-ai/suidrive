# Walrus Upload Fix

## Issue
Walrus file uploads were failing with a 404 error when trying to upload files to the testnet publisher.

## Root Cause
The environment variables for Walrus endpoints were not using the `NEXT_PUBLIC_` prefix, which is required for Next.js to expose them to the browser. Since the upload happens client-side, the browser couldn't access the publisher URL.

## Solution
Updated environment variables in `.env.local` and `.env.local.example`:

**Before:**
```env
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

**After:**
```env
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

## Verified Endpoints
Based on [official Walrus documentation](https://blog.walrus.xyz/getting-started-walrus-python-store-and-retrieve-data/):

- **Publisher (write)**: `https://publisher.walrus-testnet.walrus.space`
- **Aggregator (read)**: `https://aggregator.walrus-testnet.walrus.space`

## Testing
After restarting the dev server with the updated environment variables:

1. Navigate to `/upload`
2. Connect your wallet
3. Select a file to upload
4. The file should now successfully upload to Walrus testnet
5. You'll receive a blob ID that can be used to retrieve the file

## Features Working
- ✅ Real Walrus testnet upload (no mock data)
- ✅ File preview for images, PDFs, and text files
- ✅ Version history tracking
- ✅ AI-generated summaries for file versions
- ✅ Download any version of uploaded files
- ✅ Sui blockchain verification via Explorer links

## Important Notes
- **Restart Required**: After changing environment variables, you must restart the Next.js dev server
- **Browser Access**: Only environment variables with `NEXT_PUBLIC_` prefix are accessible in browser code
- **Testnet**: These endpoints are for Walrus testnet only (free storage, no real value)
- **Storage Duration**: Files are stored for 5 epochs by default (configurable in `src/lib/walrus/client.ts`)
