#!/bin/sh
# Regenerates config.json (pure JSON, fetched by the app at boot — see
# src/config.ts) from the container's environment at startup, so a single
# built image can be reused across stage/production by only changing
# AUTH_URL / API_URL / IDENTITY_API_URL.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.json

# Escapes backslashes and double quotes so env var values can't break out
# of the JSON string they're interpolated into.
json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

AUTH_URL_JSON=$(json_escape "${AUTH_URL:-}")
API_URL_JSON=$(json_escape "${API_URL:-}")
IDENTITY_API_URL_JSON=$(json_escape "${IDENTITY_API_URL:-}")

cat <<EOF > "$CONFIG_FILE"
{
  "AUTH_URL": "$AUTH_URL_JSON",
  "API_URL": "$API_URL_JSON",
  "IDENTITY_API_URL": "$IDENTITY_API_URL_JSON"
}
EOF

exec "$@"
