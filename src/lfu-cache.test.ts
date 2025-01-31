import { expect, test } from "vitest";

import { LFUCache } from "./lfu-cache";

import "@bodil/opt-vitest";

test("LFUCache", () => {
    const evicted: Array<string> = [];
    const cache = new LFUCache<string, string>({
        maxLength: 3,
        disposeFunction: (value) => evicted.push(value),
    });
    expect(cache.size).equal(0);
    cache.set("foo", "FOO");
    cache.set("bar", "BAR");
    cache.set("baz", "BAZ");
    expect(cache.size).equal(3);
    expect(cache.get("foo")).isSome("FOO");
    expect(cache.get("bar")).isSome("BAR");
    expect(cache.get("baz")).isSome("BAZ");
    expect(cache.get("foo")).isSome("FOO");
    expect(cache.get("bar")).isSome("BAR");
    expect(cache.get("wibble")).isNone();
    cache.set("wibble", "WIBBLE");
    expect(cache.size).equal(3);
    expect(cache.get("wibble")).isSome("WIBBLE");
    expect(cache.get("foo")).isSome("FOO");
    expect(cache.get("bar")).isSome("BAR");
    expect(cache.get("baz")).isNone();
    expect(evicted).deep.equal(["BAZ"]);
});
