#!/bin/bash
# Copy the shared external-Postgres config from the postgres namespace into
# the keycloak namespace, for use by install.sh's external DB option.

SRC_NS=postgres
DST_NS=keycloak
CM=postgres-setup-config

function copying_cm() {
  kubectl -n $DST_NS delete --ignore-not-found=true configmap $CM
  kubectl -n $SRC_NS get configmap $CM -o yaml | sed "s/namespace: $SRC_NS/namespace: $DST_NS/g" | kubectl -n $DST_NS create -f -
  return 0
}

# set commands for error handling.
set -e
set -o errexit   ## set -e : exit the script if any statement returns a non-true return value
set -o nounset   ## set -u : exit the script if you try to use an uninitialised variable
set -o errtrace  # trace ERR through 'time command' and other functions
set -o pipefail  # trace ERR through pipes
copying_cm   # calling function
