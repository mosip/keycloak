#!/bin/sh
# Examples of how to run keycloak init using docker and directly with python.
docker run --rm  -v ~/mosip-infra/build/keycloak-init/:/opt/mosip/input -e KEYCLOAK_ADMIN_USER=admin -e KEYCLOAK_ADMIN_PASSWORD=password -e KEYCLOAK_SERVER_URL=https://iam.sandbox.mosip.net -e INPUT_FILE=user.yaml  mosipdev/keycloak-init:1.2.0.1

#python keycloak_init.py https://iam.v3box1.mosip.net admin <password> input.yaml
