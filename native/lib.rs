#[macro_use]
extern crate deno_core;
#[macro_use]
extern crate serde;

mod command;
mod error;

use deno_core::PluginInitContext;

init_fn!(init);

fn init(context: &mut dyn PluginInitContext) {
    context.register_op("hash", Box::new(command::hash));
    context.register_op("verify", Box::new(command::verify));
}
