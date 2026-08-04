# Contributing

Thanks for helping build Standout Studio.

## Workflow

1. Pull the latest `main`.
2. Create a short-lived branch: `feat/...`, `fix/...`, or `chore/...`.
3. Keep PRs focused on one section or concern when possible.
4. Match the approved Figma mockup for layout, spacing, type, and color.
5. Desktop and mobile are first-class. Do not shrink a desktop layout and call it done.

## Code standards

- TypeScript throughout.
- Prefer small, named components under `src/components`.
- Keep copy in `src/content` instead of hardcoding strings in deep component trees.
- No em dashes (`—`) in UI copy, comments, commits, or docs.
- No generated-by tool attribution in code, commits, or GitHub metadata.

## Design reference

Figma file: https://www.figma.com/design/nLEk8UpVUfFg1SsvmXmjnG

Implement against that source of truth. If code and Figma disagree, raise it in the PR.

## Local checks before opening a PR

```bash
npm run lint
npm run build
```

## Contact

Project owners: Rayann and Steven.
