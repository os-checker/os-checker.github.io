#!/bin/bash

cat $HOME/.bashrc

# Current dir: /ci
echo PWD=$PWD && ls -alh

# build & run Rust project
cargo r --release

# install latest os-checker
echo "DEBUG=$DEBUG"
# if [[ "$DEBUG" == 1 ]]; then
#   echo 'compile os-checker from github source'
#   git clone https://github.com/os-checker/os-checker.git
#   cargo install --path os-checker
#   export RUST_LOG=debug
# else
#   echo 'download os-checker from github release'
#   curl -s https://api.github.com/repos/os-checker/os-checker/releases/latest |
#     grep browser_download_url |
#     grep os-checker-installer.sh |
#     cut -d '"' -f 4 |
#     wget -qi -
#   echo 'os-checker-installer.sh is downloaded'
#   sh os-checker-installer.sh
# fi
# os-checker --help

# handle ansi via ansi2html or ansi2txt
# apt install -y colorized-logs

# prepare os-checker configuration file
# cp repos.yaml /check/
# cd /check
# Current dir: /check

# os-checker 2>&1 >summary.out
# echo '```text' >>summary.txt
# ansi2txt <summary.out >>summary.txt
# echo '```' >>summary.txt

# ls -alh && echo PWD = $PWD
# os-checker --emit test.json # to be moved into ci/os-checks/content

# github pages dir
# mkdir /check/.gh-pages
# ansi2html <summary.out >/check/.gh-pages/index.html
