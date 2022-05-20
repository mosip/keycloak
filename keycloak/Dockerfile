FROM bitnami/keycloak:14.0.0-debian-10-r24

COPY ./theme/mosip /opt/bitnami/keycloak/themes/mosip

COPY ./theme/base /opt/bitnami/keycloak/themes

COPY ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments
