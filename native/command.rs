use argon2::{hash_encoded, verify_encoded, Config, ThreadMode, Variant, Version};
use deno_core::{error::AnyError, OpState, ZeroCopyBuf};
use serde::Deserialize;

use crate::error::Error;

#[derive(Deserialize)]
struct HashOptions {
    salt: ZeroCopyBuf,
    secret: Option<ZeroCopyBuf>,
    data: Option<ZeroCopyBuf>,
    version: Option<String>,
    variant: Option<String>,
    #[serde(rename(deserialize = "memoryCost"))]
    memory_cost: Option<u32>,
    #[serde(rename(deserialize = "timeCost"))]
    time_cost: Option<u32>,
    #[serde(rename(deserialize = "lanes"))]
    lanes: Option<u32>,
    #[serde(rename(deserialize = "threadMode"))]
    thread_mode: Option<u8>,
    #[serde(rename(deserialize = "hashLength"))]
    hash_length: Option<u32>,
}

#[derive(Deserialize)]
pub struct HashParams {
    password: String,
    options: HashOptions,
}

#[derive(Deserialize)]
pub struct VerifyParams {
    password: String,
    hash: String,
}

pub fn hash(_state: &mut OpState, params: HashParams, _: ()) -> Result<String, AnyError> {
    Ok(hash_internal(&params)?)
}

pub fn verify(_state: &mut OpState, params: VerifyParams, _: ()) -> Result<bool, AnyError> {
    Ok(verify_internal(&params)?)
}

fn hash_internal(params: &HashParams) -> Result<String, Error> {
    let salt = &params.options.salt;

    let mut config: Config = Config::default();

    if let Some(ref secret) = params.options.secret {
        config.secret = &secret[..];
    }

    if let Some(ref data) = params.options.data {
        config.ad = &data[..];
    }

    if let Some(memory_cost) = params.options.memory_cost {
        config.mem_cost = memory_cost;
    }

    if let Some(time_cost) = params.options.time_cost {
        config.time_cost = time_cost;
    }

    if let Some(variant) = &params.options.variant {
        if let Ok(v) = Variant::from_str(&variant) {
            config.variant = v;
        }
    }

    if let Some(version) = &params.options.version {
        if let Ok(v) = Version::from_str(&version) {
            config.version = v;
        }
    }

    if let Some(lanes) = params.options.lanes {
        config.lanes = lanes;
    }

    if let Some(hash_length) = params.options.hash_length {
        config.hash_length = hash_length;
    }

    if let Some(thread_mode) = params.options.thread_mode {
        match thread_mode {
            0 => config.thread_mode = ThreadMode::Sequential,
            1 => config.thread_mode = ThreadMode::Parallel,
            _ => {}
        }
    }

    Ok(hash_encoded(
        &params.password.to_owned().into_bytes(),
        &salt,
        &config,
    )?)
}

fn verify_internal(params: &VerifyParams) -> Result<bool, Error> {
    Ok(verify_encoded(
        &params.hash,
        &params.password.to_owned().into_bytes(),
    )?)
}
