FROM bitnami/keycloak:14.0.0-debian-10-r24

RUN cp -R ./theme/mosip /opt/bitnami/keycloak/themes/mosip

RUN cp -R ./theme/base /opt/bitnami/keycloak/themes


ADD --chown=1001:root ./standalone/ ./standalone

RUN chmod g+rwX /opt/bitnami

RUN cp -R ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments
