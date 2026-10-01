## Cursor Cloud specific instructions

This is a single Node.js app: a trigram text generator with a CLI (`trigram.js`) and an Express UI (`trigram-web-server.js`). SQLite is embedded in `db/tgfiles.db` (opened by `trigram-db.js` on import). No Postgres, Docker, or other services are required. `db/tgfiles.db` is tracked; running the CLI or the web app rewrites it, and web uploads also copy files into `uploads/`. Do not commit those runtime changes.

### Node 12

`sqlite3@4.1.0` only has prebuilt binaries through the Node 12 ABI (`node-v72`). The image `node` on `PATH` is `/exec-daemon/node` (Node 22), which cannot install or load that module. Node 12.22.12 is installed under nvm and set as the nvm default. Put it first before install, test, lint, or run:

```bash
export PATH="$HOME/.nvm/versions/node/v12.22.12/bin:$PATH"
```

### Commands

- Install and test are in `package.json` (`npm install`, `npm test`).
- Lint has no npm script. Run `npx eslint .`. `.eslintrc.js` sets `env.browser` only, so a clean tree still reports `no-undef` for Node and Jest globals.
- There is no `start` script. The UI is `node trigram-web-server.js` and listens on port 4200.
- CLI usage is in `README.md`. Invoke `node trigram.js` (the README examples omit `.js`). `seedWords` must be two consecutive words that already appear in the source text.
