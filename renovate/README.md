# Renovate Configs

This directory contains configuration files for the Renovate bot, which is used to automate dependency updates across projects. These configs can be used as templates or directly in your repositories to ensure consistent update practices.

## Available Configurations

- `recommended.json`: For applications. Based on `config:best-practices`, pins dependencies and GitHub Action digests, uses gitmoji commit messages, waits 3 days after a release, and automerges patch updates, digests and lockfile maintenance.
- `library.json`: For libraries. Same as `recommended.json`, but without pinning, so dependency ranges stay untouched.
- `aggressive-dev.json`: `recommended.json` plus branch automerge (no PR) for minor and patch updates of dev dependencies.
- `friedinger.json`: Skips the release age wait for packages from Friedinger repositories. Use it in addition to one of the configs above.

## Structure

The files in this directory are generated and must not be edited by hand. The sources live in `src/` (building blocks in `src/base/`), and `build.mjs` resolves all `extends` of this repository into standalone files. This way a tag like `#v1.3.1` contains everything and no preset points to `main`.

After changing a source file, regenerate the configs and commit them together with the change:

```bash
npm run renovate:build
```

The CI checks that the generated files are up to date (`npm run renovate:check`).

## Validation

To validate changes on these configs, we have a GitHub Action set up in the `.github/workflows/check-release.yml` workflow. It checks for syntax errors and ensures that the configurations adhere to best practices before any release is made.

To run the validation locally, you can use the following command:

```bash
npx --yes --package renovate -- renovate-config-validator renovate/<config-name>.json
```
