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
# 把 os-checks 目录的内容展平到 /os-checks 下
# 注意：这里不能指定为 /check，貌似因为它已经是挂载卷，如果现在复制文件过去，容器运行后该 
#       /check 目录为空（因为 github action runner 的这个目录为空）
COPY os-checks/ /os-checks
WORKDIR /os-checks
CMD ls -alh && echo $PWD && ls -alh / && npm install && npm run generate && \
    cp -LR dist /check/
