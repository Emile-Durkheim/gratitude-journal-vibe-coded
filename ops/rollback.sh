#!/usr/bin/env bash
# Point `current` back at an earlier release on the VPS.
#
#   ops/rollback.sh deploy@journal.example.com            # the release before the live one
#   ops/rollback.sh deploy@journal.example.com <release>  # a specific one (see the list it prints)
#
# Uses the same DEPLOY_ROOT, SSH_PORT and SSH_KEY_FILE variables as deploy.sh.
set -euo pipefail

target=${1:?usage: ops/rollback.sh user@host [release]}
wanted=${2:-}
root=${DEPLOY_ROOT:-/var/www/gratitude-journal}

ssh_opts=(-p "${SSH_PORT:-22}" -o BatchMode=yes)
[[ -n "${SSH_KEY_FILE:-}" ]] && ssh_opts+=(-i "$SSH_KEY_FILE" -o IdentitiesOnly=yes)

# ssh joins arguments into one command line, so quote them for the remote shell (an empty
# release name must survive as an argument).
# shellcheck disable=SC2029 # expanding locally is intended
ssh "${ssh_opts[@]}" "$target" "bash -s -- $(printf '%q ' "$root" "$wanted")" <<'REMOTE'
set -euo pipefail
root=$1 wanted=$2
cd "$root"
live=$(basename "$(readlink current)")
echo "Releases (oldest first, * = live):"
ls -1 releases | sort | sed "s/^$live\$/$live */"
if [[ -z "$wanted" ]]; then
  wanted=$(ls -1 releases | sort | grep -B1 -x "$live" | head -n1)
  [[ "$wanted" != "$live" ]] || { echo "No earlier release to roll back to." >&2; exit 1; }
fi
[[ -d "releases/$wanted" ]] || { echo "No release named $wanted" >&2; exit 1; }
ln -sfn "releases/$wanted" current.tmp
mv -Tf current.tmp current
echo "Live: releases/$wanted"
REMOTE
