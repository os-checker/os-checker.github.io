# 使用官方 Rust 镜像作为基础镜像  
FROM rustlang/rust:nightly  

# 安装必要的软件包  
RUN apt-get update && apt-get install -y build-essential  
  
# 复制 Rust 项目到容器内  
COPY . .  
  
# 编译 Rust 项目  
RUN cargo build --release  
  
# 指定容器启动时运行的命令  
CMD ["./target/release/hi"]

