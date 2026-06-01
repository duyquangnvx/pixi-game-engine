import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, "tmp/**"],
    environmentMatchGlobs: [
      ["packages/react/src/**", "jsdom"],
      ["**/*.dom.test.ts", "jsdom"],
      ["**/*.dom.test.tsx", "jsdom"]
    ],
    typecheck: { include: ["**/*.test-d.ts"] },
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**"],
      // Excluded: barrels + browser-boot/DOM glue verified by the demo, not units.
      exclude: [
        "packages/*/src/index.ts",
        "packages/react/src/game.ts",
        "packages/react/src/mount.tsx",
        "packages/react/src/styles.ts",
        "packages/pixi/src/view/view.ts",
        "packages/pixi/src/input/dom-source.ts",
        "packages/pixi/src/dev/dev-fps.ts",
        "packages/**/*.test.*",
        "packages/**/*.test-d.ts"
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  }
});
