#!/usr/bin/env bash
# One-time setup of a fresh Debian/Ubuntu VPS. Run as root from a copy of the ops/ directory:
#
#   sudo ./setup-server.sh journal.example.com ["ssh-ed25519 AAAA... deploy-key"]
#
# Safe to run again: it only creates what is missing. An nginx site that certbot has already
# edited is left alone unless FORCE_NGINX=1 (then rerun certbot afterwards).
#
# Environment (optional): DEPLOY_USER (default deploy), DEPLOY_ROOT (default /var/www/gratitude-journal)
set -euo pipefail

domain=${1:?usage: setup-server.sh <domain> [deploy-public-key]}
pubkey=${2:-}
user=${DEPLOY_USER:-deploy}
root=${DEPLOY_ROOT:-/var/www/gratitude-journal}
here=$(cd "$(dirname "$0")" && pwd)

[[ $EUID -eq 0 ]] || { echo "Run as root (sudo)." >&2; exit 1; }

echo "== Packages"
apt-get update -q
DEBIAN_FRONTEND=noninteractive apt-get install -yq nginx rsync certbot python3-certbot-nginx

echo "== Deploy user '$user' (SSH key only, no sudo)"
id "$user" &>/dev/null || adduser --disabled-password --gecos "" "$user"
install -d -m 700 -o "$user" -g "$user" "/home/$user/.ssh"
touch "/home/$user/.ssh/authorized_keys"
if [[ -n "$pubkey" ]] && ! grep -qxF "$pubkey" "/home/$user/.ssh/authorized_keys"; then
  echo "$pubkey" >> "/home/$user/.ssh/authorized_keys"
fi
chown "$user:$user" "/home/$user/.ssh/authorized_keys"
chmod 600 "/home/$user/.ssh/authorized_keys"

echo "== Web root $root"
install -d -m 755 -o "$user" -g "$user" "$root" "$root/releases"

echo "== nginx site for $domain"
install -m 644 "$here/nginx/snippets/gratitude-journal-headers.conf" /etc/nginx/snippets/
site=/etc/nginx/sites-available/gratitude-journal.conf
if [[ -f "$site" ]] && grep -q "managed by Certbot" "$site" && [[ "${FORCE_NGINX:-}" != 1 ]]; then
  echo "Keeping $site (certbot has added HTTPS to it; FORCE_NGINX=1 overwrites it)."
else
  sed -e "s|__DOMAIN__|$domain|g" -e "s|__DEPLOY_ROOT__|$root|g" "$here/nginx/gratitude-journal.conf" > "$site"
fi
ln -sfn "$site" /etc/nginx/sites-enabled/gratitude-journal.conf
nginx -t
systemctl reload nginx

if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  echo "== Firewall: allowing HTTP and HTTPS"
  ufw allow 'Nginx Full'
fi

cat <<NEXT

Done. Next:
  1. Point the DNS A/AAAA record of $domain at this server.
  2. Get a certificate:  certbot --nginx -d $domain
  3. Deploy a build from your machine or let CI do it (see ops/README.md).
NEXT
