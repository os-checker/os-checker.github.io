# node:lts 包含完整的 debian 环境
FROM node:lts
# 下载最新的 nightly Rust 工具链
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain none -y && \
    . "$HOME/.cargo/env" && \
    rustup toolchain install nightly --allow-downgrade --profile minimal --component rustfmt,clippy,miri && \
    rustup target add all # 安装所有 targets
# 把该仓库内容复制进镜像
COPY . /ci
WORKDIR /ci
# 运行 os-checker 并构建静态网页
CMD ["./run.sh"]
