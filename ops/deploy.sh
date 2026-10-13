#!/usr/bin/env bash
# Upload a built dist/ to the VPS as a new release and switch to it atomically.
#
#   ops/deploy.sh deploy@journal.example.com [dist]
#
# Environment (all optional):
#   DEPLOY_ROOT     directory on the server (default /var/www/gratitude-journal)
#   SSH_PORT        SSH port (default 22)
#   SSH_KEY_FILE    private key to use instead of your SSH agent / default key
#   KEEP_RELEASES   how many releases to keep for rollback (default 5)
set -euo pipefail

target=${1:?usage: ops/deploy.sh user@host [dist-dir]}
dist=${2:-dist}
root=${DEPLOY_ROOT:-/var/www/gratitude-journal}
port=${SSH_PORT:-22}
keep=${KEEP_RELEASES:-5}

[[ -f "$dist/index.html" ]] || { echo "No build in $dist/ (run: BASE_PATH=/ npm run build)" >&2; exit 1; }
[[ "$keep" =~ ^[1-9][0-9]*$ ]] || { echo "KEEP_RELEASES must be a positive number" >&2; exit 1; }

ssh_opts=(-p "$port" -o BatchMode=yes)
[[ -n "${SSH_KEY_FILE:-}" ]] && ssh_opts+=(-i "$SSH_KEY_FILE" -o IdentitiesOnly=yes)

rev=$(git rev-parse --short HEAD 2>/dev/null || echo manual)
release="$(date -u +%Y%m%d%H%M%S)-$rev"

echo "Uploading $dist/ to $target:$root/releases/$release"
# shellcheck disable=SC2029 # expanding locally is intended
ssh "${ssh_opts[@]}" "$target" "mkdir -p $(printf '%q' "$root/releases/$release")"
rsync -rlz --chmod=D755,F644 -e "ssh ${ssh_opts[*]}" "$dist/" "$target:$root/releases/$release/"

echo "Switching current -> releases/$release"
# ssh joins arguments into one command line, so quote them for the remote shell.
# shellcheck disable=SC2029 # expanding locally is intended
ssh "${ssh_opts[@]}" "$target" "bash -s -- $(printf '%q ' "$root" "$release" "$keep")" <<'REMOTE'
set -euo pipefail
root=$1 release=$2 keep=$3
cd "$root"
# Renaming a fresh symlink over the old one is atomic: requests never see a half-deployed site.
ln -sfn "releases/$release" current.tmp
mv -Tf current.tmp current
# Prune the oldest releases, never the live one.
ls -1 releases | sort | head -n "-$keep" | while read -r old; do
  [[ "$old" == "$release" ]] || rm -rf "releases/$old"
done
echo "Live: $(readlink current). Kept: $(ls -1 releases | wc -l) release(s)."
REMOTE
