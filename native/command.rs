use argon2::{hash_encoded, verify_encoded, Config, ThreadMode, Variant, Version};
use bytes::Bytes;
use deno_core::{Buf, CoreOp, ZeroCopyBuf};

use crate::error::Error;

#[derive(Deserialize)]
pub struct HashOptions {
    salt: Bytes,
    secret: Option<Bytes>,
    data: Option<Bytes>,
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
struct HashParams {
    password: String,
    options: HashOptions,
}

#[derive(Deserialize)]
struct VerifyParams {
    password: String,
    hash: String,
}

pub fn hash(data: &[u8], buf: Option<ZeroCopyBuf>) -> CoreOp {
    let mut buf = buf.unwrap();
    match hash_internal(data) {
        Ok(result) => {
            buf[0] = 1;
            CoreOp::Sync(Buf::from(result.as_bytes()))
        }
        Err(err) => {
            error_handler(err, &mut buf);
            CoreOp::Sync(Buf::default())
        }
    }
}

pub fn verify(data: &[u8], buf: Option<ZeroCopyBuf>) -> CoreOp {
    let mut buf = buf.unwrap();
    match verify_internal(data) {
        Ok(result) => {
            buf[0] = 1;
            CoreOp::Sync(Buf::from(vec![result as u8]))
        }
        Err(err) => {
            error_handler(err, &mut buf);
            CoreOp::Sync(Buf::default())
        }
    }
}

fn error_handler(err: Error, buf: &mut ZeroCopyBuf) {
    buf[0] = 0;
    let e = format!("{}", err);
    let e = e.as_bytes();
    for (index, byte) in e.iter().enumerate() {
        buf[index + 1] = *byte;
    }
}

fn hash_internal(data: &[u8]) -> Result<String, Error> {
    let params: HashParams = serde_json::from_slice(data)?;
    let salt = params.options.salt;

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

    if let Some(variant) = params.options.variant {
        if let Ok(v) = Variant::from_str(&variant) {
            config.variant = v;
        }
    }

    if let Some(version) = params.options.version {
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

    Ok(hash_encoded(&params.password.into_bytes(), &salt, &config)?)
}

fn verify_internal(data: &[u8]) -> Result<bool, Error> {
    let options: VerifyParams = serde_json::from_slice(data)?;

    Ok(verify_encoded(
        &options.hash,
        &options.password.into_bytes(),
    )?)
}
