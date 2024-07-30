# # 使用官方 Rust 镜像作为基础镜像  
# FROM rustlang/rust:nightly  
#
# # 安装必要的软件包  
# RUN apt-get update && apt-get install -y build-essential  
#
# COPY ./docker/run.sh .
#
# # 指定容器启动时运行的命令  
# CMD ["./run.sh"]

# 构建静态网页
FROM node:lts
WORKDIR /check
# 把 os-checks 目录的内容展平到 /check
COPY os-checks .
CMD ls -alh && echo $PWD && ls -alh / && npm install && npm run generate
# cp -LR dist /check/
