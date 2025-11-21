# 多环境管理策略 (Dev / Staging / Prod)

在实际开发中，区分环境至关重要。Terraform 提供了两种主要方式来实现这一点。

## 方案 1：Terraform Workspaces（轻量级）
这是最简单的起步方式。你只需要一套 `.tf` 代码，但在不同的“工作区”中运行，每个工作区有独立的状态文件。

### 如何使用
1.  **创建工作区**：
    ```bash
    terraform workspace new dev
    terraform workspace new staging
    terraform workspace new prod
    ```
2.  **切换环境**：
    ```bash
    terraform workspace select dev
    ```
3.  **代码适配**：
    在代码中，使用 `terraform.workspace` 变量来区分配置。
    ```hcl
    resource "kubernetes_namespace" "app" {
      metadata {
        # 结果可能是 "image-hosting-dev" 或 "image-hosting-prod"
        name = "image-hosting-${terraform.workspace}"
      }
    }
    ```

---

## 方案 2：目录分离（推荐，更稳健）
对于生产级项目，我们通常建议**物理隔离**配置文件。这样可以清楚地看到每个环境的差异（比如 Prod 用大机器，Dev 用小机器）。

### 推荐目录结构
我们将通用的逻辑提取为 **Module**，然后在每个环境目录中调用它。

```text
infra/terraform/
├── modules/                 # 通用逻辑
│   └── image-hosting/       # 我们现在的 main.tf 移动到这里
│       ├── main.tf
│       ├── variables.tf
│       └── providers.tf
└── environments/            # 具体环境
    ├── dev/
    │   ├── main.tf          # 调用 module，传入 dev 的变量
    │   └── backend.tf       # dev 的状态存储位置
    ├── staging/
    │   └── ...
    └── prod/
        ├── main.tf          # 调用 module，传入 prod 的变量
        └── backend.tf       # prod 的状态存储位置
```

### `environments/prod/main.tf` 示例
```hcl
module "app" {
  source      = "../../modules/image-hosting"
  app_version = var.app_version
  
  # Prod 环境特定配置
  replica_count = 3
  minio_bucket  = "prod-images"
}
```

---

## CI/CD 分支策略
配合 GitHub Actions，我们通常使用**分支**来对应环境。

| 分支 | 环境 | 触发条件 |
| :--- | :--- | :--- |
| `feature/*` | Dev | Pull Request |
| `develop` | Staging | Push to develop |
| `main` | Prod | Release Tag (e.g., `v1.0.0`) |

### 修改 Workflow (`.github/workflows/deploy.yml`)
我们需要根据分支名动态决定去哪个目录运行 Terraform。

```yaml
jobs:
  deploy:
    steps:
      - name: Set Environment
        id: env
        run: |
          if [[ ${{ github.ref }} == 'refs/heads/main' ]]; then
            echo "dir=infra/terraform/environments/prod" >> $GITHUB_OUTPUT
          elif [[ ${{ github.ref }} == 'refs/heads/develop' ]]; then
            echo "dir=infra/terraform/environments/staging" >> $GITHUB_OUTPUT
          else
            echo "dir=infra/terraform/environments/dev" >> $GITHUB_OUTPUT
          fi

      - name: Terraform Apply
        working-directory: ${{ steps.env.outputs.dir }}
        run: terraform apply -auto-approve
```

## 总结
1.  **短期**：如果你想快速上手，使用 **Workspaces**。
2.  **长期**：建议重构为 **目录分离 + Modules** 结构。这虽然初期麻烦一点，但维护起来更清晰，不容易因为改错变量而误伤生产环境。
