# Testing Requirements

> The *phase policy* — what to test now, coverage threshold, E2E deferral — lives in
> [project/principles.md](../project/principles.md) and overrides this file. Here: only
> *how* to write a good test. (Current phase: TDD on `core/`/domain; E2E and the 80%
> threshold deferred until approaching release.)

## Test Structure (AAA Pattern)

Prefer Arrange-Act-Assert structure for tests:

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

## Test Naming

Use descriptive names that explain the behavior under test:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```

## Fixing Failing Tests

- Fix the implementation, not the test (unless the test is wrong)
- Check test isolation
- Verify mocks are correct
