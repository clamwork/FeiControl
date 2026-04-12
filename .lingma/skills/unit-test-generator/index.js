#!/usr/bin/env node

/**
 * Unit Test Generator - Main executable
 * Generates comprehensive unit tests for selected code methods
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const defaultConfig = {
  testFramework: 'jest',
  mockLibrary: 'jest-mock',
  coverageTarget: 80,
  includeEdgeCases: true,
  includeErrorCases: true,
  language: 'auto-detect'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    method: null,
    output: null,
    config: null,
    framework: null,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        if (i + 1 < args.length) {
          options.file = args[++i];
        }
        break;
      case '--method':
        if (i + 1 < args.length) {
          options.method = args[++i];
        }
        break;
      case '--output':
        if (i + 1 < args.length) {
          options.output = args[++i];
        }
        break;
      case '--config':
        if (i + 1 < args.length) {
          options.config = args[++i];
        }
        break;
      case '--framework':
        if (i + 1 < args.length) {
          options.framework = args[++i];
        }
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        showHelp();
        process.exit(1);
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
Unit Test Generator v1.0.0

Usage: unit-test-generator [options]

Options:
  --file <path>        Path to the source file containing the method
  --method <name>      Name of the method to generate tests for
  --output <path>      Output path for the generated test file
  --config <file>      Path to custom configuration file
  --framework <name>   Test framework to use (jest, mocha, junit, etc.)
  --verbose            Show detailed output
  --help               Show this help message

Examples:
  unit-test-generator --file ./src/utils.js --method calculateTotal
  unit-test-generator --file ./src/api.ts --method getUser --framework jest
  unit-test-generator --config .unittestconfig.json
  `);
}

// Load configuration
function loadConfig(configPath) {
  if (configPath && fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return { ...defaultConfig, ...JSON.parse(configContent) };
    } catch (error) {
      console.error(`Error reading config file ${configPath}:`, error.message);
      return defaultConfig;
    }
  } else {
    // Look for .unittestconfig in current directory
    const localConfigPath = path.join(process.cwd(), '.unittestconfig');
    if (fs.existsSync(localConfigPath)) {
      try {
        const configContent = fs.readFileSync(localConfigPath, 'utf8');
        return { ...defaultConfig, ...JSON.parse(configContent) };
      } catch (error) {
        console.error(`Error reading local config file ${localConfigPath}:`, error.message);
        return defaultConfig;
      }
    }
    return defaultConfig;
  }
}

// Detect language from file extension
function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.py': 'python',
    '.cs': 'csharp',
    '.go': 'go'
  };
  
  return languageMap[ext] || 'unknown';
}

// Parse method signature (simplified implementation)
function parseMethodSignature(content, methodName) {
  // This is a simplified parser - a real implementation would be much more sophisticated
  const lines = content.split('\n');
  let inMethod = false;
  let methodStart = -1;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for method definition
    if (line.includes(methodName) && (line.includes('function') || line.includes('def ') || line.includes('public ') || line.includes('private ') || line.includes('protected '))) {
      inMethod = true;
      methodStart = i;
      continue;
    }
    
    if (inMethod) {
      // Count braces to find method end
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      if (braceCount <= 0 && methodStart !== -1) {
        // Found the end of the method
        return {
          startLine: methodStart,
          endLine: i,
          content: lines.slice(methodStart, i + 1).join('\n')
        };
      }
    }
  }
  
  return null;
}

// Generate test cases based on method analysis
function generateTestCases(methodInfo, config, language) {
  const testCases = [];
  
  // Normal scenario tests
  testCases.push({
    type: 'normal',
    description: 'should handle valid input correctly',
    setup: '// Setup valid test data',
    action: '// Call the method with valid input',
    assertion: '// Assert expected result'
  });
  
  // Edge case tests
  if (config.includeEdgeCases) {
    testCases.push({
      type: 'edge',
      description: 'should handle null/undefined input gracefully',
      setup: '// Setup null/undefined test data',
      action: '// Call the method with edge case input',
      assertion: '// Assert appropriate handling'
    });
    
    testCases.push({
      type: 'edge',
      description: 'should handle empty input correctly',
      setup: '// Setup empty test data',
      action: '// Call the method with empty input',
      assertion: '// Assert appropriate handling'
    });
  }
  
  // Error case tests
  if (config.includeErrorCases) {
    testCases.push({
      type: 'error',
      description: 'should throw error for invalid input',
      setup: '// Setup invalid test data',
      action: '// Call the method with invalid input',
      assertion: '// Assert that appropriate error is thrown'
    });
  }
  
  return testCases;
}

// Generate test file content
function generateTestFile(methodName, testCases, config, language) {
  let testContent = '';
  
  switch (config.testFramework) {
    case 'jest':
      testContent = generateJestTests(methodName, testCases, language);
      break;
    case 'mocha':
      testContent = generateMochaTests(methodName, testCases, language);
      break;
    case 'junit':
      testContent = generateJUnitTests(methodName, testCases, language);
      break;
    default:
      testContent = generateJestTests(methodName, testCases, language);
  }
  
  return testContent;
}

// Generate Jest test format
function generateJestTests(methodName, testCases, language) {
  let content = `// Auto-generated unit tests for ${methodName}\n`;
  content += `// Generated on: ${new Date().toISOString()}\n\n`;
  
  content += `describe('${methodName}', () => {\n`;
  
  for (const testCase of testCases) {
    content += `\n  // ${testCase.type.toUpperCase()} SCENARIO TEST\n`;
    content += `  it('${testCase.description}', () => {\n`;
    content += `    // Arrange\n`;
    content += `    ${testCase.setup}\n\n`;
    content += `    // Act\n`;
    content += `    ${testCase.action}\n\n`;
    content += `    // Assert\n`;
    content += `    ${testCase.assertion}\n`;
    content += `  });\n`;
  }
  
  content += `});\n`;
  
  return content;
}

// Generate Mocha test format
function generateMochaTests(methodName, testCases, language) {
  // Similar to Jest but with Mocha syntax
  return generateJestTests(methodName, testCases, language); // For simplicity
}

// Generate JUnit test format
function generateJUnitTests(methodName, testCases, language) {
  let content = `// Auto-generated unit tests for ${methodName}\n`;
  content += `// Generated on: ${new Date().toISOString()}\n\n`;
  
  content += `import org.junit.Test;\n`;
  content += `import static org.junit.Assert.*;\n\n`;
  
  content += `public class ${methodName.charAt(0).toUpperCase() + methodName.slice(1)}Test {\n`;
  
  for (const testCase of testCases) {
    content += `\n    // ${testCase.type.toUpperCase()} SCENARIO TEST\n`;
    content += `    @Test\n`;
    content += `    public void test${testCase.description.replace(/\s+/g, '')}() {\n`;
    content += `        // Arrange\n`;
    content += `        // ${testCase.setup}\n\n`;
    content += `        // Act\n`;
    content += `        // ${testCase.action}\n\n`;
    content += `        // Assert\n`;
    content += `        // ${testCase.assertion}\n`;
    content += `    }\n`;
  }
  
  content += `}\n`;
  
  return content;
}

// Main function to generate tests
function generateTests(options, config) {
  if (!options.file) {
    console.error('Error: --file option is required');
    process.exit(1);
  }
  
  if (!fs.existsSync(options.file)) {
    console.error(`Error: File ${options.file} does not exist`);
    process.exit(1);
  }
  
  // Read source file
  const sourceContent = fs.readFileSync(options.file, 'utf8');
  const language = config.language === 'auto-detect' ? 
                   detectLanguage(options.file) : 
                   config.language;
  
  console.log(`🧪 Unit Test Generator v1.0.0`);
  console.log(`Source file: ${options.file}`);
  console.log(`Detected language: ${language}`);
  console.log(`Test framework: ${config.testFramework}`);
  console.log('');
  
  // If method name is provided, parse specific method
  if (options.method) {
    const methodInfo = parseMethodSignature(sourceContent, options.method);
    if (!methodInfo) {
      console.error(`Error: Method "${options.method}" not found in ${options.file}`);
      process.exit(1);
    }
    
    console.log(`Found method: ${options.method}`);
    console.log(`Lines: ${methodInfo.startLine + 1} - ${methodInfo.endLine + 1}`);
    console.log('');
    
    // Generate test cases
    const testCases = generateTestCases(methodInfo, config, language);
    
    // Generate test file content
    const testContent = generateTestFile(options.method, testCases, config, language);
    
    // Determine output path
    const outputPath = options.output || determineTestOutputPath(options.file, options.method, config.testFramework);
    
    // Write test file
    fs.writeFileSync(outputPath, testContent);
    console.log(`✅ Generated test file: ${outputPath}`);
    console.log(`📊 Generated ${testCases.length} test cases`);
    
    if (options.verbose) {
      console.log('\nGenerated test cases:');
      testCases.forEach((tc, index) => {
        console.log(`  ${index + 1}. [${tc.type.toUpperCase()}] ${tc.description}`);
      });
    }
    
  } else {
    // Generate tests for entire file (simplified approach)
    console.log('Generating tests for entire file...');
    
    // For now, just create a basic test structure
    const fileName = path.basename(options.file, path.extname(options.file));
    const testCases = [
      {
        type: 'normal',
        description: 'should load module correctly',
        setup: '// Setup test environment',
        action: '// Import and initialize module',
        assertion: '// Assert module loaded successfully'
      }
    ];
    
    const testContent = generateTestFile(fileName, testCases, config, language);
    const outputPath = options.output || determineTestOutputPath(options.file, fileName, config.testFramework);
    
    fs.writeFileSync(outputPath, testContent);
    console.log(`✅ Generated test file: ${outputPath}`);
  }
}

// Determine test output path
function determineTestOutputPath(sourceFile, methodName, framework) {
  const dir = path.dirname(sourceFile);
  const ext = path.extname(sourceFile);
  const baseName = path.basename(sourceFile, ext);
  
  let testExt = '.test.js';
  let prefix = '';
  
  switch (framework) {
    case 'jest':
      testExt = '.test.js';
      break;
    case 'mocha':
      testExt = '.spec.js';
      break;
    case 'junit':
      testExt = 'Test.java';
      prefix = '';
      break;
    default:
      testExt = '.test.js';
  }
  
  return path.join(dir, `${prefix}${baseName}${testExt}`);
}

// Main execution
function main() {
  const options = parseArgs();
  const config = loadConfig(options.config);
  
  // Override config with command line options
  if (options.framework) {
    config.testFramework = options.framework;
  }
  
  generateTests(options, config);
}

main();
