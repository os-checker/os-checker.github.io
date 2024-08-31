#!/bin/bash

# 加载 cargo 环境
source $HOME/.bashrc

# 总是彩色打印 cargo 信息
export CARGO_TERM_COLOR=always

echo "查看是否安装了 libclang"
dpkg -l | grep libclang

# Current dir: /ci
echo PWD=$PWD && ls -alh

# install latest os-checker
echo "DEBUG=$DEBUG"
if [[ "$DEBUG" == 1 ]]; then
  echo 'compile os-checker from github source'
  git clone https://github.com/os-checker/os-checker.git
  cargo install --path os-checker
  export RUST_LOG=trace
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

os-checker --emit json --norun --setup # set up toolchains for all repos and checkers
# /check 目录在 github action 和 Docker 容器之间共享
os-checker --emit /check/ui.json # to be moved into ci/os-checks/content

# 构建网页应用，并从容器移至 Github Action 目录，待部署到 Github Pages
cd os-checks && npm install && npm run generate && cp -LR dist /check/
