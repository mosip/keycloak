# AGENTS.md — keycloak-artemis/

Parent guide: [`../AGENTS.md`](../AGENTS.md)

## Purpose

Docker build context for `mosip-artemis-keycloak` — a Bitnami-style
Keycloak image (`FROM docker.io/mosipid/keycloak:16.1.1`, a MOSIP-published
mirror of Bitnami's Keycloak 16.1.1) with MOSIP's theme, custom jars, and
vendored Bitnami lifecycle scripts layered on top.

## Layout

```text
keycloak-artemis/
├── Dockerfile
├── README.md
├── prebuildfs/opt/bitnami/         # generic Bitnami shell libs (liblog.sh, libfs.sh, ...),
│                                    # install_packages helper, .bitnami_components.json
├── rootfs/opt/bitnami/scripts/     # overrides the base image's own lifecycle scripts (see below)
├── standalone/deployments/         # recaptcha-login.jar, spi-keycloak.jar — prebuilt, not built here
└── theme/                          # same shape as ../keycloak-jboss/theme/ (base/ + mosip/),
                                     # login theme here additionally ships login-bg.jpg
```

## `Dockerfile`

```dockerfile
FROM docker.io/mosipid/keycloak:16.1.1
USER root
COPY prebuildfs /
COPY ./theme/base /opt/bitnami/keycloak/themes/base
COPY ./theme/mosip /opt/bitnami/keycloak/themes/mosip
COPY ./standalone/deployments/* /opt/bitnami/keycloak/standalone/deployments
COPY rootfs /
# Patch Debian repo (stretch/buster are archived now)
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i '/security.debian.org/d' /etc/apt/sources.list
RUN chmod +x /usr/sbin/install_packages && ... && chown -R 1001:1001 /opt/*
RUN . /usr/sbin/install_packages acl ca-certificates curl gzip libaio1 libc6 procps rsync tar zlib1g
USER 1001
ENTRYPOINT [ "/opt/bitnami/scripts/keycloak/entrypoint.sh" ]
CMD [ "/opt/bitnami/scripts/keycloak/run.sh" ]
```

The Debian-archive `sed` patch exists because the base image's Debian
release (stretch/buster) is EOL and `deb.debian.org` no longer serves
its packages — don't remove this patch without confirming the base
image's Debian release is current.

## `rootfs/` — vendored Bitnami lifecycle scripts

`rootfs/opt/bitnami/scripts/...` **replaces** the entrypoint/setup/run
scripts baked into the base image. These are **stock Bitnami scripts,
not MOSIP-patched** (no `mosip`/`MOSIP` string appears anywhere under
`rootfs/`) — they're vendored to pin a known-good script version
alongside the custom theme/jar layers, not to change container behavior.
Read the existing script before modifying container startup, since
you're patching Bitnami's lifecycle, not writing it from scratch:

- `keycloak/entrypoint.sh` — loads shared libs, prints the welcome page,
  and (when invoked via `run.sh`) runs `keycloak/setup.sh` before
  `exec "$@"`.
- `keycloak/setup.sh` — validates required env vars, ensures the daemon
  user exists, runs `keycloak_initialize` and any custom init scripts.
- `keycloak/postunpack.sh` — creates required data/log directories,
  backs up `standalone-ha.xml`, cleans state left over from a restart.
- `keycloak/run.sh` — builds the actual `standalone.sh` start command
  (bind address, hostname/port, optional TLS/statistics/frontend-URL
  flags, appends `$KEYCLOAK_EXTRA_ARGS`) and `exec`s it.
- `keycloak-env.sh` — defines/exports ~40 `KEYCLOAK_*` env vars with
  Bitnami defaults (admin user/password, DB host/port, ports, TLS,
  JGroups, etc.); supports the `*_FILE` override convention for reading
  a value from a file instead of the env var directly.
- `libkeycloak.sh` — shared helper functions used by the scripts above.
- `java/entrypoint.sh`, `java/postunpack.sh` — analogous lifecycle
  scripts for the bundled Java runtime.

## Build & Test Commands

```bash
docker build -t your-registry/mosip-artemis-keycloak:tag .
```

Nothing to unit test — verify by running the built image and checking
startup logs / the rendered theme, per `../deploy/README.md`.

## Agent rules

### Do

1. Read the relevant `rootfs/opt/bitnami/scripts/...` script fully
   before changing container startup behavior — you are patching a
   vendored Bitnami script chain, not writing new logic.
2. Compare against `../keycloak-jboss/theme/` when fixing a MOSIP
   theme/branding issue — the two theme trees are close to duplicates.
3. Keep the Debian-archive `sed` patch in the Dockerfile unless you've
   confirmed the base image no longer needs it.

### Do not

1. Do not assume `rootfs/` scripts contain MOSIP-specific logic — they
   are stock Bitnami scripts vendored for version pinning.
2. Do not treat `standalone/deployments/*.jar` as buildable from source
   in this repo — both jars are prebuilt artifacts.
