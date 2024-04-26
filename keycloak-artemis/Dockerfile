FROM docker.io/bitnami/keycloak:24.0.2

USER root

ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

LABEL maintainer="Bitnami <containers@bitnami.com>"

# COPY ./theme/base /opt/bitnami/keycloak/themes/base

COPY ./theme/mosip /opt/bitnami/keycloak/themes/mosip

COPY ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments

RUN chmod +x /usr/sbin/install_packages && chmod g+rwX /opt/bitnami && \
    chmod +x /opt/bitnami/scripts/keycloak/entrypoint.sh /opt/bitnami/scripts/keycloak/setup.sh /opt/bitnami/scripts/keycloak/run.sh && \
    chown -R 1001:1001 /opt/*

USER 1001

ENTRYPOINT [ "/opt/bitnami/scripts/keycloak/entrypoint.sh" ]

CMD [ "/opt/bitnami/scripts/keycloak/run.sh" ]
