# Unit Test Generator

A powerful tool that automatically generates comprehensive unit tests for your code methods.

## Features

- **Comprehensive Coverage**: Generates tests for normal, edge case, and error scenarios
- **Smart Mocking**: Automatically handles external dependencies with mocks
- **Clear Assertions**: Provides complete and readable assertion statements
- **Consistent Style**: Maintains the same code style as your project
- **Detailed Comments**: Adds necessary documentation comments

## Installation

```bash
npm install -g unit-test-generator
```

Or use locally:

```bash
npm link
```

## Usage

```bash
unit-test-generator [options]
```

### Options

- `--file <path>`: Path to the source file containing the method
- `--method <name>`: Name of the method to generate tests for
- `--output <path>`: Output path for the generated test file
- `--config <file>`: Path to custom configuration file
- `--framework <name>`: Test framework to use (jest, mocha, junit, etc.)
- `--verbose`: Show detailed output
- `--help`: Show help message

## Examples

Generate tests for a specific method:
```bash
unit-test-generator --file ./src/utils.js --method calculateTotal
```

Specify test framework:
```bash
unit-test-generator --file ./src/api.ts --method getUser --framework jest
```

Use custom configuration:
```bash
unit-test-generator --config .unittestconfig.json
```

Verbose output:
```bash
unit-test-generator --file ./src/service.js --method processData --verbose
```

## Configuration

Create a `.unittestconfig` file in your project root:

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

## Supported Languages and Frameworks

- JavaScript/TypeScript (Jest, Mocha)
- Java (JUnit, TestNG)
- Python (pytest, unittest)
- C# (NUnit, xUnit)
- Go (testing package)

## Generated Test Structure

The tool generates tests following the AAA pattern (Arrange-Act-Assert):

```javascript
describe('methodName', () => {
  // Normal scenario
  it('should handle valid input correctly', () => {
    // Arrange
    const input = validTestData;
    
    // Act
    const result = methodName(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });

  // Edge case
  it('should handle null input gracefully', () => {
    // Arrange
    const input = null;
    
    // Act & Assert
    expect(() => methodName(input)).not.toThrow();
  });

  // Error case
  it('should throw error for invalid input', () => {
    // Arrange
    const input = invalidTestData;
    
    // Act & Assert
    expect(() => methodName(input)).toThrow(Error);
  });
});
```

## Best Practices

1. **Review Generated Tests**: Always review and adjust generated tests to match your business logic
2. **Customize Mocks**: Complex external dependencies may require manual mock configuration
3. **Maintain Test Independence**: Each test should run independently
4. **Follow Naming Conventions**: Test names should clearly describe the test scenario
5. **Update Regularly**: Regenerate tests when methods change significantly

## Integration

This tool can be integrated into your development workflow:

1. Generate tests when writing new features
2. Regenerate tests after refactoring code
3. Check test coverage during code reviews
4. Run generated tests in CI/CD pipelines

## License

MIT
