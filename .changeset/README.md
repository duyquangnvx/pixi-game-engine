# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

Run `pnpm changeset` to create a new changeset when making changes that should be released.

## Publishing

Merging to `main` triggers the publish workflow which creates a version PR or publishes if changesets exist.
