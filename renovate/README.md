# Renovate Configs

This directory contains configuration files for the Renovate bot, which is used to automate dependency updates across projects. These configs can be used as templates or directly in your repositories to ensure consistent update practices.

## Available Configurations

- `recommended.json`: A general-purpose config with balanced update frequency and risk management.
- `library.json`: Tailored for libraries, focusing on stability and less frequent updates.
- `aggressive-dev.json`: For development projects that want to stay on the cutting edge with more frequent updates.
- `friedinger.json`: A custom config for Friedinger projects, optimized for our specific needs.

## Validation

To validate changes on these configs, we have a GitHub Action set up in the `.github/workflows/check-release.yml` workflow. It checks for syntax errors and ensures that the configurations adhere to best practices before any release is made.

To run the validation locally, you can use the following command:

```bash
npx --yes --package renovate -- renovate-config-validator renovate/<config-name>.json
```
