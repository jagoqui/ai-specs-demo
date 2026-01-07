import {spawn} from 'child_process';

const snykOrg = process.env.VITE_SNYK_ORG;

const args = process.argv.slice(2);
const validArgs = ['-static', '-monitor', '--h', '--help'];

// Function to display help
const showHelp = () => {
  `
Usage: node snyk-test.js [options]

Options:
  --h, --help       Show this help message
  -static           Run the static security test
  -monitor          Run the monitor security test
  (no arguments)    Run the dependencies security test
  `;
};

// Validate arguments
if (args.some(arg => !validArgs.includes(arg))) {
  console.error(
    '\x1b[31m\x1b[1m❌ Invalid argument(s). Use --h or --help for usage information.\x1b[0m'
  );
  process.exit(1);
}

if (args.includes('--h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Command and log mapping
const testOptions = {
  '-static': {
    runningMsg: 'Running Snyk static test...',
    command: ['snyk', 'code', 'test', `--org=${snykOrg}`],
    successMessage: '✅ Snyk static test completed successfully!',
    errorMessage: '❌ Snyk static test failed with code',
  },
  '-monitor': {
    runningMsg: 'Running Snyk monitor test...',
    command: ['snyk', 'monitor', '--all-projects', `--org=${snykOrg}`],
    successMessage: '✅ Snyk monitor test completed successfully!',
    errorMessage: '❌ Snyk monitor test failed with code',
  },
  default: {
    runningMsg: 'Running Snyk dependencies test...',
    command: ['snyk', 'test', '--all-projects', `--org=${snykOrg}`],
    successMessage: '✅ Snyk dependencies test completed successfully!',
    errorMessage: '❌ Snyk dependencies test failed with code',
  },
};

// Determine the test type
let testType;
if (args.includes('-static')) {
  testType = '-static';
} else if (args.includes('-monitor')) {
  testType = '-monitor';
} else {
  testType = 'default';
}

const {runningMsg, command, successMessage, errorMessage} = testOptions[testType];

`\x1b[32m\x1b[1m 🚀 ${runningMsg}\x1b[0m`;

// Execute the test
const snykTest = spawn('npx', command, {
  stdio: 'inherit',
  shell: true,
});

snykTest.on('close', buildCode => {
  if (buildCode !== 0) {
    console.error(`\x1b[31m\x1b[1m${errorMessage}`, buildCode, '\x1b[0m');
    process.exit(buildCode || 1);
  } else {
    `\x1b[32m\x1b[1m${successMessage}\x1b[0m`;
  }
});
