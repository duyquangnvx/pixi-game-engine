import type { ReactNode } from "react";
import { useSceneStack } from "./hooks";

export function Overlay(): ReactNode {
  const stack = useSceneStack();
  return (
    <>
      {stack.map((entry) =>
        entry.Screen ? (
          <entry.Screen key={entry.key} data={entry.data} scene={entry.instance} />
        ) : null
      )}
    </>
  );
}
