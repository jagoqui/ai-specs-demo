import {spawn} from 'child_process';

const validArguments = ['-h', '--help', '-local', ''];

const args = process.argv.slice(2);

if (args.some(arg => !validArguments.includes(arg))) {
  console.error(
    '\x1b[31m\x1b[1m❌ Invalid argument. Use -h or --help for usage instructions.\x1b[0m'
  );
  process.exit(1);
}

if (args.includes('-h') || args.includes('--help')) {
  `
Usage: node sonar-scanner.js [options]
Options (all are optional):
  -h, --help        Show this help message
  -local            Use local environment variables (default is main environment)
  `;
  process.exit(0);
}

('\x1b[32m\x1b[1m🚀 Executing Docker command for SonarQube scan...\x1b[0m');

const environmentsFile = args.includes('-local')
  ? 'environments/.env.sonar-local'
  : 'environments/.env';

// Step 1: Build the Docker image
const build = spawn(
  'docker',
  ['build', '--tag', 'sonar-scanner-cli', '--build-arg', `ENV_FILE=${environmentsFile}`, '.'],
  {
    stdio: 'inherit',
    shell: true,
  }
);

build.on('close', buildCode => {
  if (buildCode !== 0) {
    console.error('\x1b[31m\x1b[1m❌ Docker build failed with code', buildCode, '\x1b[0m');
    removeDockerImageOnFail();
    process.exit(buildCode || 1);
  }

  // Step 2: Run the Docker container
  const sonar = spawn(
    'docker',
    [
      'run',
      '-it',
      '--rm',
      '--env-file',
      `${environmentsFile}`,
      '-v',
      `${process.cwd()}:/usr/src`,
      '--network="host"',
      'sonar-scanner-cli',
    ].filter(Boolean),
    {
      stdio: 'inherit',
      shell: true,
    }
  );

  sonar.on('close', code => {
    if (code !== 0) {
      console.error('\x1b[31m\x1b[1m❌ Docker run failed with code', code, '\x1b[0m');

      removeDockerImageOnFail();
      process.exit(code || 1);
    }

    removeDockerImageOnFail();
  });
});

const removeDockerImageOnFail = () => {
  const removeImage = spawn('docker', ['rmi', '-f', 'sonar-scanner-cli'], {
    stdio: 'inherit',
    shell: true,
  });

  removeImage.on('close', removeCode => {
    if (removeCode !== 0) {
      console.error(
        '\x1b[31m\x1b[1m❌ Failed to remove Docker image with code',
        removeCode,
        '\x1b[0m'
      );
      process.exit(removeCode || 1);
    }

    ('\x1b[32m\x1b[1m✅ Docker image and container cleanup completed successfully.\x1b[0m');
  });
};
