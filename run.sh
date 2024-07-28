#!/bin/sh

# build & run Rust project
cargo r --release

# install latest os-checker
curl -s https://api.github.com/repos/os-checker/os-checker/releases/latest |
  grep browser_download_url |
  grep os-checker-installer.sh |
  cut -d '"' -f 4 |
  wget -qi -
echo 'os-checker-installer.sh is downloaded'
sh os-checker-installer.sh
os-checker --help

# run os-checker for repos.yaml
os-checker
