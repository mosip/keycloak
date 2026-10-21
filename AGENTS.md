# AGENTS.md

Guidance for coding agents working in `mosip/keycloak`.

## Keycloak init mappers

`keycloak-init/keycloak_init.py` creates protocol mappers. Each client `mappers` entry is passed to `create_mapper`, which calls `mapper_payload`. Add a new audience through that list. Do not add another mapper implementation.

- Leave `protocol_mapper` unset, or set `oidc-usermodel-attribute-mapper`, for a user-attribute mapper. Those entries use `mapper_name`, `mapper_user_attribute`, and `token_claim_name`.
- Set `protocol_mapper: oidc-audience-mapper` to add one value to the access token `aud`. Set exactly one of `included_client_audience` (a client id in the same realm) or `included_custom_audience` (a literal audience). The script sets `access.token.claim` to `true`. An entry with both fields is rejected, because Keycloak keeps `included.client.audience` and ignores `included.custom.audience`.
- Any other `protocol_mapper` is rejected. `validate_configured_mappers` checks every entry before a realm or client is created or updated. One bad entry stops the run before Keycloak is changed.
- A re-run skips a mapper name that already exists (HTTP 409). The stored mapper is left as it is. To change an audience, delete that mapper in Keycloak and run init again. Any other Keycloak error is raised.
- Chart mapper lists live in `helm/keycloak-init/values.yaml`. Add an audience entry only on the client that needs it. Existing user-attribute mappers stay unchanged.
