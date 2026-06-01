/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "kernel-agnostic",
      comment:
        "The engine-agnostic kernel (files directly under packages/core/src/, except game.ts and index.ts) must not depend at runtime on Pixi or React — neither the node_modules packages nor the local src/pixi/ and src/react/ layers. Type-only references (e.g. forward type-refs in types.ts) are exempt since they are erased at build.",
      severity: "error",
      from: {
        path: "^packages/core/src/[^/]+\\.ts$",
        pathNot: "packages/core/src/(game|index)\\.ts$|\\.test\\.ts$"
      },
      to: {
        path: "^packages/core/src/(pixi|react)/|node_modules/(pixi\\.js|react|react-dom)",
        dependencyTypesNot: ["type-only"]
      }
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.base.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require"] }
  }
};
