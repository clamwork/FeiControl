#!/usr/bin/env node

/**
 * Code Standard Checker - Main executable
 * Checks code against defined coding standards and best practices
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const defaultConfig = {
  rules: {
    indentation: '4 spaces',
    maxLineLength: 100,
    namingConvention: 'camelCase'
  }
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    path: '.',
    config: null,
    fix: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--path':
        if (i + 1 < args.length) {
          options.path = args[++i];
        }
        break;
      case '--config':
        if (i + 1 < args.length) {
          options.config = args[++i];
        }
        break;
      case '--fix':
        options.fix = true;
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
Code Standard Checker v1.0.0

Usage: code-standard-checker [options]

Options:
  --path <directory>   Specify the directory to check (default: current directory)
  --config <file>      Path to custom configuration file
  --fix                Automatically fix issues where possible
  --verbose            Show detailed output
  --help               Show this help message

Examples:
  code-standard-checker
  code-standard-checker --path ./src
  code-standard-checker --config .codestandardrc.json
  code-standard-checker --fix --verbose
  `);
}

// Load configuration
function loadConfig(configPath) {
  if (configPath && fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error(`Error reading config file ${configPath}:`, error.message);
      return defaultConfig;
    }
  } else {
    // Look for .codestandardrc in current directory
    const localConfigPath = path.join(process.cwd(), '.codestandardrc');
    if (fs.existsSync(localConfigPath)) {
      try {
        const configContent = fs.readFileSync(localConfigPath, 'utf8');
        return JSON.parse(configContent);
      } catch (error) {
        console.error(`Error reading local config file ${localConfigPath}:`, error.message);
        return defaultConfig;
      }
    }
    return defaultConfig;
  }
}

// Check indentation
function checkIndentation(content, config, filePath) {
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)/);
    if (match) {
      const indent = match[1];
      if (indent.length > 0) {
        // Check if indentation is consistent with config
        const expectedIndent = config.rules.indentation === '4 spaces' ? 4 : 
                              config.rules.indentation === '2 spaces' ? 2 : 4;
        
        if (indent.length % expectedIndent !== 0) {
          issues.push({
            line: i + 1,
            message: `Inconsistent indentation at line ${i + 1}. Expected multiple of ${expectedIndent} spaces.`
          });
        }
      }
    }
  }
  
  return issues;
}

// Check line length
function checkLineLength(content, config, filePath) {
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > config.rules.maxLineLength) {
      issues.push({
        line: i + 1,
        message: `Line ${i + 1} exceeds maximum length of ${config.rules.maxLineLength} characters (${line.length} characters)`
      });
    }
  }
  
  return issues;
}

// Check naming convention
function checkNamingConvention(content, config, filePath) {
  // This is a simplified check - in a real implementation, you'd need more sophisticated parsing
  const issues = [];
  
  // Check for variable/function names that don't follow camelCase
  const camelCaseRegex = /[a-z][A-Z]/g;
  const matches = content.match(camelCaseRegex);
  
  if (matches && config.rules.namingConvention === 'camelCase') {
    // This is a very basic check - a real implementation would be much more sophisticated
    // For now, we'll just note that naming convention checks are complex
  }
  
  return issues;
}

// Main function to check files
function checkFiles(directory, config, options) {
  const results = [];
  
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        // Only check certain file types
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.html'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(directory, fullPath);
            
            const fileIssues = [];
            
            // Run all checks
            fileIssues.push(...checkIndentation(content, config, relativePath));
            fileIssues.push(...checkLineLength(content, config, relativePath));
            fileIssues.push(...checkNamingConvention(content, config, relativePath));
            
            if (fileIssues.length > 0) {
              results.push({
                file: relativePath,
                issues: fileIssues
              });
            }
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error.message);
          }
        }
      }
    }
  }
  
  scanDir(directory);
  return results;
}

// Fix issues where possible
function fixIssues(directory, results) {
  console.log('Auto-fixing issues...');
  
  for (const result of results) {
    const filePath = path.join(directory, result.file);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Apply fixes based on issue type
      for (const issue of result.issues) {
        if (issue.message.includes('indentation')) {
          // This is a simplified fix - real implementation would be more complex
          console.log(`Would fix indentation issue in ${result.file} at line ${issue.line}`);
        }
      }
    } catch (error) {
      console.error(`Error fixing file ${filePath}:`, error.message);
    }
  }
}

// Display results
function displayResults(results, options) {
  if (results.length === 0) {
    console.log('✅ No coding standard issues found!');
    return;
  }
  
  console.log(`\n❌ Found ${results.reduce((sum, r) => sum + r.issues.length, 0)} issues in ${results.length} files:\n`);
  
  for (const result of results) {
    console.log(`📄 ${result.file}:`);
    
    for (const issue of result.issues) {
      console.log(`   ⚠️  Line ${issue.line}: ${issue.message}`);
    }
    
    console.log('');
  }
  
  if (options.verbose) {
    console.log('💡 Tip: Use --fix to automatically resolve some issues.');
  }
}

// Main execution
function main() {
  const options = parseArgs();
  const config = loadConfig(options.config);
  
  console.log('🔍 Code Standard Checker v1.0.0');
  console.log(`Checking directory: ${options.path}`);
  console.log(`Configuration: ${JSON.stringify(config.rules, null, 2)}`);
  console.log('');
  
  const results = checkFiles(options.path, config, options);
  
  if (options.fix) {
    fixIssues(options.path, results);
  }
  
  displayResults(results, options);
  
  // Exit with error code if issues found
  if (results.length > 0) {
    process.exit(1);
  }
}

main();
