# 贡献指南

感谢你对本项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

1. 在 [Issues](../../issues) 中搜索是否已有相同问题
2. 如果没有，创建一个新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 预期行为与实际行为
   - 环境信息（Node.js 版本、Taro 版本、微信开发者工具版本）

### 提交功能建议

1. 在 [Issues](../../issues) 中创建 Feature Request
2. 说明使用场景和期望的实现方式

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/your-feature`
3. 提交你的修改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 创建一个 Pull Request

## 开发规范

### 代码风格

- 使用项目已有的 ESLint + Prettier 配置
- 提交前会自动运行 lint-staged 检查
- 组件使用 PascalCase，工具函数使用 camelCase

### 提交信息规范

使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整（不影响逻辑）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

### 测试

- 新增功能请补充对应的单元测试
- 运行 `npm test` 确保所有测试通过
- 运行 `npm run test:coverage` 查看覆盖率

## 许可证

提交代码即表示你同意将你的贡献以 MIT 许可证发布。
