# 单元测试生成技能

这个技能帮助开发者为选中的代码方法自动生成高质量的单元测试。

## 功能特点

- **全面覆盖**: 生成正常场景、边界场景和异常场景的测试用例
- **依赖模拟**: 自动使用 Mock 处理外部依赖
- **清晰断言**: 提供完整且易于理解的断言语句
- **风格一致**: 保持与原项目相同的代码风格
- **详细注释**: 添加必要的测试说明注释

## 使用方法

### 触发方式

您可以通过以下任一方式触发此技能：
- "生成单元测试"
- "写单测"
- "生成测试用例"
- "junit测试"

### 操作步骤

1. 在编辑器中选中需要生成测试的方法或类
2. 使用上述任一触发词调用技能
3. 技能将分析代码并生成相应的单元测试

## 生成的测试包含

### 1. 正常场景测试
- 验证方法在预期输入下的正确行为
- 检查返回值是否符合预期

### 2. 边界场景测试
- 空值/null 输入处理
- 极端数值测试
- 空集合/数组处理
- 最大/最小值测试

### 3. 异常场景测试
- 无效参数处理
- 异常情况抛出
- 错误状态处理

### 4. Mock 外部依赖
- 数据库连接模拟
- API 调用模拟
- 文件系统操作模拟
- 第三方服务模拟

## 示例输出格式

```javascript
// 测试文件: methodName.test.js
describe('methodName', () => {
  // 正常场景
  it('should handle valid input correctly', () => {
    // 测试实现
  });

  // 边界场景
  it('should handle null input gracefully', () => {
    // 测试实现
  });

  // 异常场景
  it('should throw error for invalid input', () => {
    // 测试实现
  });
});
```

## 配置选项

您可以在项目中创建 `.unittestconfig` 文件来自定义测试生成行为：

```json
{
  "testFramework": "jest",
  "mockLibrary": "jest-mock",
  "coverageTarget": 80,
  "includeEdgeCases": true,
  "includeErrorCases": true,
  "language": "auto-detect"
}
```

## 支持的语言和框架

- JavaScript/TypeScript (Jest, Mocha)
- Java (JUnit, TestNG)
- Python (pytest, unittest)
- C# (NUnit, xUnit)
- Go (testing package)

## 最佳实践

1. **保持测试独立**: 每个测试用例应该独立运行
2. **命名清晰**: 测试名称应清楚描述测试场景
3. **AAA 模式**: 遵循 Arrange-Act-Assert 模式
4. **单一职责**: 每个测试只验证一个行为
5. **可重复性**: 测试结果应该是确定性的

## 注意事项

- 生成的测试需要根据具体业务逻辑进行调整
- 复杂的外部依赖可能需要手动配置 Mock
- 建议审查生成的测试以确保符合项目规范
- 对于异步代码，确保正确处理 Promise/async-await

## 集成到工作流

此技能可以集成到您的开发工作流程中：

1. 编写新功能时立即生成测试
2. 重构代码后重新生成测试
3. 代码审查时检查测试覆盖率
4. CI/CD 管道中运行生成的测试
