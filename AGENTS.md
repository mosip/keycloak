# AGENTS.md

## Repository Overview

This repo does **not** build Keycloak from source. It packages MOSIP's
customizations on top of upstream Keycloak / Bitnami Keycloak container images,
plus the tooling needed to deploy and initialize Keycloak as MOSIP's default
Identity and Access Management (IAM) provider. Concretely it contains:

- Two Docker build contexts (`keycloak-jboss/`, `keycloak-artemis/`) that
  layer MOSIP themes and prebuilt deployment jars (including a custom SPI
  jar in both) onto a pre-built upstream Keycloak base image.
- A Python-based "init" job that logs into a running Keycloak instance via its
  admin REST API and creates the realm, clients, roles, and users MOSIP needs.
- A Helm chart that runs the init job as a Kubernetes Job.
- Shell scripts and a `values.yaml` for installing/upgrading/exporting the
  Bitnami Keycloak Helm release on a MOSIP cluster.

There is no application source code (no Maven/Gradle/Node build) beyond the
prebuilt deployment jars under each context's `standalone/deployments/`
directory and the `keycloak_init.py` script.

## Technology Stack

- **Docker** — three independent build contexts, each with its own
  `Dockerfile`:
  - `keycloak-jboss/Dockerfile` — `FROM jboss/keycloak:9.0.0` (legacy JBoss-based
    Keycloak). Copies `theme/` and `standalone/deployments/*` (a prebuilt
    `spi-keycloak-1.0.jar`) into the image.
  - `keycloak-artemis/Dockerfile` — `FROM docker.io/mosipid/keycloak:16.1.1`
    (Bitnami-style Keycloak base, MOSIP-published). Copies `prebuildfs/`,
    `theme/`, `standalone/deployments/*` (`recaptcha-login.jar`,
    `spi-keycloak.jar`) and `rootfs/` (Bitnami entrypoint/setup/run scripts
    under `rootfs/opt/bitnami/scripts/...`) into the image.
  - `keycloak-init/Dockerfile` — `FROM python:3.7`. Installs
    `requirements.txt` and runs `keycloak_init.py` as its entrypoint.
- **Python 3.7** — `keycloak-init/keycloak_init.py` and
  `keycloak-init/keycloak_logout.py`, using the Keycloak admin REST API
  (dependencies pinned in `keycloak-init/requirements.txt`).
- **FreeMarker (`.ftl`) templates and CSS/properties files** — the actual
  MOSIP theme customizations, under each variant's `theme/mosip/...` and
  `theme/base/...` directories (login, account, admin, email, welcome themes;
  translated message bundles for `ara`, `eng`, `fra`, `hin`, `kan`, `tam`).
- **Helm** — `helm/keycloak-init/` is a chart (`Chart.yaml`, `templates/`,
  `values.yaml`) that runs the `keycloak-init` image as a Kubernetes `Job`.
- **Bash** — `deploy/*.sh` scripts that call `helm`/`kubectl` to install,
  upgrade, export/import, and manage secrets for the Bitnami `mosip/keycloak`
  Helm chart (published from the separate `mosip-helm` repo, not from here).

## Build & Test Commands

There is no unified top-level build. Each piece is built/run independently.

Build a container image (from within the relevant directory, or with `-f` and
a build context):

```shell
docker build -t your-registry/mosip-jboss-keycloak:tag ./keycloak-jboss
docker build -t your-registry/mosip-artemis-keycloak:tag ./keycloak-artemis
docker build -t your-registry/keycloak-init:tag ./keycloak-init
```

Run the init script directly (outside Docker), from `keycloak-init/`:

```shell
pip3 install -r requirements.txt
python3 keycloak_init.py --help
```

`args_parse()` makes `server_url`, `user`, `password`, and `input_yaml` required
positional arguments — there is no environment-variable fallback when running
the script directly, and the Docker entrypoint has the same shape: it also
passes `$KEYCLOAK_ADMIN_PASSWORD` as a positional `argv` to `python3`
(`ENTRYPOINT ["/bin/bash", "-c", "python3 keycloak_init.py $KEYCLOAK_SERVER_URL
$KEYCLOAK_ADMIN_USER $KEYCLOAK_ADMIN_PASSWORD $INPUT_DIR/$INPUT_FILE"]`). Note
the entrypoint's variable expansions are **unquoted** — a value containing
whitespace, a glob character, or an empty value changes how many `argv`
elements `keycloak_init.py` actually receives and can break initialization;
quoting each expansion (`"$KEYCLOAK_SERVER_URL"`, etc.) would fix that, but
does not by itself remove the password from `argv`/process listings, so it's
a correctness fix, not a security fix. Populating the argument from a shell
variable (`"$KEYCLOAK_ADMIN_PASSWORD"`) avoids shell-history exposure but
**does not** prevent the password from appearing in process listings (`ps`)
in either mode — this is a real, pre-existing gap in `keycloak_init.py`, not
something documentation can fully mitigate. Use a placeholder when writing
examples, and if you're adding a genuine credential-handling improvement, add
stdin/file-descriptor input support to `keycloak_init.py` (and update the
Docker entrypoint to match) rather than relying on `argv`:

```shell
python3 keycloak_init.py https://iam.example.net admin_user '<password>' input.yaml
```

Helm chart dependency update, lint, and local install, from `helm/keycloak-init/`:

```shell
helm dependency update
helm lint .
helm install keycloak-init .
```

There are no unit/integration test suites in this repository. CI
(`.github/workflows/verify-keycloak-init.yml`) invokes a reusable
`verify-keycloak-init` workflow from `mosip/kattu` against
`helm/keycloak-init/values.yaml` whenever files under `helm/keycloak-init/**`
change; there is no equivalent verification for the theme or Docker changes.

## Configuration

- `keycloak-init/input.yaml` is the example configuration consumed by
  `keycloak_init.py` (realm, clients, roles, users, mappers). It is passed as
  a positional argument to the script or mounted at `$INPUT_DIR/$INPUT_FILE`
  inside the container (defaults: `INPUT_DIR=/opt/mosip/input`,
  `INPUT_FILE=input.yaml`, set as `ENV` in `keycloak-init/Dockerfile`).
- `keycloak-init/users.yaml` is a narrower example limited to user creation.
- The `keycloak_init.py` entrypoint also reads `KEYCLOAK_SERVER_URL`,
  `KEYCLOAK_ADMIN_USER`, `KEYCLOAK_ADMIN_PASSWORD`, and `FRONTEND_URL` as
  environment variables (see the `ENV` lines in `keycloak-init/Dockerfile`);
  none of these are given real defaults in the image, and admin credentials
  must never be committed — supply them via a Kubernetes Secret, CI secret
  store, or local environment variables at run time.
- `helm/keycloak-init/values.yaml` configures the init Job (image, resources,
  and the same Keycloak connection/realm settings) when deployed via Helm.
- `deploy/values.yaml` configures the Bitnami `mosip/keycloak` Helm release
  itself (chart version pinned to `7.1.18` in `deploy/install.sh`), including
  image repository/tag overrides and PostgreSQL image settings.
- `deploy/istio-addons-values.yaml` configures the Istio gateway/virtual
  service for the IAM host and **must be edited before running
  `install.sh`** — it ships with a placeholder host
  (`iam.sandbox.xyz.net`) and `install.sh` interactively refuses to
  proceed with that placeholder unless you confirm you already changed it.
- `deploy/import-init-values.yaml` configures realm/roles/clients/service
  account role mappings for `deploy/import-init.sh`.
- No `.env` files or committed credential files exist in this repo; secrets
  referenced by `deploy/*.sh` (e.g. the `keycloak` Secret and `global`
  ConfigMap) are expected to already exist in the target cluster.

## Project Structure Notes

```text
keycloak/
├── keycloak-jboss/     # Legacy JBoss-based Keycloak image + theme (mosip-jboss-keycloak) — keycloak-jboss/AGENTS.md
├── keycloak-artemis/   # Bitnami-based Keycloak image + theme + scripts (mosip-artemis-keycloak) — keycloak-artemis/AGENTS.md
├── keycloak-init/      # Python admin-API init job + Dockerfile (keycloak-init image) — keycloak-init/AGENTS.md
├── helm/keycloak-init/ # Helm chart that runs keycloak-init as a Kubernetes Job — helm/keycloak-init/AGENTS.md
└── deploy/             # Bash scripts + values.yaml to install/upgrade the Bitnami keycloak Helm chart — deploy/AGENTS.md
```

Each subfolder above has its own `AGENTS.md` with module-specific detail
(exact file layout, script/template internals, configuration knobs);
this root file covers what's shared across all of them.

`keycloak-jboss` and `keycloak-artemis` are two separately built and published
images (`mosip-jboss-keycloak` and `mosip-artemis-keycloak`, per
`.github/workflows/push-trigger.yml`), not build stages of one pipeline — do
not assume changing one affects the other, and check `theme.properties` in
both trees before assuming a theme change only needs to happen once. Both
theme trees are close to duplicates of each other (same message bundles,
similar CSS/img assets); when fixing a MOSIP theme issue, check whether the
change is needed in both `keycloak-jboss/theme/` and `keycloak-artemis/theme/`.

The `deploy/` scripts deploy the **upstream Bitnami `mosip/keycloak` Helm
chart** (published from the `mosip-helm` repository), not a chart in this
repo — this repo only supplies `values.yaml` overrides and install/upgrade
tooling for it, plus the separate `helm/keycloak-init` chart for the init Job.

## Development Workflow

- Confirm which image(s) your change affects (`keycloak-jboss`,
  `keycloak-artemis`, `keycloak-init`) and build/test that context locally
  with `docker build` before opening a PR — CI builds and pushes all three via
  a matrix job in `.github/workflows/push-trigger.yml` on pushes to `master`,
  `develop`, `1.*`, `release*`, and `MOSIP*` branches, and on PR
  open/reopen/synchronize.
- Changes under `helm/**` trigger `.github/workflows/chart-lint-publish.yml`
  (lint via the reusable `mosip/kattu` workflow; publish to the `mosip-helm`
  gh-pages repo on release or explicit dispatch).
- Changes under `helm/keycloak-init/**` additionally trigger
  `.github/workflows/verify-keycloak-init.yml`, which validates
  `helm/keycloak-init/values.yaml` via the reusable `verify-keycloak-init`
  workflow.
- Base your branch on `develop` (this is where active development happens;
  `master` and versioned branches like `1.*`/`release*`/`MOSIP*` are also
  build targets but are not where new work starts).
- Sign off commits (`git commit -s`) — MOSIP repos expect DCO-style
  sign-off trailers.

## Pull Request Guidelines

- There is no `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, or
  CODEOWNERS file in this repo. Follow the general MOSIP contribution guide
  linked from `README.md`: <https://docs.mosip.io/1.2.0/community/code-contributions>.
- Reference the tracking GitHub issue in the PR title/description (this repo's
  issues are filed at <https://github.com/mosip/keycloak/issues>, but
  cross-repo tracking issues such as `mosip-config` are also common).
- Keep changes scoped to the image/chart directory they affect; avoid
  unrelated changes to `keycloak-jboss`, `keycloak-artemis`, `keycloak-init`,
  `helm/`, or `deploy/` in the same PR unless the change genuinely spans them
  (e.g. a theme fix that must land in both `keycloak-jboss/theme` and
  `keycloak-artemis/theme`).
- Never commit real admin credentials, hostnames from a live environment, or
  filled-in secrets in `deploy/*.sh`, `deploy/values.yaml`,
  `deploy/istio-addons-values.yaml`, or `keycloak-init/input.yaml` — use
  placeholder values as the existing files do.

## Repository-Specific Considerations

- This is a **customization/packaging layer**, not the Keycloak project
  itself. When investigating behavior that isn't explained by files in this
  repo, the answer likely lives in upstream Keycloak or in the Bitnami base
  image (`docker.io/mosipid/keycloak:16.1.1` for `keycloak-artemis`,
  `jboss/keycloak:9.0.0` for `keycloak-jboss`), not in this repo's source.
- `keycloak-artemis/rootfs/opt/bitnami/scripts/...` overrides Bitnami's own
  entrypoint/setup/run scripts baked into the base image — read the existing
  script before modifying container startup behavior, since it is patching
  Bitnami's lifecycle scripts, not writing them from scratch.
- `deploy/install.sh` pins the Bitnami `mosip/keycloak` chart to version
  `7.1.18` intentionally (see `deploy/README.md`'s "Keycloak docker version"
  note: newer bitnami versions broke `userinfo` requests for clients like
  `mosip-prereg-client` at the time this was written) — do not bump this
  version without verifying the underlying issue is resolved.
- `deploy/install.sh` will refuse to proceed non-interactively if
  `deploy/istio-addons-values.yaml` still has its placeholder host; scripting
  around this in automation requires pre-editing that file, not just piping
  answers to the prompt.
- The realm export/import procedures differ by which image is deployed
  (JBoss 9.0.0 vs. Bitnami chart 7.1.18) — `deploy/README.md`'s "EXPORT" and
  "IMPORT" sections document two different mechanisms; do not conflate them.
- `keycloak-init/keycloak_init.py` includes explicit error-handling behavior:
  if `assign_client_roles_to_user` fails partway through, it restores the
  Keycloak admin client's realm to `master` before re-raising, so failures
  don't leave the admin client pointed at a non-master realm.

## Agent rules

### Do

1. Identify which of `keycloak-jboss/`, `keycloak-artemis/`, `keycloak-init/`,
   `helm/keycloak-init/`, or `deploy/` a change belongs to before editing, and
   keep the change scoped there.
2. Check both `keycloak-jboss/theme/` and `keycloak-artemis/theme/` when
   fixing a MOSIP theme/branding issue — they are maintained as two separate
   trees, not shared.
3. Use placeholder values for hosts, credentials, and secrets in any example
   or values file you edit, matching the existing convention in this repo.
4. Verify Docker base image tags (`jboss/keycloak:9.0.0`,
   `docker.io/mosipid/keycloak:16.1.1`, `python:3.7`) and the Bitnami chart
   version (`7.1.18` in `deploy/install.sh`) against the actual files before
   citing or changing them — do not assume newer versions are safe to adopt.
5. Sign off commits (`git commit -s`) and target the `develop` branch for new
   work.

### Do not

1. Do not describe this repo as building Keycloak from source — it packages
   themes, prebuilt deployment jars, and an init script on top of prebuilt
   upstream images.
2. Do not add or commit real credentials, live hostnames, or filled-in
   secrets to `deploy/*.sh`, `deploy/values.yaml`,
   `deploy/istio-addons-values.yaml`, or `keycloak-init/input.yaml`.
3. Do not bump the Bitnami Keycloak chart version pinned in
   `deploy/install.sh` without verifying the `userinfo`-request regression
   noted in `deploy/README.md` no longer applies.
4. Do not assume a test suite exists for theme or Docker changes — there
   is none; only `helm/keycloak-init/**` changes get automated verification
   (`.github/workflows/verify-keycloak-init.yml`).
5. Do not conflate the JBoss-based export procedure with the Bitnami-based
   export/import procedure documented in `deploy/README.md` — they use
   different mechanisms (`export.sh` vs. `KEYCLOAK_EXTRA_ARGS` migration
   properties).
