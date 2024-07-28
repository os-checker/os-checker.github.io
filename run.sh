#!/bin/sh

# clone ci repo & build
git clone https://github.com/os-checker/ci.git
cd ci
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
