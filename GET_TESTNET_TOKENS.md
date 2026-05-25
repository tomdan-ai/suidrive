# Getting Testnet SUI Tokens

Your wallet address: `0x29717e53c792abd9cd747d5d2348908ff69a4d0b9df3ee8666ab3f2fd45e67ec`

## Option 1: Discord Faucet (Recommended)

1. **Join Sui Discord**
   - Visit: https://discord.gg/sui

2. **Go to #testnet-faucet channel**

3. **Request tokens**
   ```
   !faucet 0x29717e53c792abd9cd747d5d2348908ff69a4d0b9df3ee8666ab3f2fd45e67ec
   ```

4. **Wait for confirmation**
   - You'll receive 1 SUI (enough for multiple deployments)

## Option 2: Web Faucet

1. **Visit Sui Testnet Faucet**
   - URL: https://faucet.testnet.sui.io/

2. **Enter your address**
   ```
   0x29717e53c792abd9cd747d5d2348908ff69a4d0b9df3ee8666ab3f2fd45e67ec
   ```

3. **Click "Request Tokens"**

## Option 3: CLI Faucet (After rate limit clears)

```bash
curl --location --request POST 'https://faucet.testnet.sui.io/v1/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "0x29717e53c792abd9cd747d5d2348908ff69a4d0b9df3ee8666ab3f2fd45e67ec"
    }
  }'
```

## Verify You Received Tokens

```bash
sui client gas
```

You should see gas coins listed.

## After Getting Tokens

Once you have testnet SUI, run:

```bash
cd /home/tom.dev/Documents/blockchain/suidrive/contracts/suidrive
sui client publish --gas-budget 100000000
```

This will deploy your contracts to testnet!

---

**Note:** The faucet is currently rate-limited. Discord faucet is usually the fastest option.
