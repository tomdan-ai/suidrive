# SuiDrive Contract Deployment Guide

## Prerequisites

1. **Install Sui CLI**
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   ```

2. **Verify Installation**
   ```bash
   sui --version
   ```

3. **Create Wallet (if needed)**
   ```bash
   sui client new-address ed25519
   ```

4. **Get Testnet Tokens**
   - Visit: https://discord.gg/sui
   - Go to #testnet-faucet channel
   - Request tokens: `!faucet <your-address>`

## Step 1: Configure Sui Client

```bash
# Add testnet environment
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443

# Switch to testnet
sui client switch --env testnet

# Check active address
sui client active-address

# Check balance
sui client gas
```

## Step 2: Build Contracts

```bash
cd contracts/suidrive
sui move build
```

**Expected output:**
```
BUILDING suidrive
```

If successful, you'll see compiled bytecode in `build/` directory.

## Step 3: Test Contracts (Optional)

```bash
sui move test
```

## Step 4: Deploy to Testnet

```bash
sui client publish --gas-budget 100000000
```

**This will:**
1. Compile the Move modules
2. Create a transaction
3. Submit to the network
4. Return transaction details

## Step 5: Save Package ID

From the deployment output, find the **Package ID**:

```
╭─────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                    │
│  ┌──                                                                │
│  │ ObjectID: 0x...                                                  │
│  │ Sender: 0x...                                                    │
│  │ Owner: Immutable                                                 │
│  │ ObjectType: 0x2::package::UpgradeCap                            │
│  │ Version: 1                                                       │
│  └──                                                                │
│ Published Objects:                                                  │
│  ┌──                                                                │
│  │ PackageID: 0xABC123...  ← COPY THIS                            │
│  │ Version: 1                                                       │
│  │ Digest: ...                                                      │
│  └──                                                                │
╰─────────────────────────────────────────────────────────────────────╯
```

## Step 6: Update Environment Variables

```bash
# Edit .env.local
nano .env.local
```

Add the package ID:
```env
SUI_PACKAGE_ID=0xABC123...
```

## Step 7: Verify Deployment

```bash
# View package
sui client object <PACKAGE_ID>

# Check modules
sui client call --package <PACKAGE_ID> --module file_object --function get_file_id
```

## Step 8: Test Contract Calls

### Create a File Object

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module file_object \
  --function create_file \
  --args "test_file_123" "test.txt" "text/plain" \
  --gas-budget 10000000
```

### Create a Version Object

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module version_object \
  --function create_version \
  --args "test_file_123_v1" "test_file_123" "walrus_blob_abc" "[]" "Test summary" 1024 \
  --gas-budget 10000000
```

## Troubleshooting

### "Insufficient gas"
Increase gas budget:
```bash
--gas-budget 200000000
```

### "Module not found"
Rebuild contracts:
```bash
sui move build --force
```

### "Address not found"
Check active address:
```bash
sui client active-address
sui client addresses
```

### "RPC error"
Check network connection:
```bash
curl https://fullnode.testnet.sui.io:443
```

## Upgrading Contracts

To upgrade deployed contracts:

```bash
sui client upgrade --gas-budget 100000000
```

**Note:** You'll need the UpgradeCap object ID from the initial deployment.

## Mainnet Deployment

⚠️ **Only deploy to mainnet after thorough testing!**

```bash
# Switch to mainnet
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet

# Deploy
sui client publish --gas-budget 100000000
```

## Post-Deployment Checklist

- [ ] Package ID saved in `.env.local`
- [ ] Test file creation works
- [ ] Test version creation works
- [ ] Events are emitted correctly
- [ ] Objects are owned by sender
- [ ] Gas costs are reasonable
- [ ] Frontend integration tested

## Next Steps

1. Update `src/lib/sui/client.ts` with real contract calls
2. Test upload flow end-to-end
3. Verify on Sui Explorer: https://suiexplorer.com/
4. Monitor gas usage and optimize if needed

## Useful Commands

```bash
# View all objects owned by address
sui client objects

# View specific object
sui client object <OBJECT_ID>

# View transaction
sui client transaction <TX_DIGEST>

# Get gas price
sui client gas-price

# Split gas coins (if needed)
sui client split-coin --coin-id <COIN_ID> --amounts 1000000000
```

## Resources

- Sui Docs: https://docs.sui.io/
- Sui Explorer: https://suiexplorer.com/
- Sui Discord: https://discord.gg/sui
- Move Book: https://move-book.com/

---

Ready to deploy! 🚀
