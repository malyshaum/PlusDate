FROM postgis/postgis:15-master

# Install dependencies for pgvector
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-15 \
    clang-13 \
    && rm -rf /var/lib/apt/lists/*

# Install pgvector
RUN cd /tmp && \
    git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install && \
    cd / && \
    rm -rf /tmp/pgvector

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Ensure proper permissions
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql