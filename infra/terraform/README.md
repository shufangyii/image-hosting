# Image Hosting 项目 Terraform 指南

## 什么是 Terraform？
Terraform 是一个 **基础设施即代码 (IaC)** 工具。
如果说 Helm 是管理 Kubernetes **内部** 应用的工具，那么 Terraform 通常用于管理 **外部** 基础设施（如 AWS EC2, S3, RDS，或者 Kubernetes 集群本身）。

在这个项目中，我们使用 Terraform 来：
1.  创建一个 Kubernetes **Namespace** (`image-hosting`)。
2.  使用 Terraform 的 Helm Provider 来部署我们在上一步创建的 **Helm Chart**。

这样做的好处是，你可以用代码管理整个生命周期，包括命名空间的创建和应用的部署。

## 目录结构

```text
infra/terraform/
├── main.tf        # 定义资源 (Namespace, Helm Release)
├── providers.tf   # 定义插件 (Kubernetes, Helm)
├── variables.tf   # 定义变量 (Kubeconfig 路径, Context)
└── README.md      # 本指南
```

## 分步使用指南

### 1. 前置条件
- **Terraform** 已安装 (`brew install terraform`)。
- 确保你的 Kubernetes 集群正在运行。

### 2. 初始化
进入 Terraform 目录并初始化。这会下载必要的插件（Providers）。

```bash
cd infra/terraform
terraform init
```

### 3. 配置变量 (可选)
默认情况下，我们假设你使用的是 `docker-desktop` 上下文。如果你使用的是 `minikube` 或其他集群，你需要修改 `variables.tf` 或者创建一个 `terraform.tfvars` 文件：

```hcl
# terraform.tfvars
kube_context = "minikube"
```

### 4. 计划 (Plan)
查看 Terraform 将要执行的操作。这类似于 Helm 的 "Dry Run"。

```bash
terraform plan
```
你应该能看到它计划创建一个 Namespace 和一个 Helm Release。

### 5. 应用 (Apply)
执行部署。

```bash
terraform apply
```
输入 `yes` 确认。

### 6. 验证
```bash
kubectl get ns image-hosting
kubectl get pods -n image-hosting
```

### 7. 销毁 (Destroy)
如果你想清理所有资源（包括 Namespace 和应用）：

```bash
terraform destroy
```

## 为什么同时使用 Helm 和 Terraform？
- **Helm** 擅长打包和管理应用及其依赖（微服务）。
- **Terraform** 擅长管理基础设施状态和依赖关系。
- 结合使用：我们用 Terraform 来“驱动” Helm。这样我们可以确保在部署 Helm Chart 之前，基础设施（如 Namespace，或者未来的云数据库）已经准备就绪。
