FROM openjdk:25-jdk-slim
WORKDIR /opt/workdir/

# Arguments for the certificate
ENV JAVA_CACERTS_PATH="${JAVA_HOME}/lib/security/cacerts"

# Install required tools
RUN apt-get update && apt-get install -y openssl curl unzip

# ✅ Install sonar-scanner
ARG SONAR_SCANNER_VERSION="5.0.1.3006-linux"
RUN curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}.zip && \
    unzip sonar-scanner.zip -d /opt && \
    ln -s /opt/sonar-scanner-${SONAR_SCANNER_VERSION}/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm sonar-scanner.zip

# Copy project files
COPY src /opt/workdir/src
COPY coverage /opt/workdir/coverage
COPY sonar-project.properties /opt/workdir/sonar-project.properties
COPY .git /opt/workdir/.git

# Copy the entrypoint script and make it executable
COPY scripts/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Truststore configuration
ENV SONAR_SCANNER_OPTS="-Djavax.net.ssl.trustStore=${JAVA_CACERTS_PATH} -Djavax.net.ssl.trustStorePassword=changeit"

# ✅ ENTRYPOINT with exec form referencing the script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]