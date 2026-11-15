# Dependency security maintenance

Use Node.js 24. Dependencies and lockfiles have been updated against the current advisory database. CI audits the full dependency graph and builds the application.

Run `npm ci`, `npm audit`, and `npm run build`.

The Owlbear SDK currently pins an affected UUID version. A scoped override supplies UUID 11.1.1 or newer; its `v4` API stays compatible. Remove the override after the SDK updates its own requirement.

The minimatch override patches the linter/build-tool dependency until its parent updates. Builds verify compatibility with the patched dependency.

Builds do not require private development certificates. When `.certs/key.pem` and `.certs/cert.pem` are present, the development server uses HTTPS. Configure those locally when testing inside Owlbear. The glob and brace-expansion overrides patch the Tailwind/Sucrase build chain.
