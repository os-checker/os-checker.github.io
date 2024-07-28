#!/bin/sh

# build & run Rust project
cargo r --release

# install latest os-checker
if [[ "$DEBUG" -eq 1 ]]; then
  echo 'compile os-checker from github source'
  git clone https://github.com/os-checker/os-checker.git
  cargo install --path .
  export RUST_LOG=debug
else
  echo 'download os-checker from github release'
  curl -s https://api.github.com/repos/os-checker/os-checker/releases/latest |
    grep browser_download_url |
    grep os-checker-installer.sh |
    cut -d '"' -f 4 |
    wget -qi -
  echo 'os-checker-installer.sh is downloaded'
  sh os-checker-installer.sh
fi
os-checker --help

# run os-checker for repos.yaml
mkdir check
cd check
os-checker --config ../repos.yaml
