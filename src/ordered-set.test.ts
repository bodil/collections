import { test, expect } from "vitest";
import { OrderedSet } from "./ordered-set";

import "@bodil/opt-vitest";

test("OrderedSet", () => {
    const s = new OrderedSet<string>();
    s.add("foo").add("bar").add("baz").add("wibble");
    expect(s.size).equal(4);
    expect(s.has("foo")).true;
    expect(s.has("bar")).true;
    expect(s.has("baz")).true;
    expect(s.has("wibble")).true;
    expect(s.has("wobble")).false;
    expect(Array.from(s)).deep.equal(["foo", "bar", "baz", "wibble"]);
    expect(s.delete("wobble")).false;
    expect(s.delete("bar")).true;
    expect(Array.from(s)).deep.equal(["foo", "baz", "wibble"]);
    expect(s.size).equal(3);
    s.clear();
    expect(s.size).equal(0);
});
