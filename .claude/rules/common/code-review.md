# Code Review Standards

## Review Checklist

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No hardcoded secrets or credentials
- [ ] No console.log or debug statements
- [ ] Tests exist for new core/domain logic (per project/principles.md phase policy)

## Security-Sensitive Areas

Apply extra scrutiny when changes touch:

- External input handling (file content, API responses, CLI args)
- Database (SQLite index) queries
- File system operations and path construction
- External API calls (LLM / TTS / upload providers)
- Secret/credential handling

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
| HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
| MEDIUM | Maintainability concern | **INFO** - Consider fixing |
| LOW | Style or minor suggestion | **NOTE** - Optional |

## Common Issues to Catch

### Security

- Hardcoded credentials (API keys, tokens)
- Path traversal (unsanitized file paths escaping the workspace root)
- Unvalidated external input (file content, API responses) trusted as-is

### Code Quality

- Large functions (>50 lines) - split into smaller
- Large files (>800 lines) - extract modules
- Deep nesting (>4 levels) - use early returns
- Missing error handling - handle explicitly
- Mutation patterns - prefer immutable operations
- Missing tests - add test coverage

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Missing caching - cache expensive operations
