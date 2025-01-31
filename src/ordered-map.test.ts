import { test, expect } from "vitest";
import { OrderedMap } from "./ordered-map";

import "@bodil/opt-vitest";

test("OrderedMap", () => {
    const map = new OrderedMap<string, string>();
    map.set("foo", "FOO").set("bar", "BAR").set("baz", "BAZ").set("wibble", "wobble");
    expect(map.size).equal(4);
    expect(map.get("foo")).isSome("FOO");
    expect(map.get("bar")).isSome("BAR");
    expect(map.get("baz")).isSome("BAZ");
    expect(map.get("wibble")).isSome("wobble");
    expect(map.get("wobble")).isNone();
    expect(Array.from(map)).deep.equal([
        ["foo", "FOO"],
        ["bar", "BAR"],
        ["baz", "BAZ"],
        ["wibble", "wobble"],
    ]);
    expect(map.delete("wobble")).false;
    expect(map.delete("bar")).true;
    expect(Array.from(map)).deep.equal([
        ["foo", "FOO"],
        ["baz", "BAZ"],
        ["wibble", "wobble"],
    ]);
    expect(map.detach("baz")).isSome("BAZ");
    expect(Array.from(map)).deep.equal([
        ["foo", "FOO"],
        ["wibble", "wobble"],
    ]);
    expect(map.size).equal(2);
    map.clear();
    expect(map.size).equal(0);
});
