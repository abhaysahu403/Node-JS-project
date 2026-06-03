# Custom MySQL Image with Database Initialization
FROM mysql:8.0

# Set environment variables for consistency
ENV MYSQL_DATABASE=cloudnexushr

# Copy database initialization scripts
# Scripts in /docker-entrypoint-initdb.d/ run automatically on first start
# They are executed in alphabetical order
COPY init.sql /docker-entrypoint-initdb.d/01-init.sql

# Expose MySQL port
EXPOSE 3306

# Default command (inherited from base image)
CMD ["mysqld"]
