import "@studio/core";

declare module "@studio/core" {
  interface SceneMap {
    Boot: void;
    Menu: void;
    Game: { level?: number };
    Pause: void;
  }
}
