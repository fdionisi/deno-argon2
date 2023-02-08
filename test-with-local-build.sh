#!/bin/bash
set -e

function is_gnu_sed(){
  sed --version >/dev/null 2>&1
}

BUILD_DIR='target/release'
PTN_BEFORE='dlopen(FETCH_OPTIONS, SYMBOLS)'
PTN_AFTER='dlopen(_FETCH_OPTIONS_FOR_DEV, SYMBOLS)'

if !(ls $BUILD_DIR | grep 'deno_argon2' >/dev/null 2>&1)
then
    echo "A static library not found in $BUILD_DIR"
    echo 'Please execute "cargo build --release" first'
    exit 1;
fi

cp lib/internal.ts _tmp.ts
trap 'mv _tmp.ts lib/internal.ts' EXIT

if is_gnu_sed
then
    sed -i "s/$PTN_BEFORE/$PTN_AFTER/g" lib/internal.ts
else
    sed -i '' "s/$PTN_BEFORE/$PTN_AFTER/g" lib/internal.ts
fi

deno test --allow-read --allow-write --allow-ffi --allow-run --allow-env --unstable tests/
