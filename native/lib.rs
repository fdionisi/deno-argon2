mod command;
mod error;

use deno_core::{op_sync, Extension};

#[no_mangle]
pub fn init() -> Extension {
    Extension::builder()
        .ops(vec![
            ("op_argon2_hash", op_sync(command::hash)),
            ("op_argon2_verify", op_sync(command::verify)),
        ])
        .build()
}
