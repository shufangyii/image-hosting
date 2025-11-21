# CI/CD 集成：动态更新部署

## 核心原理
Terraform 在 CI（如 GitHub Actions）中运行时，它的角色和你的**本地电脑**是一样的。它是一个“客户端”，需要连接到远程的 Kubernetes API Server 发送指令。

要让 CI 能够控制你的远程 VPS，你需要解决两个关键问题：**访问权限** 和 **状态管理**。

---

## 1. 访问权限 (连接到 K8s)
CI Runner 需要凭证才能与你 VPS 上的 Kubernetes 集群通信。

### 步骤
1.  **获取 Kubeconfig**：在你的 VPS 上，获取 `~/.kube/config` 文件的内容。
    *   *注意：确保 server 地址是公网 IP，而不是 `127.0.0.1` 或内网 IP。*
2.  **设置 Secret**：在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中，添加一个 Secret，例如 `KUBE_CONFIG`，粘贴刚才的内容。
3.  **CI 配置**：在 GitHub Actions Workflow 中，将这个 Secret 写入临时文件供 Terraform 使用。

```yaml
- name: Set up Kubeconfig
  run: |
    mkdir -p ~/.kube
    echo "${{ secrets.KUBE_CONFIG }}" > ~/.kube/config
```

---

## 2. 状态管理 (Remote State)
这是最容易被忽视的一点。
*   **问题**：Terraform 默认将状态保存在本地 (`terraform.tfstate`)。CI 每次运行都是一个全新的容器，运行结束后文件会被销毁。这意味着 Terraform 会“忘记”它之前部署过什么，导致重复创建或报错。
*   **解决**：必须使用 **Remote Backend**（远程后端）。

### 推荐方案：S3 / Minio / Terraform Cloud
最常用的是将状态文件保存在对象存储中（如 AWS S3 或你自建的 Minio）。

**修改 `infra/terraform/providers.tf`：**
```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "image-hosting/prod.tfstate"
    region = "us-east-1"
    # 如果使用 Minio 或其他兼容 S3 的服务，还需要配置 endpoint
  }
}
```
这样，无论 CI 运行多少次，它都会先从 S3 下载最新的状态文件，确保与真实环境同步。

---

## 总结：CI 完整流程

1.  **Checkout 代码**。
2.  **Build & Push**：构建 Docker 镜像并推送到仓库。
3.  **Setup Terraform**：安装 Terraform CLI。
4.  **Inject Secrets**：将 `KUBE_CONFIG` 写入 `~/.kube/config`。
5.  **Terraform Init**：初始化（连接到 Remote Backend 下载状态）。
6.  **Terraform Apply**：
    ```bash
    terraform apply -var="app_version=${GITHUB_SHA}" -auto-approve
    ```
    Terraform 读取状态 -> 对比 K8s 现状 -> 发现 Tag 变了 -> 调用 Helm 更新应用。
