#!/bin/sh

# Modify sonar-project.properties for 'sonar-local' environment, replacing sonar.login with sonar.token for legacy support
if [ "$VITE_MOD" = "sonar-local" ]; then
  echo '\033[1;33m⚠️ Note: sonar.login has been replaced with sonar.token for newer versions of SonarQube.\033[0m'
  sed -i 's/sonar.login=/sonar.token=/g' sonar-project.properties
else
  # Arguments for the certificate (already set as ENV, but good to ensure scope or redefine if needed locally)
  # JAVA_CACERTS_PATH="${JAVA_HOME}/lib/security/cacerts" # Already an ENV
  echo '\033[1;34m🔐 Downloading and installing SonarQube certificate (env ≠ sonar-local)...\033[0m'
  # Use process substitution to avoid temporary file for echo | openssl
  openssl s_client -connect "$VITE_REMOTE_SONAR_CLIENT" </dev/null | openssl x509 -outform PEM > /sonarqube_cert.pem && \
  keytool -importcert -file /sonarqube_cert.pem -keystore "$JAVA_CACERTS_PATH" -alias sonarqube -storepass changeit -noprompt && \
  rm /sonarqube_cert.pem
fi

# Display directory contents
echo '\n\033[1;34m📂 Files in current directory:\033[0m'
ls -la

# Display default sonar-scanner.properties content
echo '\n\033[1;34m📄 Default sonar-scanner.properties Content:\033[0m'
cat "/opt/sonar-scanner-${SONAR_SCANNER_VERSION}/conf/sonar-scanner.properties"

# Display sonar-project.properties content
echo '\n\033[1;34m📄 sonar-project.properties Content:\033[0m'
cat sonar-project.properties

# Start SonarScanner Analysis
echo '\n\033[1;32m🚀 Starting SonarScanner Analysis...\033[0m\n'
exec sonar-scanner -X # Use 'exec' to replace the current shell with sonar-scanner