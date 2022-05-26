FROM bitnami/keycloak:14.0.0-debian-10-r24

ADD --chown=bitnami:root ./theme/ ./theme

RUN cp -R ./theme/mosip /opt/bitnami/keycloak/themes/mosip

RUN cp -R ./theme/base /opt/bitnami/keycloak/themes


ADD --chown=bitnami:root ./standalone/ ./standalone

RUN cp -R ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments
