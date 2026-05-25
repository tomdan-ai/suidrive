/// VersionObject Module
/// Manages immutable version history for files
module suidrive::version_object {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::event;

    /// Version object representing a single immutable version
    public struct VersionObject has key, store {
        id: UID,
        version_id: String,
        file_id: String,
        walrus_blob_id: String,
        previous_version: Option<String>,
        timestamp: u64,
        ai_summary: String,
        size: u64,
        owner: address,
    }

    /// Event emitted when a new version is created
    public struct VersionCreated has copy, drop {
        version_id: String,
        file_id: String,
        walrus_blob_id: String,
        owner: address,
        timestamp: u64,
    }

    /// Create a new version object
    public entry fun create_version(
        version_id: vector<u8>,
        file_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        previous_version: Option<vector<u8>>,
        ai_summary: vector<u8>,
        size: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        let version_id_string = string::utf8(version_id);
        let file_id_string = string::utf8(file_id);
        let walrus_blob_id_string = string::utf8(walrus_blob_id);
        let ai_summary_string = string::utf8(ai_summary);

        // Convert previous version if exists
        let previous_version_option = if (option::is_some(&previous_version)) {
            let prev_vec = option::destroy_some(previous_version);
            option::some(string::utf8(prev_vec))
        } else {
            option::destroy_none(previous_version);
            option::none()
        };

        let version = VersionObject {
            id: object::new(ctx),
            version_id: version_id_string,
            file_id: file_id_string,
            walrus_blob_id: walrus_blob_id_string,
            previous_version: previous_version_option,
            timestamp,
            ai_summary: ai_summary_string,
            size,
            owner: sender,
        };

        // Emit creation event
        event::emit(VersionCreated {
            version_id: version_id_string,
            file_id: file_id_string,
            walrus_blob_id: walrus_blob_id_string,
            owner: sender,
            timestamp,
        });

        // Transfer to sender
        transfer::public_transfer(version, sender);
    }

    /// Get version ID
    public fun get_version_id(version: &VersionObject): String {
        version.version_id
    }

    /// Get file ID
    public fun get_file_id(version: &VersionObject): String {
        version.file_id
    }

    /// Get Walrus blob ID
    public fun get_walrus_blob_id(version: &VersionObject): String {
        version.walrus_blob_id
    }

    /// Get previous version
    public fun get_previous_version(version: &VersionObject): Option<String> {
        version.previous_version
    }

    /// Get timestamp
    public fun get_timestamp(version: &VersionObject): u64 {
        version.timestamp
    }

    /// Get AI summary
    public fun get_ai_summary(version: &VersionObject): String {
        version.ai_summary
    }

    /// Get size
    public fun get_size(version: &VersionObject): u64 {
        version.size
    }

    /// Get owner
    public fun get_owner(version: &VersionObject): address {
        version.owner
    }
}
