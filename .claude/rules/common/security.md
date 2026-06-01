# Security Guidelines

> Scope: a local, single-user, BYOK CLI — no server, no auth, no browser. Web concerns
> (CSRF, XSS, rate limiting, session auth) don't apply; secret handling, input validation,
> and path safety do.

## Mandatory Security Checks

- [ ] No hardcoded secrets — BYOK keys come from env/config, never source
- [ ] All external input validated before use (file content, API responses, CLI args)
- [ ] File paths sanitized — no traversal outside the workspace root
- [ ] Error messages don't leak secrets

## Secret Management

- NEVER hardcode secrets in source code
- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed
