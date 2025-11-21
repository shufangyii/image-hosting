# Terraform Infrastructure Guide (中文版)

本项目使用 Terraform 来管理 Kubernetes 基础设施。为了支持多环境（Dev/Staging/Prod），我们采用了 **Module + 目录分离** 的架构。

## 目录结构

```text
infra/terraform/
├── modules/                 # 通用逻辑模块
│   └── image-hosting/       # 核心应用模块
│       ├── main.tf          # 资源定义 (Namespace, Helm Release)
│       ├── variables.tf     # 输入变量
│       └── versions.tf      # Provider 版本要求
└── environments/            # 具体环境配置
    ├── dev/                 # 开发环境
    │   ├── main.tf          # 调用 module
    │   ├── providers.tf     # Backend 和 Provider 配置
    │   └── variables.tf     # 变量定义
    ├── staging/             # 预发布环境
    └── prod/                # 生产环境
```

## 快速开始

### 1. 前置条件
*   已安装 Terraform
*   已配置 `~/.kube/config` (或者设置 `KUBE_CONFIG_PATH`)

### 2. 部署开发环境 (Dev)

进入开发环境目录：
```bash
cd infra/terraform/environments/dev
```

初始化（下载 Provider 和 Module）：
```bash
terraform init
```

查看计划：
```bash
terraform plan
```

应用更改：
```bash
terraform apply
```

### 3. 部署到其他环境
步骤同上，只需进入 `environments/staging` 或 `environments/prod` 目录即可。

## CI/CD 集成
GitHub Actions Workflow (`.github/workflows/deploy.yml`) 会根据分支自动选择环境：
*   `feature/*` -> `dev` (需自定义触发规则，目前默认非 main/develop 走 dev)
*   `develop` -> `staging`
*   `main` -> `prod`

## 状态管理 (State)
默认配置为本地状态 (`local`)。在生产环境中，请务必在 `providers.tf` 中配置 **Remote Backend** (如 S3)，以确保团队协作和 CI/CD 的状态一致性。
