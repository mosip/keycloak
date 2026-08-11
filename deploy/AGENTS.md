# AGENTS.md — deploy/

Parent guide: [`../AGENTS.md`](../AGENTS.md)

## Purpose

Shell scripts and `values.yaml` overrides that install, upgrade, export/
import, and manage secrets for the **upstream Bitnami `mosip/keycloak`
Helm chart** (published from the separate `mosip-helm` repository) plus
the `mosip/keycloak-init` and `mosip/istio-addons` charts. Nothing here
is a chart itself — this folder only supplies values files and
operational tooling for charts published elsewhere.

## Layout

```text
deploy/
├── README.md                    # most detailed doc in this folder — read before running anything
├── install.sh                     # first-time install: keycloak chart + istio-addons chart
├── export.sh                        # interactive export of realm+users from a running JBoss (9.0.0) pod
├── import-init.sh                      # runs keycloak-init chart against an already-imported Keycloak
├── import-init-values.yaml                # values for import-init.sh / phase 2 of upgrade-init.sh
├── upgrade-init.sh                          # two-phase init for upgrades (upgrade pass, then import pass)
├── upgrade-init-values.yaml                   # values for the upgrade pass — largely mirrors import-init-values.yaml
├── keycloak_init.sh                             # interactive first-time init (prompts for SMTP settings etc.)
├── update_secret.sh                               # recreates the keycloak Secret's admin-password key
├── delete.sh                                        # interactive uninstall of keycloak/keycloak-init/istio-addons
├── values.yaml                                        # overrides for the Bitnami mosip/keycloak chart itself
└── istio-addons-values.yaml                              # Gateway/VirtualService config for the mosip/istio-addons chart
```

## Script details

- **`install.sh`** — creates the `keycloak` namespace; **interactively
  refuses to proceed** if `istio-addons-values.yaml`'s `host:` is still
  the placeholder `iam.sandbox.xyz.net` (offers to auto-edit it via
  `sed`, confirm it's already edited, or abort) — this check must not be
  bypassed non-interactively without pre-editing the file first. Sets
  `istio-injection=disabled` on the namespace (not `enabled`, unlike
  most other MOSIP services — there's a `## TODO: enable istio
  injection after testing well` comment marking this as provisional,
  don't assume it's a mistake to "fix"). Installs `mosip/keycloak`
  pinned to `--version 7.1.18` with `-f values.yaml` plus `--set`
  overrides for the MOSIP-published image
  (`mosipqa/mosip-artemis-keycloak:develop`) and a specific PostgreSQL
  image (`mosipid/postgresql:14.2.0-debian-10-r70`), then installs
  `mosip/istio-addons` (version `1.0.0`) with `-f istio-addons-values.yaml`.
- **`export.sh`** — interactive; prompts for kubeconfig, namespace,
  export directory, users-per-file. `kubectl exec`s into a **JBoss 9.0.0**
  pod running `docker-entrypoint.sh` with
  `-Dkeycloak.migration.action=export` JVM args, tars the export
  directory inside the pod, `kubectl cp`s it out, untars locally. This
  is the JBoss-specific export mechanism — see `README.md`'s "EXPORT"
  section for the separate Bitnami-based procedure, which uses
  `KEYCLOAK_EXTRA_ARGS` instead. Do not conflate the two.
- **`import-init.sh`** — runs the published `mosip/keycloak-init` chart
  (`--version 0.0.1-develop`) against an already-existing/imported
  Keycloak, using `import-init-values.yaml` plus `--set` overrides for
  internal/external host and frontend URL derived from the cluster's
  `global` ConfigMap.
- **`upgrade-init.sh`** — two-phase: first `helm upgrade --install
  keycloak-init-upgrade` with `upgrade-init-values.yaml --wait`, polls
  the Job for `condition=complete` (600s timeout, aborts on failure),
  uninstalls that release, then runs a second
  `keycloak-init-import` pass with `import-init-values.yaml`.
  `upgrade-init-values.yaml` and `import-init-values.yaml` share largely
  the same realm/roles/clients/`clientSecrets` structure — keep them in
  sync deliberately when editing one.
- **`keycloak_init.sh`** — interactive first-time init; prompts for the
  Keycloak service name and SMTP settings (host/port/from-address with
  email-format validation, starttls/auth/ssl, username/password), then
  `helm install`s `mosip/keycloak-init` with those values plus the
  derived frontend URL.
- **`delete.sh`** — prompts "Are you sure you want to delete Keycloak?
  (Y/n)"; if confirmed, `helm delete`s the `keycloak`, `keycloak-init`,
  and `istio-addons` releases in the `keycloak` namespace. No
  non-interactive/CI-safe flag exists.
- **`update_secret.sh`** — usage `./update_secrets.sh <new_admin_password>
  [kubeconfig]`; recreates the `keycloak` Secret's `admin-password` key
  via `kubectl create secret --dry-run=client -o yaml | kubectl apply -f -`
  (idempotent update pattern) — use this after changing the admin
  password manually via the Keycloak console, so the cluster Secret
  stays in sync.

## Configuration

- `values.yaml` — overrides for the Bitnami chart itself:
  `service.type: ClusterIP`, `auth.adminUser: admin`, `extraEnvVars` sets
  `KEYCLOAK_EXTRA_ARGS` enabling `upload_scripts`, `token_exchange`,
  `admin_fine_grained_authz` Keycloak features, `ingress.enabled: false`
  (Istio is used instead), `proxyAddressForwarding: true`,
  `serviceDiscovery.enabled: true`, and an RBAC rule granting
  `get`/`list` on `pods` (needed for JGroups pod-based discovery in HA
  mode). Top comment: **"Refrain from fixing docker tags. Instead use
  the appropriate chart version, while helm install"** — the chart
  version pin (`7.1.18` in `install.sh`) is the supported way to change
  the Keycloak version, not editing tags here.
- `istio-addons-values.yaml` — `istio.host: iam.sandbox.xyz.net` is the
  placeholder `install.sh` checks for and blocks on;
  `ingressController: ingressgateway-internal`; comments document the
  multi-gateway/multi-ingressController list syntax if ever needed.
- `import-init-values.yaml` / `upgrade-init-values.yaml` — same shape as
  `../helm/keycloak-init/values.yaml`'s realm block, but a reduced/older
  client set (e.g. `mosip-partner-client`, `mosip-partnermanager-client`,
  `PARTNERMANAGER` role — legacy names not present in the main chart's
  default values) plus `del_realms: [preregistration]` (deletes a legacy
  realm on import). Both carry their own `clientSecrets` list with a
  comment explicitly warning: to preserve existing secrets, set `secret`
  to the current value; to generate new random ones, leave it empty.

## Repository-Specific Considerations

- `README.md`'s **"Keycloak docker version"** section documents *why*
  `values.yaml`/`install.sh` pin the Bitnami chart to `7.1.18`: newer
  Bitnami versions (12.04+) broke `userinfo` requests for clients like
  `mosip-prereg-client` at the time this was written. Don't bump the
  version without verifying that regression no longer applies.
- Two distinct, separately-documented **export** procedures exist
  (JBoss 9.0.0 via `export.sh` vs. Bitnami 7.1.18 via
  `KEYCLOAK_EXTRA_ARGS`) and two **import** procedures (via `install.sh`
  with `KEYCLOAK_EXTRA_ARGS=-Dkeycloak.profile.feature.upload_scripts=enabled`,
  or via `import-init.sh`) — `README.md`'s "EXPORT"/"IMPORT" sections
  cover both; do not conflate them.
- `README.md` also flags PVC/PV persistence caveats: data is lost on
  chart deletion unless a `Retain` storage class (e.g. `gp2-retain`) was
  used for the PostgreSQL volume.

## Agent rules

### Do

1. Read `README.md` in full before running any script here — it's the
   most detailed doc in this folder and covers caveats not repeated in
   this file.
2. Keep `import-init-values.yaml` and `upgrade-init-values.yaml` in sync
   when editing the realm/roles/clients definition, since they're
   largely duplicated content by design.
3. Use placeholder hosts/credentials in any values file you edit, and
   never commit a real domain or password over the existing placeholders.

### Do not

1. Do not bump the Bitnami `mosip/keycloak` chart version pinned in
   `install.sh`/documented in `values.yaml` without verifying the
   `userinfo`-request regression noted in `README.md` no longer applies.
2. Do not bypass `install.sh`'s placeholder-host check by scripting
   around the interactive prompt — pre-edit `istio-addons-values.yaml`
   instead.
3. Do not conflate the JBoss export procedure (`export.sh`) with the
   Bitnami export/import procedure documented in `README.md` — they use
   different mechanisms.
4. Do not assume `istio-injection=disabled` in `install.sh` is a bug —
   it's marked provisional with an explicit TODO, not an oversight.
