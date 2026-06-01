import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [["packages/core/src/react/**", "jsdom"], ["**/*.dom.test.ts", "jsdom"], ["**/*.dom.test.tsx", "jsdom"]],
    coverage: {
      provider: "v8",
      include: ["packages/core/src/**"],
      // Excluded: barrel + browser-boot/DOM glue that is verified by the demo,
      // not by unit tests. The unit-testable core carries the threshold.
      exclude: [
        "packages/core/src/index.ts",
        "packages/core/src/game.ts",
        "packages/core/src/pixi/view.ts",
        "packages/core/src/pixi/input-source.ts",
        "packages/core/src/react/mount.tsx",
        "packages/core/src/react/styles.ts",
        "packages/core/src/**/*.test.*"
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  }
});
