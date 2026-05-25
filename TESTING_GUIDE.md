# 🧪 SuiDrive Testing Guide

Complete guide for testing all features of SuiDrive.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 📋 Pre-Testing Checklist

### 1. Environment Setup

```bash
# Check .env.local exists
cat .env.local

# Required variables:
# ✓ NEXT_PUBLIC_SUI_PACKAGE_ID
# ✓ NEXT_PUBLIC_SUI_NETWORK=testnet
```

### 2. Wallet Setup

- ✓ Sui Wallet extension installed
- ✓ Wallet switched to testnet
- ✓ Wallet has testnet SUI tokens (> 0.1 SUI)

**Get Testnet Tokens:**
```bash
# Visit Discord
https://discord.gg/sui

# Go to #testnet-faucet channel
# Run command:
!faucet <your-wallet-address>
```

### 3. Build Check

```bash
# Verify build works
npm run build

# Expected: ✓ Compiled successfully
```

---

## 🧪 Test Scenarios

### Test 1: Home Page

**URL:** `http://localhost:3000`

**Steps:**
1. Open home page
2. Verify hero section displays
3. Check "Get Started" button
4. Verify features section
5. Check responsive design

**Expected:**
- ✓ Page loads without errors
- ✓ All sections visible
- ✓ Buttons clickable
- ✓ Responsive on mobile

---

### Test 2: Wallet Connection

**URL:** `http://localhost:3000/upload`

**Steps:**
1. Navigate to upload page
2. Click "Connect Wallet" button
3. Select Sui Wallet from modal
4. Approve connection
5. Verify address displays

**Expected:**
- ✓ Wallet modal opens
- ✓ Connection succeeds
- ✓ Address displays (truncated)
- ✓ Button changes to "Disconnect"

**Troubleshooting:**
- If wallet doesn't connect, refresh page
- Ensure wallet is on testnet
- Check browser console for errors

---

### Test 3: File Upload (New File)

**URL:** `http://localhost:3000/upload`

**Steps:**
1. Connect wallet (if not connected)
2. Click "Select File" or drag & drop
3. Choose a small text file (< 1MB)
4. Click "Upload to SuiDrive"
5. Approve file creation transaction
6. Approve version creation transaction
7. Wait for success message

**Expected:**
- ✓ File selected successfully
- ✓ Upload button enabled
- ✓ Progress stages display:
  - Uploading to Walrus
  - Analyzing with AI
  - Creating file object
  - Creating version object
  - Complete
- ✓ Success message with transaction link
- ✓ File ID and Version ID displayed

**Verify on Chain:**
```bash
# Click "View on Explorer" link
# Check FileObject created
# Check VersionObject created
# Verify events emitted
```

**Test Files:**
- ✓ Text file (.txt)
- ✓ Markdown file (.md)
- ✓ JSON file (.json)
- ✓ Image file (.png, .jpg)
- ✓ PDF file (.pdf)

---

### Test 4: File Upload (New Version)

**URL:** `http://localhost:3000/upload?fileId=<existing-file-id>`

**Steps:**
1. Get file ID from previous upload
2. Navigate to upload page with fileId param
3. Select a different file
4. Upload as new version
5. Approve version creation transaction

**Expected:**
- ✓ Upload succeeds
- ✓ New version created
- ✓ Version number increments
- ✓ Previous version linked

---

### Test 5: Dashboard

**URL:** `http://localhost:3000/dashboard`

**Steps:**
1. Connect wallet
2. Wait for files to load
3. Verify file cards display
4. Check stats (total files, versions, latest upload)
5. Click on a file card

**Expected:**
- ✓ All uploaded files display
- ✓ Files sorted by creation date (newest first)
- ✓ Stats are accurate
- ✓ File cards show:
  - File name
  - MIME type
  - Version count
  - Creation date
  - File ID
- ✓ Clicking card navigates to file detail

**Empty State:**
- If no files, shows "No Files Yet" message
- "Upload File" button visible

---

### Test 6: File Detail & Timeline

**URL:** `http://localhost:3000/files/<file-id>`

**Steps:**
1. Navigate to file detail page
2. Verify file info sidebar displays
3. Check timeline renders
4. Click on different version nodes
5. Verify version details panel updates
6. Click "Download Latest" button
7. Click "View on Explorer" link

**Expected:**
- ✓ File metadata displays:
  - File name
  - File ID
  - MIME type
  - Creation date
  - Total versions
  - Owner address
- ✓ Timeline shows all versions
- ✓ Versions sorted chronologically
- ✓ Latest version has badge
- ✓ Clicking version highlights node
- ✓ Version details panel shows:
  - Version number
  - Timestamp
  - Blob ID
  - AI summary (if available)
  - Download button
  - Explorer link
- ✓ Download opens Walrus aggregator
- ✓ Explorer link opens Sui Explorer

**Timeline Interactions:**
- Hover over version nodes
- Click to select
- Verify selected state
- Check smooth transitions

---

### Test 7: Version History Navigation

**Steps:**
1. Upload a file (version 1)
2. Upload same file again (version 2)
3. Upload same file again (version 3)
4. Navigate to file detail page
5. Verify timeline shows 3 versions
6. Click each version
7. Verify details update

**Expected:**
- ✓ All 3 versions display
- ✓ Versions numbered 1, 2, 3
- ✓ Timestamps increase
- ✓ Each version has unique blob ID
- ✓ AI summaries differ (if text file)
- ✓ Latest version has badge

---

### Test 8: AI Analysis

**Requirements:**
- Text-based file (txt, md, json, etc.)
- NVIDIA_API_KEY or OPENROUTER_API_KEY in .env.local

**Steps:**
1. Upload a text file
2. Wait for AI analysis
3. Check version details for summary

**Expected:**
- ✓ AI summary generated
- ✓ Summary describes file content
- ✓ Summary displays in timeline
- ✓ Summary displays in details panel

**Note:** AI analysis may fail if:
- No API key configured
- API rate limit reached
- File is not text-based
- Upload still succeeds without AI

---

### Test 9: Responsive Design

**Devices to Test:**
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

**Pages to Test:**
- Home page
- Upload page
- Dashboard
- File detail page

**Expected:**
- ✓ Layout adapts to screen size
- ✓ No horizontal scroll
- ✓ Touch targets large enough
- ✓ Text readable
- ✓ Images scale properly

---

### Test 10: Error Handling

#### Scenario A: No Wallet Connected

**Steps:**
1. Navigate to dashboard without connecting wallet
2. Verify prompt to connect

**Expected:**
- ✓ "Connect Your Wallet" message
- ✓ Connect button visible
- ✓ No errors in console

#### Scenario B: Invalid File ID

**Steps:**
1. Navigate to `/files/invalid-id`
2. Verify error message

**Expected:**
- ✓ "File Not Found" message
- ✓ "Back to Dashboard" button
- ✓ No crash

#### Scenario C: Network Error

**Steps:**
1. Disconnect internet
2. Try to load dashboard
3. Verify error handling

**Expected:**
- ✓ Error message displays
- ✓ No infinite loading
- ✓ Graceful failure

#### Scenario D: Transaction Rejection

**Steps:**
1. Start file upload
2. Reject transaction in wallet
3. Verify error message

**Expected:**
- ✓ "Transaction rejected" message
- ✓ Can retry upload
- ✓ No partial state

---

## 🔍 Verification Checklist

### On-Chain Verification

After each upload, verify on Sui Explorer:

```bash
# File Object
https://suiexplorer.com/object/<file-object-id>?network=testnet

# Check fields:
# ✓ file_id
# ✓ owner
# ✓ latest_version
# ✓ created_at
# ✓ name
# ✓ mime_type
```

```bash
# Version Object
https://suiexplorer.com/object/<version-object-id>?network=testnet

# Check fields:
# ✓ version_id
# ✓ file_id
# ✓ walrus_blob_id
# ✓ previous_version
# ✓ timestamp
# ✓ ai_summary
# ✓ size
```

### Events Verification

```bash
# Check transaction events
https://suiexplorer.com/txblock/<transaction-digest>?network=testnet

# Expected events:
# ✓ FileCreated (for new files)
# ✓ FileUpdated (for new versions)
# ✓ VersionCreated (always)
```

### Walrus Verification

```bash
# Check blob exists
curl -I https://aggregator.walrus-testnet.walrus.space/v1/<blob-id>

# Expected: HTTP 200 OK
```

---

## 🐛 Common Issues

### Issue: Wallet Won't Connect

**Symptoms:**
- Connect button does nothing
- Modal doesn't open
- Connection fails

**Solutions:**
1. Refresh page
2. Check wallet extension installed
3. Switch wallet to testnet
4. Clear browser cache
5. Try different browser

### Issue: Transaction Fails

**Symptoms:**
- "Insufficient gas" error
- Transaction rejected
- Timeout

**Solutions:**
1. Check wallet has SUI tokens
2. Get testnet tokens from faucet
3. Increase gas budget
4. Verify package ID correct
5. Check network is testnet

### Issue: Files Not Loading

**Symptoms:**
- Dashboard shows loading forever
- No files display
- Error message

**Solutions:**
1. Check wallet connected
2. Verify package ID in .env.local
3. Check network is testnet
4. Verify files exist on chain
5. Check browser console for errors

### Issue: Timeline Not Displaying

**Symptoms:**
- File detail page loads but no timeline
- Versions not showing
- Empty state

**Solutions:**
1. Verify file has versions
2. Check file ID is correct
3. Verify versions owned by same address
4. Check browser console for errors
5. Refresh page

### Issue: AI Summary Missing

**Symptoms:**
- Upload succeeds but no summary
- Summary shows as undefined

**Solutions:**
1. Check API key configured
2. Verify file is text-based
3. Check API rate limits
4. Try different file
5. AI failure doesn't block upload

---

## 📊 Performance Testing

### Load Time Benchmarks

**Target Times:**
- Home page: < 1s
- Dashboard: < 2s
- File detail: < 2s
- Upload: < 5s (excluding transaction)

**Measure:**
```bash
# Use browser DevTools
# Network tab → Disable cache
# Reload page
# Check "Load" time
```

### Transaction Times

**Expected:**
- File creation: 3-5 seconds
- Version creation: 3-5 seconds
- Total upload: 10-15 seconds

**Factors:**
- Network congestion
- Gas price
- Walrus upload speed
- AI analysis time

---

## ✅ Final Checklist

Before marking testing complete:

### Functionality
- [ ] Home page loads
- [ ] Wallet connects
- [ ] File upload works (new file)
- [ ] File upload works (new version)
- [ ] Dashboard displays files
- [ ] File detail shows timeline
- [ ] Version selection works
- [ ] Download works
- [ ] AI summaries generate

### UI/UX
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Buttons clickable
- [ ] Links work
- [ ] Animations smooth

### On-Chain
- [ ] FileObject created
- [ ] VersionObject created
- [ ] Events emitted
- [ ] Data persists
- [ ] Queries work
- [ ] Explorer links work

### Edge Cases
- [ ] No wallet connected
- [ ] Invalid file ID
- [ ] Network error
- [ ] Transaction rejection
- [ ] Empty dashboard
- [ ] Large files (> 10MB)
- [ ] Many versions (> 10)

---

## 🚀 Production Testing

Before deploying to production:

### Testnet Validation
- [ ] All features work on testnet
- [ ] Multiple users tested
- [ ] Different file types tested
- [ ] Version chains tested
- [ ] Performance acceptable

### Security
- [ ] No private keys in code
- [ ] Environment variables secure
- [ ] API keys not exposed
- [ ] Wallet permissions correct
- [ ] Transaction signing secure

### Deployment
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Analytics configured

---

## 📚 Resources

**Sui Explorer:**
https://suiexplorer.com/?network=testnet

**Walrus Testnet:**
https://aggregator.walrus-testnet.walrus.space

**Sui Discord (Faucet):**
https://discord.gg/sui

**Project Docs:**
- README.md
- DEVELOPMENT.md
- QUICKSTART.md
- PHASE3_COMPLETE.md

---

## 🎉 Happy Testing!

If you find any issues, please:
1. Check browser console for errors
2. Verify environment variables
3. Check network is testnet
4. Review troubleshooting section
5. Open an issue with details

---

**Last Updated:** May 25, 2026  
**Version:** 1.0.0  
**Status:** Ready for Testing ✅
