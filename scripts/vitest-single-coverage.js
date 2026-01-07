import {spawnSync} from 'child_process';

// Get the test filter from command-line arguments.
const regexFileInput = process.argv[2];

if (!regexFileInput) {
  console.error('Usage: node vitest-single-coverage.js <regex_filter>');
  console.error('Example: node vitest-single-coverage.js "env.adapter"');
  process.exit(1);
}

// The regex for the source file path
const sourceFileRegex = regexFileInput.replace('.test', '');

// The command to run Vitest
const vitestArgs = ['run', regexFileInput, '--coverage.include', `src/**/*${sourceFileRegex}*`];

console.log(`Running Vitest with: vitest ${vitestArgs.join(' ')}`);

// Execute Vitest
const result = spawnSync('vitest', vitestArgs, {
  stdio: 'inherit',
});

// Exit with Vitest's exit code
process.exit(result.status);
