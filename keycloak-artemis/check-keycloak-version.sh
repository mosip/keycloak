#!/usr/bin/env bash
#
# Builds the keycloak-artemis image from this directory's Dockerfile, then
# starts a throwaway container (entrypoint overridden to `sleep infinity` so
# it never tries to actually boot Keycloak / needs DB config), reads the
# installed Keycloak version straight from the image contents, and asserts
# it matches the expected version.
#
# Usage:
#   ./check-keycloak-version.sh [image_tag] [expected_version]
#
#   ./check-keycloak-version.sh                                  # tags keycloak-artemis-test:local, expects 16.1.1
#   ./check-keycloak-version.sh keycloak-artemis-test:v2 16.1.1
#
# Requires docker access (run with sudo if your user isn't in the docker
# group).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="${1:-keycloak-artemis-test:local}"
EXPECTED_VERSION="${2:-16.1.1}"
CONTAINER_ID=""

cleanup() {
  if [[ -n "$CONTAINER_ID" ]]; then
    docker rm -f "$CONTAINER_ID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Building image '$IMAGE' from $SCRIPT_DIR ..."
docker build -t "$IMAGE" "$SCRIPT_DIR"

echo "Starting throwaway container (entrypoint overridden, does not boot Keycloak)..."
CONTAINER_ID="$(docker run -d --entrypoint sleep "$IMAGE" infinity)"

echo ""
echo "==================== KEYCLOAK VERSION ===================="
version_line="$(docker exec "$CONTAINER_ID" cat /opt/bitnami/keycloak/version.txt)"
echo "$version_line"

echo ""
echo "Matching jars (keycloak-core*.jar / keycloak-server-spi*.jar):"
docker exec "$CONTAINER_ID" bash -c \
  "find /opt/bitnami/keycloak -type f \( -iname 'keycloak-core*.jar' -o -iname 'keycloak-server-spi*.jar' \) 2>/dev/null | sort"

if [[ "$version_line" != *"$EXPECTED_VERSION"* ]]; then
  echo ""
  echo "ERROR: expected Keycloak version '$EXPECTED_VERSION', got: $version_line" >&2
  exit 1
fi

echo ""
echo "Keycloak version matches expected '$EXPECTED_VERSION'."
