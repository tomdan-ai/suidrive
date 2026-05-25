#!/bin/bash

# SuiDrive Deployment Script
# Run this after getting testnet tokens

set -e

echo "🚀 SuiDrive Deployment Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "Move.toml" ]; then
    echo "❌ Error: Move.toml not found. Please run from contracts/suidrive directory"
    exit 1
fi

# Check active address
echo "📍 Active Address:"
sui client active-address
echo ""

# Check gas balance
echo "⛽ Gas Balance:"
sui client gas
echo ""

# Confirm deployment
read -p "🤔 Ready to deploy? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔨 Building contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📤 Publishing to testnet..."
echo "This may take a minute..."
echo ""

# Deploy with output capture
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Deployment successful!"
echo ""

# Extract package ID
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" == "null" ]; then
    echo "⚠️  Could not extract package ID automatically"
    echo "Please find it in the output above"
    echo ""
    echo "$DEPLOY_OUTPUT" | jq '.'
else
    echo "📦 Package ID: $PACKAGE_ID"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the package ID above"
    echo "2. Add to .env.local:"
    echo "   NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID"
    echo ""
    echo "3. Restart your dev server:"
    echo "   npm run dev"
    echo ""
    echo "4. Test upload at:"
    echo "   http://localhost:3000/upload"
    echo ""
    
    # Offer to update .env.local automatically
    read -p "🤖 Auto-update .env.local? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ENV_FILE="../../.env.local"
        if [ -f "$ENV_FILE" ]; then
            # Check if NEXT_PUBLIC_SUI_PACKAGE_ID exists
            if grep -q "NEXT_PUBLIC_SUI_PACKAGE_ID=" "$ENV_FILE"; then
                # Update existing
                sed -i "s/NEXT_PUBLIC_SUI_PACKAGE_ID=.*/NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID/" "$ENV_FILE"
                echo "✅ Updated NEXT_PUBLIC_SUI_PACKAGE_ID in .env.local"
            else
                # Add new
                echo "" >> "$ENV_FILE"
                echo "NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID" >> "$ENV_FILE"
                echo "✅ Added NEXT_PUBLIC_SUI_PACKAGE_ID to .env.local"
            fi
        else
            echo "⚠️  .env.local not found at $ENV_FILE"
        fi
    fi
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🔍 View on Sui Explorer:"
echo "https://suiexplorer.com/object/$PACKAGE_ID?network=testnet"
echo ""
