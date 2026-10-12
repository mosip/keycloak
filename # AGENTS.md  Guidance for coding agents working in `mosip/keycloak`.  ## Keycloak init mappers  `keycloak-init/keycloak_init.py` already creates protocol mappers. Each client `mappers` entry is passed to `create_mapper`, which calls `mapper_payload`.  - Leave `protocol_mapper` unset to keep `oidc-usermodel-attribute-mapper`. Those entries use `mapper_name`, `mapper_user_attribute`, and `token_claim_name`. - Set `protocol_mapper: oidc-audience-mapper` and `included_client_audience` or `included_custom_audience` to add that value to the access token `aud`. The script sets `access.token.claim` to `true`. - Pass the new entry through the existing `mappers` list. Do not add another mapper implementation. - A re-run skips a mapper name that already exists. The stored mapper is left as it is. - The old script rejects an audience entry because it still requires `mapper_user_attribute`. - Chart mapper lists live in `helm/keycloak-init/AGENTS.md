# AGENTS.md

Guidance for coding agents working in `mosip/keycloak`.

## Keycloak init mappers

`keycloak-init/keycloak_init.py` already creates protocol mappers. Each client `mappers` entry is passed to `create_mapper`, which calls `mapper_payload`.

- Leave `protocol_mapper` unset to keep `oidc-usermodel-attribute-mapper`. Those entries use `mapper_name`, `mapper_user_attribute`, and `token_claim_name`.
- Set `protocol_mapper: oidc-audience-mapper` and `included_client_audience` or `included_custom_audience` to add that value to the access token `aud`. The script sets `access.token.claim` to `true`.
- Pass the new entry through the existing `mappers` list. Do not add another mapper implementation.
- A re-run skips a mapper name that already exists. The stored mapper is left as it is.
- The old script rejects an audience entry because it still requires `mapper_user_attribute`.
- Chart mapper lists live in `helm/keycloak-init/values.yaml`. Add an audience entry only on the client that needs it. Existing user-attribute mappers stay unchanged.
