# AGENTS.md — helm/keycloak-init/

Parent guide: [`../../AGENTS.md`](../../AGENTS.md)

## Purpose

Helm chart that runs `../../keycloak-init/keycloak_init.py` (packaged as
the `keycloak-init` Docker image) as a Kubernetes `Job` — a one-shot task
that provisions a MOSIP realm/roles/clients/users into an already-running
Keycloak instance. This is the chart CI actually validates
(`.github/workflows/verify-keycloak-init.yml` runs on any change under
`helm/keycloak-init/**`); it's the only path in this repo with automated
verification.

## Layout

```text
helm/keycloak-init/
├── Chart.yaml      # name "keycloak-init", version 0.0.1-develop, appVersion 1.2.0, depends on bitnami common
├── values.yaml       # image + realm/roles/clients/users config + client secrets — see below
├── README.md            # minimal: helm dependency update && helm install
└── templates/
    ├── job.yaml            # the batch/v1 Job — one-shot, restartPolicy: Never, backoffLimit: 0
    ├── configmap.yaml        # keycloak-host CM (derives internal/external URLs) + <release>-configuration CM (dumps .Values.keycloak.realms as input.yaml)
    ├── client-secrets.yaml     # Secret keycloak-client-secrets — base64-encodes each entry in .Values.clientSecrets, or generates a random one if empty
    ├── serviceaccount.yaml       # conditional ServiceAccount
    ├── tests/test-connection.yaml # Helm test-hook Pod — references a Service that no template here actually creates; leftover chart-starter boilerplate
    └── _helpers.tpl                # keycloak-init.fullname / .labels / .selectorLabels / .serviceAccountName
```

## `values.yaml` — what actually matters

- `image: {repository: mosipqa/keycloak-init, pullPolicy: Always, tag: develop}`.
- `keycloak:` block assumes resources from the **main Keycloak Helm
  install already exist** in-cluster — it does not create them:
  - `keycloak.host.existingConfigMap: keycloak-host`
    (key `keycloak-internal-service-url`)
  - `keycloak.admin.userName.existingConfigMap: keycloak-env-vars`
    (key `KEYCLOAK_ADMIN_USER`)
  - `keycloak.admin.secret.existingSecret: keycloak`
    (key `admin-password`)
- `keycloak.realms.mosip` — the full realm definition (~100 roles, 8
  client scopes, ~30 clients with `saroles`/`mappers`/`sa_client_roles`/
  `assign_client_scopes`) in the same shape as
  `../../keycloak-init/input.yaml`. This is rendered by
  `templates/configmap.yaml` into an `input.yaml` file mounted into the
  Job — **this values.yaml block is the actual source of truth for what
  gets provisioned**, not `../../keycloak-init/input.yaml` (that one is
  just a standalone-run example).
- `clientSecrets:` — a list of `{name, secret}` pairs (28 entries as of
  this writing). Leave `secret: ""` to have `templates/client-secrets.yaml`
  generate a random 16-char value; set a real value to pin a specific
  secret. Keep this list in sync with the client names actually defined
  under `keycloak.realms.mosip.clients`.
- `keycloakInternalHost: keycloak.keycloak`,
  `keycloakExternalHost: iam.sandbox.xyz.net` (placeholder) — overridden
  at install time via `--set` by `../../deploy/*.sh` scripts, not by
  editing this file.
- `service`/`ingress`/`tests/test-connection.yaml` are unused chart-starter
  boilerplate — this chart runs a `Job`, not a long-lived
  Deployment/Service, and no `service.yaml` template actually exists.
  Don't assume there's a Service to hit.

## Build & Test Commands

```bash
helm dependency update
helm lint .
helm install keycloak-init .
```

CI validates `values.yaml` via a reusable `verify-keycloak-init`
workflow from `mosip/kattu` whenever files under `helm/keycloak-init/**`
change (`.github/workflows/verify-keycloak-init.yml`).

## Agent rules

### Do

1. Treat `values.yaml`'s `keycloak.realms.mosip` as the authoritative
   realm definition for this chart's Job — keep it and
   `../../keycloak-init/input.yaml` in sync deliberately, they are not
   automatically linked.
2. Add a new client's secret to `clientSecrets:` whenever you add a new
   client under `keycloak.realms.mosip.clients` that needs one.
3. Run `helm lint .` before proposing a chart change — this is the one
   chart in the repo with CI verification, so lint failures are caught.

### Do not

1. Do not assume `templates/tests/test-connection.yaml` or the `service`/
   `ingress` values blocks do anything meaningful — there is no Service
   template in this chart for them to target.
2. Do not hardcode `keycloakExternalHost`/`keycloakInternalHost` to a
   real value in this file — they're set via `--set` at install time.
3. Do not assume `existingConfigMap`/`existingSecret` names
   (`keycloak-host`, `keycloak-env-vars`, `keycloak`) can be renamed here
   alone — they must match whatever the main Keycloak Helm release
   actually creates.
