# Tooling

- **Package Manager**: pnpm (repo-managed)
- **Node**: version specified in `.node-version`
- **Formatter**: Oxfmt
- **Linter**: Oxlint
- **Build**: tsdown (outputs ESM and TypeScript declarations with declaration maps to `dist/`)

## Package Contents

`prepack` runs the library build before packing or publishing. The package ships
`dist/` with declaration maps and a sibling `src/` directory for editor navigation.
The maps point from `dist/index.d.ts` to `../src/index.tsx`. Source files support
navigation only; consumers import the public package entry from `dist/`.

See [Testing](testing.md#package-and-source-navigation) for package and editor acceptance steps.
