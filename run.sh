#!/bin/bash

# echo $PWD # 似乎 github action 会默认挂载 /home/runner/work/ci/ci:/ci
# cd /check # 我们在 yml 中指定了 /home/runner/work/ci/ci:/ci
# echo $PWD

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

# run os-checker for repos.yaml
mkdir repos
cp repos.yaml repos
cd repos
apt install -y colorized-logs
os-checker 2>&1 | ansi2txt >../summary.txt
ls -alh ../
