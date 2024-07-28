# 使用官方 Rust 镜像作为基础镜像  
FROM rustlang/rust:nightly  

# 安装必要的软件包  
RUN apt-get update && apt-get install -y build-essential  

# 实际的检查流程在 os-checker/ci
RUN git clone https://github.com/os-checker/ci.git
WORKDIR ci

# 指定容器启动时运行的命令  
CMD ["./run.sh"]

