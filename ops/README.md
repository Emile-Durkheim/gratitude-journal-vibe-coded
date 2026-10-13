# Hosting on your own VPS

The journal is a static site: one `dist/` folder of HTML, JS, CSS and icons. There is no backend and no database, since every entry lives in the visitor's browser. Hosting it means serving that folder over HTTPS with the right cache headers.

This guide sets up nginx on a Debian or Ubuntu server, deploys from your machine or from GitHub Actions, and keeps a few earlier releases around for instant rollback. GitHub Pages keeps working alongside it; the VPS deploy only runs once you switch it on.

## What's in here

| File | What it is |
| --- | --- |
| `setup-server.sh` | One-time server setup: nginx, certbot, rsync, a `deploy` user and the web root. |
| `nginx/gratitude-journal.conf` | The nginx site (`__DOMAIN__` and `__DEPLOY_ROOT__` are filled in by the setup script). |
| `nginx/snippets/gratitude-journal-headers.conf` | Security headers, included in every location. |
| `deploy.sh` | Uploads a build as a new release and switches to it atomically. Used by you and by CI. |
| `rollback.sh` | Points the site back at an earlier release. |
| `../.github/workflows/deploy-vps.yml` | The CI deploy, off until you enable it. |

## How a deploy looks on the server

```
/var/www/gratitude-journal/
├── current -> releases/20261013120000-6874bee   # nginx serves this
└── releases/
    ├── 20261012090000-af5e96b
    └── 20261013120000-6874bee
```

Each deploy uploads into a new folder under `releases/`, then renames a fresh `current` symlink over the old one. The switch is atomic, so a visitor never gets half of one release and half of another. The five newest releases are kept.

## You need

- A VPS running Debian 12+ or Ubuntu 22.04+, with root (or sudo) SSH access.
- A domain or subdomain you can point at it, e.g. `journal.example.com`. HTTPS is not optional here: service workers, installation and notifications only work on a secure origin.
- Locally: Node 22, `ssh` and `rsync`.

## 1. Point DNS at the server

Create an `A` record (and an `AAAA` record if the server has IPv6) for your domain with the server's IP address. Check it before going on, because certbot needs it in step 4:

```sh
dig +short journal.example.com
```

## 2. Create a deploy key

On your machine, make a key pair used only for deploying. Leave the passphrase empty if CI will use it.

```sh
ssh-keygen -t ed25519 -f ~/.ssh/gratitude-journal-deploy -C gratitude-journal-deploy
```

## 3. Set up the server

Copy this `ops/` folder to the server and run the setup script with your domain and the public key:

```sh
scp -r ops root@journal.example.com:/root/gratitude-journal-ops
ssh root@journal.example.com
cd /root/gratitude-journal-ops
./setup-server.sh journal.example.com "ssh-ed25519 AAAA... gratitude-journal-deploy"
```

The second argument is the public key, the single line printed by `cat ~/.ssh/gratitude-journal-deploy.pub` on your machine.

The script:

1. installs `nginx`, `rsync`, `certbot` and its nginx plugin,
2. creates a `deploy` user that can only log in with the key you passed and has no sudo,
3. creates `/var/www/gratitude-journal/releases`, owned by `deploy`,
4. installs the nginx site and headers snippet, checks the config with `nginx -t`, and reloads nginx,
5. opens ports 80 and 443 if `ufw` is active.

It is safe to run again. `DEPLOY_USER` and `DEPLOY_ROOT` change the user name and web root if you want something else.

<details>
<summary>Doing it by hand instead</summary>

```sh
apt-get update && apt-get install -y nginx rsync certbot python3-certbot-nginx
adduser --disabled-password --gecos "" deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "ssh-ed25519 AAAA... gratitude-journal-deploy" >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys
install -d -m 755 -o deploy -g deploy /var/www/gratitude-journal /var/www/gratitude-journal/releases
cp nginx/snippets/gratitude-journal-headers.conf /etc/nginx/snippets/
sed -e 's|__DOMAIN__|journal.example.com|' -e 's|__DEPLOY_ROOT__|/var/www/gratitude-journal|' \
  nginx/gratitude-journal.conf > /etc/nginx/sites-available/gratitude-journal.conf
ln -s /etc/nginx/sites-available/gratitude-journal.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

</details>

## 4. Turn on HTTPS

Still on the server:

```sh
certbot --nginx -d journal.example.com
```

Certbot adds the HTTPS listener and an HTTP to HTTPS redirect to the site file, and installs a timer that renews the certificate. `certbot renew --dry-run` confirms renewal works.

Once the site loads over HTTPS and you're sure it stays HTTPS-only, you can uncomment the `Strict-Transport-Security` line in `/etc/nginx/snippets/gratitude-journal-headers.conf` and `systemctl reload nginx`.

## 5. First deploy from your machine

From the repository root:

```sh
npm ci
BASE_PATH=/ npm run build
SSH_KEY_FILE=~/.ssh/gratitude-journal-deploy ops/deploy.sh deploy@journal.example.com
```

`BASE_PATH=/` matters: without it the build assumes it lives under `/gratitude-journal-vibe-coded/` like on GitHub Pages, and the page loads blank.

Open `https://journal.example.com`. Until this first deploy, nginx answers 404 because `current` doesn't exist yet.

`deploy.sh` reads these optional variables: `DEPLOY_ROOT` (default `/var/www/gratitude-journal`), `SSH_PORT` (default 22), `SSH_KEY_FILE`, and `KEEP_RELEASES` (default 5).

## 6. Deploy from GitHub Actions

`.github/workflows/deploy-vps.yml` runs on every push to `main` (and by hand from the Actions tab): it tests, builds with `BASE_PATH=/`, and runs `ops/deploy.sh`. It is skipped until you enable it, and it runs next to the GitHub Pages deploy, not instead of it.

In the repository, open **Settings → Secrets and variables → Actions**.

**Secrets** (tab "Secrets"):

| Name | Value |
| --- | --- |
| `VPS_SSH_KEY` | The private deploy key: the whole of `~/.ssh/gratitude-journal-deploy`, including the `BEGIN`/`END` lines. |
| `VPS_KNOWN_HOSTS` | The server's host key, so CI can't be fooled by another machine. Get it with `ssh-keyscan -t ed25519 journal.example.com` and compare its fingerprint (`ssh-keygen -lf <(ssh-keyscan -t ed25519 journal.example.com)`) to the one on the server (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`). |

**Variables** (tab "Variables"):

| Name | Required | Value |
| --- | --- | --- |
| `VPS_DEPLOY_ENABLED` | yes | `true`. Must be a repository variable, not an environment one, because it decides whether the job starts at all. |
| `VPS_HOST` | yes | `journal.example.com` or the server's IP. |
| `VPS_USER` | no | Defaults to `deploy`. |
| `VPS_PORT` | no | Defaults to `22`. |
| `VPS_DEPLOY_ROOT` | no | Defaults to `/var/www/gratitude-journal`. |
| `VPS_BASE_PATH` | no | Defaults to `/`. See "Serving under a sub-path" below. |
| `VPS_URL` | no | `https://journal.example.com`. When set, the run links to it and fails if it doesn't answer after the deploy. |

The job runs in a GitHub environment called `vps`, created on its first run. Under **Settings → Environments → vps** you can restrict it to the `main` branch or require an approval before each deploy, and you can keep the secrets and variables there instead (all except `VPS_DEPLOY_ENABLED`).

Then push to `main`, or run "Deploy to VPS" from the Actions tab.

### Only want the VPS?

Delete `.github/workflows/deploy.yml` (or disable "Deploy to GitHub Pages" in the Actions tab) and turn off Pages under **Settings → Pages**.

## Rolling back

```sh
SSH_KEY_FILE=~/.ssh/gratitude-journal-deploy ops/rollback.sh deploy@journal.example.com              # one release back
SSH_KEY_FILE=~/.ssh/gratitude-journal-deploy ops/rollback.sh deploy@journal.example.com 20261012090000-af5e96b
```

It lists the releases on the server and marks the live one. The next deploy moves forward again as usual.

## Caching and updates

The nginx site is set up so a deploy reaches people who installed the app:

- `index.html`, `sw.js`, `registerSW.js` and `manifest.webmanifest` are sent with `Cache-Control: no-cache`, so the browser checks for a new version on every visit.
- Everything under `/assets/` has a content hash in its name and is cached for a year as `immutable`.
- The service worker then downloads the new release in the background and switches to it on the next load. Nothing is stored on the server, so journal entries are never touched by a deploy or a rollback.

## Serving under a sub-path

To serve the app at e.g. `https://example.com/journal/` on a server that already hosts something else, set `VPS_BASE_PATH` to `/journal/` (or build locally with `BASE_PATH=/journal/`) and, instead of the site file, add this to the existing `server` block:

```nginx
location /journal/ {
    alias /var/www/gratitude-journal/current/;
    try_files $uri $uri/ =404;
    add_header Cache-Control "no-cache" always;
    location /journal/assets/ {
        alias /var/www/gratitude-journal/current/assets/;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }
}
```

Note that a different path or domain is a different app to the browser: entries written on GitHub Pages stay there. Use **Export backup** in the old app's settings and **Import** in the new one to move them.

## Troubleshooting

- **Blank page, 404s for `/gratitude-journal-vibe-coded/assets/...`:** the build was made without `BASE_PATH=/`.
- **`Permission denied (publickey)`:** the public key isn't in `/home/deploy/.ssh/authorized_keys`, or `VPS_SSH_KEY` is missing a line. Test with `ssh -i ~/.ssh/gratitude-journal-deploy deploy@journal.example.com true`.
- **`Host key verification failed` in CI:** `VPS_KNOWN_HOSTS` is empty or for another host name; regenerate it with `ssh-keyscan` using the exact `VPS_HOST` value.
- **403 Forbidden:** nginx can't read the files. Releases should be `755` folders and `644` files; `deploy.sh` sets that.
- **Still seeing the old version:** the service worker updates in the background, so close all tabs of the app (or the installed app) and open it again.
- **Logs:** `journalctl -u nginx`, `/var/log/nginx/error.log` and `/var/log/nginx/access.log`.
