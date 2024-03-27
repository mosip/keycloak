FROM jboss/keycloak:9.0.0

ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1001
ARG container_user_gid=1001

ADD --chown=jboss:root ./theme/ ./theme

RUN cp -R ./theme/mosip /opt/jboss/keycloak/themes/mosip \
    && cp -R ./theme/base /opt/jboss/keycloak/themes

ADD --chown=jboss:root ./standalone/ ./standalone

RUN cp -R ./standalone/deployments/* /opt/jboss/keycloak/standalone/deployments

WORKDIR /home/${container_user}

RUN chown -R ${container_user}:${container_user} /home/${container_user} \
    && usermod -u ${container_user_uid} jboss \
    && groupmod -g ${container_user_gid} jboss

USER ${container_user}
