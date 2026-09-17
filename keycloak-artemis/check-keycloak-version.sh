#!/usr/bin/env bash
#
# Builds the keycloak-artemis image from this directory's Dockerfile, then
# starts a throwaway container (entrypoint overridden to `sleep infinity` so
# it never tries to actually boot Keycloak / needs DB config) and reads the
# installed Keycloak version straight from the image contents.
#
# Usage:
#   ./check-keycloak-version.sh [image_tag]
#
#   ./check-keycloak-version.sh                          # tags keycloak-artemis-test:local
#   ./check-keycloak-version.sh keycloak-artemis-test:v2
#
# Requires docker access (run with sudo if your user isn't in the docker
# group).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="${1:-keycloak-artemis-test:local}"
CONTAINER_NAME="keycloak-artemis-version-check"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Building image '$IMAGE' from $SCRIPT_DIR ..."
docker build -t "$IMAGE" "$SCRIPT_DIR"

echo "Starting throwaway container '$CONTAINER_NAME' (entrypoint overridden, does not boot Keycloak)..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" --entrypoint sleep "$IMAGE" infinity >/dev/null

echo ""
echo "==================== KEYCLOAK VERSION ===================="
docker exec "$CONTAINER_NAME" cat /opt/bitnami/keycloak/version.txt

echo ""
echo "Matching jars under keycloak-core / keycloak-server-spi:"
docker exec "$CONTAINER_NAME" bash -c \
  "find /opt/bitnami/keycloak -iname '*keycloak-server*' -o -iname 'keycloak-core*' 2>/dev/null | sort"
