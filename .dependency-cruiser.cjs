/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-no-pixi-react",
      comment: "store/bridge/services must stay engine-agnostic (no pixi.js or react)",
      severity: "error",
      from: { path: "packages/core/src/(store|bridge|services)\\.ts$" },
      to: { path: "node_modules/(pixi\\.js|react|react-dom)" }
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
