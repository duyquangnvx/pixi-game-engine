import { expectTypeOf } from "vitest";
import type { InputFacade, AxisValue } from "./types";

declare const facade: InputFacade;

// axis(...) returns the {x,y} shape
expectTypeOf(facade.axis("move")).toEqualTypeOf<AxisValue>();
expectTypeOf<AxisValue>().toEqualTypeOf<{ x: number; y: number }>();

// isDown(...) is a boolean predicate
expectTypeOf(facade.isDown("jump")).toEqualTypeOf<boolean>();
