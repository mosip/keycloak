FROM docker.io/bitnami/keycloak:16.1.1

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

COPY prebuildfs /

COPY ./theme/base /opt/bitnami/keycloak/themes/base

COPY ./theme/mosip /opt/bitnami/keycloak/themes/mosip

COPY ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments

COPY rootfs /

RUN chmod +x /usr/sbin/install_packages && chmod g+rwX /opt/bitnami && \
    chmod +x /opt/bitnami/scripts/keycloak/entrypoint.sh /opt/bitnami/scripts/keycloak/setup.sh /opt/bitnami/scripts/keycloak/run.sh && \
    chown -R 1001:1001 /opt/*

# Install required system packages and dependencies
RUN . /usr/sbin/install_packages acl ca-certificates curl gzip libaio1 libc6 procps rsync tar zlib1g

ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1001
ARG container_user_gid=1001

# Create and set ownership for the container user
RUN groupadd -g ${container_user_gid} ${container_user_group} && \
    useradd -r -u ${container_user_uid} -g ${container_user_group} ${container_user} && \
    mkdir -p /home/${container_user} && \
    chown -R ${container_user}:${container_user} /home/${container_user}

USER ${container_user_uid}:${container_user_gid}
WORKDIR /home/${container_user}

ENTRYPOINT [ "/opt/bitnami/scripts/keycloak/entrypoint.sh" ]

CMD [ "/opt/bitnami/scripts/keycloak/run.sh" ]
