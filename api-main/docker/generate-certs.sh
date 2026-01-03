#!/bin/bash

CERT_DIR="/var/www/ssl"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

mkdir -p "$CERT_DIR"

openssl req -x509 -newkey rsa:4096 -keyout "$KEY_FILE" -out "$CERT_FILE" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"
chown www-data:www-data "$CERT_FILE" "$KEY_FILE"

echo "SSL certificates generated at:"
echo "Certificate: $CERT_FILE"
echo "Private key: $KEY_FILE"
