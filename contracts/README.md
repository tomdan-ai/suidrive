# SuiDrive Smart Contracts

Sui Move contracts for immutable file history protocol.

## Modules

### 1. `file_object.move`
Manages file metadata and ownership.

**Struct: FileObject**
- `file_id`: Unique identifier for the file
- `owner`: Wallet address of the owner
- `latest_version`: Current version number
- `created_at`: Creation timestamp
- `name`: File name
- `mime_type`: File MIME type

**Functions:**
- `create_file()`: Create a new file object
- `update_version()`: Increment version counter
- Getter functions for all fields

### 2. `version_object.move`
Manages immutable version history.

**Struct: VersionObject**
- `version_id`: Unique identifier for this version
- `file_id`: Reference to parent file
- `walrus_blob_id`: Walrus storage blob ID
- `previous_version`: Link to previous version (optional)
- `timestamp`: Creation timestamp
- `ai_summary`: AI-generated summary
- `size`: File size in bytes
- `owner`: Wallet address of the owner

**Functions:**
- `create_version()`: Create a new immutable version
- Getter functions for all fields

## Building

```bash
cd contracts/suidrive
sui move build
```

## Testing

```bash
sui move test
```

## Deploying

### Testnet
```bash
sui client publish --gas-budget 100000000
```

### Mainnet
```bash
sui client publish --gas-budget 100000000 --network mainnet
```

## After Deployment

1. Copy the package ID from the output
2. Update `.env.local`:
   ```env
   SUI_PACKAGE_ID=0x...
   ```

## Events

### FileCreated
Emitted when a new file is created.
- `file_id`: File identifier
- `owner`: Owner address
- `name`: File name
- `timestamp`: Creation time

### FileUpdated
Emitted when a file version is updated.
- `file_id`: File identifier
- `new_version`: New version number
- `timestamp`: Update time

### VersionCreated
Emitted when a new version is created.
- `version_id`: Version identifier
- `file_id`: Parent file identifier
- `walrus_blob_id`: Walrus blob ID
- `owner`: Owner address
- `timestamp`: Creation time

## Usage Example

```typescript
// Create file
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::file_object::create_file`,
  arguments: [
    tx.pure('file_123'),
    tx.pure('document.pdf'),
    tx.pure('application/pdf'),
  ],
});

// Create version
tx.moveCall({
  target: `${packageId}::version_object::create_version`,
  arguments: [
    tx.pure('file_123_v1'),
    tx.pure('file_123'),
    tx.pure('walrus_blob_abc'),
    tx.pure(null), // No previous version
    tx.pure('AI summary here'),
    tx.pure(1024), // Size in bytes
  ],
});
```

## Security Considerations

1. **Ownership**: Only file owners can update versions
2. **Immutability**: Version objects cannot be modified after creation
3. **Events**: All actions emit events for transparency
4. **Transfer**: Objects are transferred to the creator

## Gas Estimates

- Create file: ~0.001 SUI
- Create version: ~0.001 SUI
- Update version: ~0.0005 SUI

*Estimates based on testnet. Actual costs may vary.*
