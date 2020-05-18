#[macro_use]
extern crate serde;

mod command;
mod error;

use deno_core::plugin_api::Interface;

#[no_mangle]
fn deno_plugin_init(context: &mut dyn Interface) {
    context.register_op("hash", command::hash);
    context.register_op("verify", command::verify);
}
