#!/bin/bash

# Current dir: /.../ci

# build & run Rust project
cargo r --release

# install latest os-checker
echo "DEBUG=$DEBUG"
if [[ "$DEBUG" == 1 ]]; then
  echo 'compile os-checker from github source'
  git clone https://github.com/os-checker/os-checker.git
  cargo install --path os-checker
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

# handle ansi via ansi2html or ansi2txt
apt install -y colorized-logs

# prepare os-checker configuration file
cp repos.yaml /check/
cd /check
# Current dir: /check

echo '```text' >>summary.txt
os-checker 2>&1 | ansi2txt >>summary.txt
echo '```' >>summary.txt
