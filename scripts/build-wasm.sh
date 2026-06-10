#!/bin/bash
set -e

# Default path to tmpfs-cpp repo
TMPFS_DIR=${1:-"/home/ging/prog/learn/tmpfs-cpp"}

if [ ! -d "$TMPFS_DIR" ]; then
  echo "Error: Directory '$TMPFS_DIR' does not exist."
  echo "Usage: ./scripts/build-wasm.sh [path/to/tmpfs-cpp]"
  exit 1
fi

echo "Compiling tmpfs-cpp from '$TMPFS_DIR' to WebAssembly..."

# Get absolute paths
TMPFS_ABS=$(cd "$TMPFS_DIR" && pwd)
WEBSITE_ABS=$(cd "$(dirname "$0")/.." && pwd)

docker run --rm \
  -v "$TMPFS_ABS":/tmpfs-cpp \
  -v "$WEBSITE_ABS":/website \
  -u $(id -u):$(id -g) \
  emscripten/emsdk emcc \
    /tmpfs-cpp/src/filesystem.cpp \
    /tmpfs-cpp/src/vnode.cpp \
    /website/src/wasm/wasm_interface.cpp \
    -I/tmpfs-cpp/src \
    -I/website/src/wasm/include \
    -o /website/src/wasm/tmpfs.js \
    -std=c++20 \
    -s EXPORTED_FUNCTIONS="['_execute_command','_get_pwd']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','UTF8ToString']" \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createTmpFSModule" \
    -s EXPORT_ES6=1 \
    -s ENVIRONMENT="web" \
    -s SINGLE_FILE=1 \
    -O3

echo "Successfully built WebAssembly module at src/wasm/tmpfs.js!"
