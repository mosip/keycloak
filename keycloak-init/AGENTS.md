# AGENTS.md — keycloak-init/

Parent guide: [`../AGENTS.md`](../AGENTS.md)

## Purpose

A Python script (`keycloak_init.py`) that logs into a running Keycloak
instance via its admin REST API (using the `python-keycloak` library)
and declaratively creates/updates the realm, roles, clients, mappers,
client scopes, and users described in a YAML input file. Packaged as a
standalone Docker image; also runnable directly with a local Python
install.

## Layout

```text
keycloak-init/
├── Dockerfile          # FROM python:3.7, see ../AGENTS.md's Technology Stack for details
├── README.md
├── requirements.txt      # pinned deps (python-keycloak==0.26.1, PyYAML==5.4.1, etc.)
├── keycloak_init.py         # the init script — see below
├── keycloak_logout.py          # standalone helper, NOT copied into the Docker image
├── input.yaml                     # example full input (realm/roles/scopes/clients/users)
├── users.yaml                        # narrower example: user creation only
└── run.sh                               # example `docker run` invocation (not an executable script to run as-is)
```

## `keycloak_init.py` structure

One class, `KeycloakSession`, with one method per Keycloak admin
operation: `create_realm`, `delete_realm`, `create_role`,
`delete_realm_role`, `create_client`, `create_public_client`,
`delete_client`, `create_mapper`, `create_user`, `assign_user_roles`,
`assign_client_roles`, `assign_client_roles_to_user`,
`assign_sa_client_roles`, `remove_sa_roles`, `create_client_scope`,
`update_client_scope`, `assign_client_scope`,
`create_authentication_flow` (+ its `create_flow_to_auth_flow`/
`update_config_to_execution`/`update_execution_to_auth_flow`/
`create_execution_to_auth_flow` helpers), `get_auth_flow_id`,
`get_client_scope_id`.

`main()` reads the input YAML and drives creation in this order per
realm: delete realms → create realms → roles / `del_roles` / `del_clients`
→ client scopes → authentication flows → clients (with mappers, sa
roles, sa client roles, `assign_client_scopes`, auth-flow overrides) →
users (create + assign realm/client roles). If you add a new top-level
input-YAML key, wire it into this ordering in `main()`, not as a
separate pass — later steps assume earlier ones already ran.

Client secrets are read from environment variables named
`<clientname-with-hyphens-replaced-by-underscores>_secret`; if the env
var is unset, a secret is generated with `secrets.token_urlsafe(16)`.

Error handling: if `assign_client_roles_to_user` (or most other methods)
raises partway through, the code resets the Keycloak admin client's
realm to `master` before re-raising — this prevents a failure from
leaving the admin client pointed at a non-master realm for subsequent
calls. Preserve this behavior if you refactor error handling here.

`args_parse()` (module-level) makes `server_url`, `user`, `password`,
`input_yaml` required positional CLI arguments, plus an optional
`--disable_ssl_verify` flag — see the parent guide's Build & Test
Commands for the exposure caveats around passing `password` this way.

## `keycloak_logout.py`

A separate, standalone script — **not copied into the Docker image**
(only `keycloak_init.py` is `COPY`'d in the `Dockerfile`). Logs out a
given client's service-account user: takes positional args
`server_url, admin_user, admin_password, client_name, realm` (plus
`--disable_ssl_verify`), builds a `KeycloakAdmin` session, looks up the
client's service-account user, and calls `keycloak_admin.logout(user_id)`.
Note it appends `/auth/` to `server_url` itself — unlike
`keycloak_init.py`, which expects the caller to already pass the full
auth URL. Run it manually with `python3 keycloak_logout.py ...`; there's
no Docker/CI path that invokes it.

## Build & Test Commands

```bash
pip3 install -r requirements.txt
python3 keycloak_init.py --help
```

See the parent guide for the full run example (including the
credential-handling caveat) and the Docker build command. There is no
test suite for this module.

## Configuration

- `input.yaml` — full example: realm settings (`accessCodeLifespan`,
  `passwordPolicy`, `bruteForceProtected`, `loginTheme`/`accountTheme`,
  etc.), `roles`, `client_scopes`, `clients` (with `mappers`, `saroles`,
  `sa_client_roles`, `assign_client_scopes`), `users`.
- `users.yaml` — narrower example limited to user creation (empty
  `roles`/`clients`, a `users` list with `username`/`email`/`firstName`/
  `lastName`/`password`/`temporary`/`attributes`/`realmRoles`).
- `run.sh` is documentation, not a runnable script as committed — it
  shows an example `docker run` invocation
  (`-v ~/mosip-infra/build/keycloak-init/:/opt/mosip/input -e KEYCLOAK_ADMIN_USER=... ...`)
  with a commented-out direct-invocation example below it.
- See the parent guide's Configuration section for the
  `KEYCLOAK_SERVER_URL`/`KEYCLOAK_ADMIN_USER`/`KEYCLOAK_ADMIN_PASSWORD`/
  `INPUT_DIR`/`INPUT_FILE`/`FRONTEND_URL` environment variables the
  Docker image reads.

## Agent rules

### Do

1. Follow the existing per-realm ordering in `main()` (delete → create
   realms → roles/scopes → auth flows → clients → users) when adding a
   new kind of input-YAML-driven resource.
2. Preserve the "reset admin client to `master` realm on error" behavior
   in any method you touch.
3. Keep `keycloak_logout.py` in mind as a separate, Docker-image-excluded
   script — don't assume changes to `keycloak_init.py`'s session/auth
   logic automatically apply there.

### Do not

1. Do not add `keycloak_logout.py` to the Docker image without a reason
   — it's intentionally excluded today.
2. Do not change the client-secret env var naming convention
   (`<client>_secret` with hyphens → underscores) without checking every
   caller (`../deploy/*-values.yaml`, `../helm/keycloak-init/values.yaml`)
   that relies on it.
