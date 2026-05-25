/// FileObject Module
/// Manages file metadata and ownership on Sui blockchain
module suidrive::file_object {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};
    use sui::event;

    /// File object representing a file with version history
    public struct FileObject has key, store {
        id: UID,
        file_id: String,
        owner: address,
        latest_version: u64,
        created_at: u64,
        name: String,
        mime_type: String,
    }

    /// Event emitted when a new file is created
    public struct FileCreated has copy, drop {
        file_id: String,
        owner: address,
        name: String,
        timestamp: u64,
    }

    /// Event emitted when a file is updated
    public struct FileUpdated has copy, drop {
        file_id: String,
        new_version: u64,
        timestamp: u64,
    }

    /// Create a new file object
    public entry fun create_file(
        file_id: vector<u8>,
        name: vector<u8>,
        mime_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        let file_id_string = string::utf8(file_id);
        let name_string = string::utf8(name);
        let mime_type_string = string::utf8(mime_type);

        let file = FileObject {
            id: object::new(ctx),
            file_id: file_id_string,
            owner: sender,
            latest_version: 0,
            created_at: timestamp,
            name: name_string,
            mime_type: mime_type_string,
        };

        // Emit creation event
        event::emit(FileCreated {
            file_id: file_id_string,
            owner: sender,
            name: name_string,
            timestamp,
        });

        // Transfer to sender
        transfer::public_transfer(file, sender);
    }

    /// Update file version
    public entry fun update_version(
        file: &mut FileObject,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(file.owner == sender, 0); // Only owner can update

        file.latest_version = file.latest_version + 1;
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        event::emit(FileUpdated {
            file_id: file.file_id,
            new_version: file.latest_version,
            timestamp,
        });
    }

    /// Get file ID
    public fun get_file_id(file: &FileObject): String {
        file.file_id
    }

    /// Get owner
    public fun get_owner(file: &FileObject): address {
        file.owner
    }

    /// Get latest version
    public fun get_latest_version(file: &FileObject): u64 {
        file.latest_version
    }

    /// Get created timestamp
    public fun get_created_at(file: &FileObject): u64 {
        file.created_at
    }

    /// Get file name
    public fun get_name(file: &FileObject): String {
        file.name
    }

    /// Get mime type
    public fun get_mime_type(file: &FileObject): String {
        file.mime_type
    }
}
