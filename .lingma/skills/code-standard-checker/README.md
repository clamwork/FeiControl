# Code Standard Checker

A tool to check code against defined coding standards and best practices.

## Installation

```bash
npm install -g code-standard-checker
```

Or use locally:

```bash
npm link
```

## Usage

```bash
code-standard-checker [options]
```

### Options

- `--path <directory>`: Specify the directory to check (default: current directory)
- `--config <file>`: Path to custom configuration file
- `--fix`: Automatically fix issues where possible
- `--verbose`: Show detailed output
- `--help`: Show help message

## Configuration

Create a `.codestandardrc` file in your project root:

```json
{
  "rules": {
    "indentation": "4 spaces",
    "maxLineLength": 100,
    "namingConvention": "camelCase"
  }
}
```

## Rules

### Indentation
Checks that indentation is consistent with the configured style (spaces or tabs).

### Line Length
Ensures lines don't exceed the maximum allowed length.

### Naming Convention
Validates that variable and function names follow the specified convention.

## Examples

Check current directory:
```bash
code-standard-checker
```

Check specific directory:
```bash
code-standard-checker --path ./src
```

Use custom config:
```bash
code-standard-checker --config .my-codestandardrc.json
```

Auto-fix issues:
```bash
code-standard-checker --fix
```

Verbose output:
```bash
code-standard-checker --verbose
```

## Integration

This tool can be integrated into CI/CD pipelines to enforce coding standards automatically.

## License

MIT
