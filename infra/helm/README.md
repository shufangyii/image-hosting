# Image Hosting 项目 Helm 指南

## 什么是 Helm？
Helm 是 **Kubernetes 的包管理器**。你可以把它想象成 Node.js 的 `npm`，Ubuntu 的 `apt`，或者 macOS 的 `brew`。

Helm 允许你将应用程序的所有 Kubernetes 资源（如 Deployment, Service, Secret, Ingress 等）打包成一个单一的单元，称为 **Chart**，而不是手动管理几十个独立的 YAML 文件。

### 核心概念
1.  **Chart（图表）**: 描述一组相关 Kubernetes 资源的集合。
    - 我们为 `frontend`（前端）、`backend`（后端）和 `service`（Rust 服务）分别创建了 Chart。
    - 我们还有一个 **Umbrella Chart（总 Chart）** (`image-hosting`)，用于将它们组合在一起管理。
2.  **Values (`values.yaml`)**: 配置接口。你可以在这里修改设置（如镜像标签、端口、环境变量），而无需触碰实际的模板代码。
3.  **Release（发布）**: 运行在 Kubernetes 集群中的 Chart 实例。你可以多次安装同一个 Chart 作为不同的 Release（例如 `dev-release`, `staging-release`）。
4.  **Template（模板）**: 带有占位符的 Kubernetes YAML 文件（例如 `image: {{ .Values.image.repository }}`）。Helm 会使用 `values.yaml` 中的值来填充这些占位符。

---

## 我们的项目结构

```text
infra/helm/
├── charts/              # 组件 Charts
│   ├── frontend/        # Nginx + Vue 应用
│   ├── backend/         # NestJS 应用
│   └── service/         # Rust gRPC 服务
└── image-hosting/       # Umbrella Chart (你安装的那个)
    ├── Chart.yaml       # 定义依赖关系 (frontend, backend, service, minio)
    └── values.yaml      # 全局配置
```

## 分步使用指南

### 1. 前置条件
确保你已经安装了：
- **Helm** (`brew install helm`)。
- 一个运行中的 Kubernetes 集群（例如 Docker Desktop K8s, Minikube, 或 Kind）。
- **Kubectl** 并已配置好连接到你的集群。

### 2. 准备依赖
我们的 Umbrella Chart 依赖于 `minio`（来自外部仓库）和我们的本地 Charts。我们需要先下载/构建这些依赖。

```bash
# 进入 Umbrella Chart 目录
cd infra/helm/image-hosting

# 更新依赖（这会下载 Minio chart）
helm dependency build
```

### 3. Dry Run（试运行/验证）
在安装之前，查看 Helm 将生成的 YAML 是一个好习惯。这被称为 "Dry Run"。

```bash
# 从项目根目录运行
helm install my-release infra/helm/image-hosting --dry-run --debug
```
这将在终端打印出所有的 Kubernetes YAML 清单，而不会实际应用它们。

### 4. 安装应用
将所有内容（前端、后端、服务、Minio）部署到你的集群：

```bash
helm install image-hosting-app infra/helm/image-hosting
```
- `image-hosting-app`: 你给这个 Release 起的名字。
- `infra/helm/image-hosting`: 我们的 Chart 路径。

### 5. 检查状态
```bash
helm list
kubectl get pods
```

### 6. 升级
如果你修改了值（例如在 `values.yaml` 中更新了环境变量）或修改了代码，可以使用 `upgrade` 应用更改：

```bash
helm upgrade image-hosting-app infra/helm/image-hosting
```

### 7. 卸载
要删除所有内容：

```bash
helm uninstall image-hosting-app
```

## 常用自定义
要在不编辑文件的情况下更改配置，可以使用 `--set` 标志或自定义 values 文件。

**示例：动态更改后端环境变量**
```bash
helm install my-app infra/helm/image-hosting \
  --set backend.env.SOME_VAR="new_value"
```
