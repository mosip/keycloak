#!/bin/bash
# Initialize Imported Keycloak with MOSIP base data
# Usage:
# ./import-init.sh [kube_config_file]

if [ $# -ge 1 ] ; then
  export KUBECONFIG=$1
fi

function upgrade_init() {
  NS=keycloak
  CHART_VERSION=0.0.1-develop
  KEYCLOAK_SERVICE_NAME=keycloak
  EXISTING_UPGRADE_RELEASE_NAME=keycloak-init-upgrade
  NEW_UPGRADE_RELEASE_NAME=keycloak-init-import

  helm repo add mosip https://mosip.github.io/mosip-helm
  helm repo update

  IAM_HOST=$(kubectl get cm global -o jsonpath='{.data.mosip-iam-external-host}')

  echo Initializing keycloak with upgrade values
  helm -n $NS upgrade --install keycloak-init-upgrade mosip/keycloak-init \
    --set keycloakExternalHost="$IAM_HOST" \
    --set keycloakInternalHost="$KEYCLOAK_SERVICE_NAME.$NS" \
    --set keycloak.realms.mosip.realm_config.attributes.frontendUrl="https://$IAM_HOST/auth" \
    -f upgrade-init-values.yaml --version $CHART_VERSION --wait
  
  echo Waiting for upgrade job to complete...
  if ! kubectl wait --for=condition=complete --timeout=600s -n $NS job -l app.kubernetes.io/instance=$EXISTING_UPGRADE_RELEASE_NAME; then
    echo "$(tput setaf 1)ERROR: Keycloak upgrade job failed to complete. Aborting import process.$(tput sgr0)"
    exit 1
  fi
  
  echo Cleaning up upgrade release
  helm -n $NS uninstall $EXISTING_UPGRADE_RELEASE_NAME
  
  echo Initializing keycloak with import values
  helm -n $NS upgrade --install $NEW_UPGRADE_RELEASE_NAME mosip/keycloak-init \
    --set keycloakExternalHost="$IAM_HOST" \
    --set keycloakInternalHost="$KEYCLOAK_SERVICE_NAME.$NS" \
    --set keycloak.realms.mosip.realm_config.attributes.frontendUrl="https://$IAM_HOST/auth" \
    -f import-init-values.yaml --version $CHART_VERSION --wait
  return 0
}

# set commands for error handling.
set -e
set -o errexit   ## set -e : exit the script if any statement returns a non-true return value
set -o nounset   ## set -u : exit the script if you try to use an uninitialised variable
set -o errtrace  # trace ERR through 'time command' and other functions
set -o pipefail  # trace ERR through pipes
upgrade_init   # calling function
