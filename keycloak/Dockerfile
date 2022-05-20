FROM bitnami/keycloak:14.0.0-debian-10-r24

RUN cp -R ./theme/mosip /opt/bitnami/keycloak/themes/mosip

RUN cp -R ./theme/base /opt/bitnami/keycloak/themes

RUN cp -R ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments
