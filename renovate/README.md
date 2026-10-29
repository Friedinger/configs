# Renovate Configs

This directory contains configuration files for the Renovate bot, which is used to automate dependency updates across projects. These configs can be used as templates or directly in your repositories to ensure consistent update practices.

## Available Configurations

- `recommended.json`: For applications. Based on `config:best-practices`, pins dependencies and GitHub Action digests, uses gitmoji commit messages, waits 3 days after a release, automerges patch updates, digests and lockfile maintenance, and updates the Node.js major version (`mise.toml`) together with `@types/node` in one PR.
- `library.json`: For libraries. Same as `recommended.json`, but it does not pin dependencies, so the ranges of runtime dependencies stay untouched (dev dependencies are still pinned by `config:best-practices`).
- `automerge-dev.json`: `recommended.json` plus branch automerge (no PR) for minor and patch updates of dev dependencies.
- `friedinger.json`: Skips the release age wait for packages from Friedinger repositories. Use it in addition to one of the configs above.

## Structure

The top-level files in this directory (`recommended.json` etc.) are generated and must not be edited or committed by hand. The sources live in `src/` (building blocks in `src/base/`) and reference each other with `@/`, which points to `src/`. `build.mjs` resolves all of them into standalone files, so a release tag (e.g. `#v1.4.0`) contains everything and no preset points to `main`.

CI builds and commits the generated files on `main` and again when releasing, before the tag is created. Feature branches must not change them (CI fails otherwise). To try a change locally, run:

```bash
npm run renovate:build
```

## Validation

To validate changes on these configs, we have a GitHub Action set up in the `.github/workflows/check-release.yml` workflow. It builds the configs and checks them for syntax errors before any release is made.

To run the validation locally, you can use the following command:

```bash
npx --yes --package renovate -- renovate-config-validator --strict renovate/<config-name>.json
```
