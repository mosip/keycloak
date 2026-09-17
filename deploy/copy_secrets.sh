#!/bin/bash
# Copy the shared external-Postgres superuser Secret from the postgres
# namespace into the keycloak namespace, for use by install.sh's external
# DB option.
#
# Only the Postgres superuser credential is copied here. The Keycloak DB
# user gets its own dedicated password (generated in install.sh), never the
# shared db-common-secrets value used by other MOSIP module DB users.

SRC_NS=postgres
DST_NS=keycloak
SECRET=postgres-postgresql

function copying_secrets() {
  kubectl -n $DST_NS delete --ignore-not-found=true secret $SECRET
  kubectl -n $SRC_NS get secret $SECRET -o yaml | sed "s/namespace: $SRC_NS/namespace: $DST_NS/g" | kubectl -n $DST_NS create -f -
  return 0
}

# set commands for error handling.
set -e
set -o errexit   ## set -e : exit the script if any statement returns a non-true return value
set -o nounset   ## set -u : exit the script if you try to use an uninitialised variable
set -o errtrace  # trace ERR through 'time command' and other functions
set -o pipefail  # trace ERR through pipes
copying_secrets   # calling function
