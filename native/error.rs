use std::{error::Error as ErrorTrait, fmt};

use argon2::Error as Argon2Error;
use serde_json::Error as SerdeJsonError;

#[derive(Debug)]
pub enum Error {
    Argon2(Argon2Error),
    SerdeJson(SerdeJsonError),
}

impl ErrorTrait for Error {}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let msg = match self {
            Self::Argon2(err) => err.to_string(),
            Self::SerdeJson(err) => err.to_string(),
        };

        write!(f, "{self:?}: {msg}")
    }
}

impl From<Argon2Error> for Error {
    fn from(error: Argon2Error) -> Self {
        Self::Argon2(error)
    }
}

impl From<SerdeJsonError> for Error {
    fn from(error: SerdeJsonError) -> Self {
        Self::SerdeJson(error)
    }
}
