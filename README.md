# os-checker WebUI

将 [os-checker CLI](https://github.com/os-checker/os-checker) 生成的检查和统计结果，通过
Docker 部署成静态网页。

该仓库作为除 os-checker CLI 之外剩余的实施步骤，提供以下功能：
* 提供 Dockerfile，来生成相应的检查报告，该报告是由 Vue/Nuxt 框架制作而成的静态网页应用程序。
  * 如果你希望将仓库纳入检查，可对 `repos.yaml` 增加 [`user/repo`](https://github.com/os-checker/os-checker/issues/5) 来提交 PR。
* 【尚未实施】存放代码库的检查历史数据，用以制作时间维度的统计数据。
* 作为 os-checker CLI 的测试 CI。

[![](https://github.com/user-attachments/assets/b0a02af6-e602-4fc2-9cdf-37c7ec01c41b)](https://docs.qq.com/slide/DTG5RWlpaU1JibmZk)


说明：该 Dockerfile 已经制作了镜像，你可以通过 [`zjpzjp/os-checker:latest`](https://hub.docker.com/repository/docker/zjpzjp/os-checker)
拉取使用，而无需本仓库。
