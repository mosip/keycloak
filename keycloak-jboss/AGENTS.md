# AGENTS.md — keycloak-jboss/

Parent guide: [`../AGENTS.md`](../AGENTS.md)

## Purpose

Docker build context for `mosip-jboss-keycloak` — legacy JBoss-based
Keycloak (`jboss/keycloak:9.0.0`) with MOSIP's theme and a custom SPI jar
layered on top. There is no build step; `Dockerfile` only copies files
into the base image.

## Layout

```text
keycloak-jboss/
├── Dockerfile
├── standalone/deployments/spi-keycloak-1.0.jar   # prebuilt SPI jar, not built here
└── theme/
    ├── base/{account,email,login}/theme.properties    # base theme (login/ also has messages_*.properties, register.ftl)
    └── mosip/{account,admin,email,login,welcome}/      # MOSIP theme: theme.properties + resources/{css,img}
```

There is no `README.md` in this folder — the parent `../AGENTS.md` and
`../deploy/README.md` are the only documentation.

## `Dockerfile`

```dockerfile
FROM jboss/keycloak:9.0.0
ADD --chown=jboss:root ./theme/ ./theme
RUN cp -R ./theme/mosip /opt/jboss/keycloak/themes/mosip
RUN cp -R ./theme/base /opt/jboss/keycloak/themes
ADD --chown=jboss:root ./standalone/ ./standalone
RUN cp -R ./standalone/deployments/* /opt/jboss/keycloak/standalone/deployments
```

No `ENTRYPOINT`/`CMD` override — the image inherits its startup behavior
entirely from `jboss/keycloak:9.0.0`. If you need to change how the
container starts (env vars, JVM args), that's upstream JBoss Keycloak
behavior, not something controlled from this folder.

## Build & Test Commands

```bash
docker build -t your-registry/mosip-jboss-keycloak:tag .
```

There is nothing to unit test — verify a change by running the built
image and confirming the theme renders / the SPI loads, per
`../deploy/README.md`'s IMPORT/EXPORT and general install instructions.

## Agent rules

### Do

1. Check `theme.properties` in each theme directory
   (`base/{account,email,login}`, `mosip/{account,admin,email,login,welcome}`)
   before assuming a CSS/resource change takes effect — `parent=base`
   inheritance and explicit `styles`/`import` lists control what
   actually loads.
2. Compare against `../keycloak-artemis/theme/` when fixing a MOSIP
   theme/branding issue — the two theme trees are close to duplicates
   and usually need the same fix (see root `AGENTS.md`).
3. Treat `standalone/deployments/spi-keycloak-1.0.jar` as a prebuilt
   artifact — there is no source for it in this repo.

### Do not

1. Do not assume this Dockerfile builds anything from source — it only
   copies `theme/` and a prebuilt jar into the base image.
2. Do not add an `ENTRYPOINT`/`CMD` override here without understanding
   you'd be diverging from upstream `jboss/keycloak:9.0.0` startup
   behavior, which `keycloak-artemis/` explicitly does (via `rootfs/`)
   and this folder currently does not.
