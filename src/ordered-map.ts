import { isDisposable } from "@bodil/disposable";
import { None, Option, Some } from "@bodil/opt";
import { assert } from "@bodil/core/assert";

import { LinkedList, type ListNode } from "./linked-list";

interface OrderedMapNode<K, V> extends ListNode {
    key: K;
    value: V;
}

export type OrderedMapOptions<V> = {
    disposeFunction?: (value: V) => void;
};

export class OrderedMap<K, V> implements Disposable, Iterable<[K, V]> {
    [Symbol.toStringTag] = "OrderedMap";

    readonly #index = new Map<K, OrderedMapNode<K, V>>();
    #list = new LinkedList<OrderedMapNode<K, V>>();
    readonly #options: OrderedMapOptions<V>;

    constructor(options: OrderedMapOptions<V> = {}) {
        this.#options = options;
    }

    [Symbol.dispose](): void {
        this.clear();
    }

    #disposeValue(value: V) {
        if (this.#options.disposeFunction !== undefined) {
            this.#options.disposeFunction(value);
        } else if (isDisposable(value)) {
            value[Symbol.dispose]();
        }
    }

    clear(): void {
        for (const node of this.#index.values()) {
            this.#disposeValue(node.value);
        }
        this.#index.clear();
        this.#list = new LinkedList();
    }

    delete(key: K): boolean {
        return this.detach(key)
            .map((value) => this.#disposeValue(value))
            .isSome();
    }

    detach(key: K): Option<V> {
        const node = this.#index.get(key);
        if (node === undefined) {
            return None;
        }
        this.#list.remove(node);
        const didDelete = this.#index.delete(key);
        assert(didDelete);
        return Some(node.value);
    }

    get(key: K): Option<V> {
        return Option.from(this.#index.get(key)).map((node) => node.value);
    }

    has(key: K): boolean {
        return this.#index.has(key);
    }

    set(key: K, value: V): this {
        let node = this.#index.get(key);
        if (node === undefined) {
            node = { key, value };
            this.#index.set(key, node);
        } else {
            this.#list.remove(node);
            if (node.value !== value) {
                this.#disposeValue(node.value);
                node.value = value;
            }
        }
        this.#list.pushTail(node);
        return this;
    }

    getOrSet(key: K, defaultValue: () => V): V {
        const node = this.#index.get(key);
        if (node !== undefined) {
            return node.value;
        }
        const value = defaultValue();
        this.set(key, value);
        return value;
    }

    get size(): number {
        return this.#index.size;
    }

    entries(): IteratorObject<[K, V]> {
        return this[Symbol.iterator]();
    }

    keys(): IteratorObject<K> {
        return Iterator.from(this.#list).map((node) => node.key);
    }

    values(): IteratorObject<V> {
        return Iterator.from(this.#list).map((node) => node.value);
    }

    [Symbol.iterator](): IteratorObject<[K, V]> {
        return Iterator.from(this.#list).map((node) => [node.key, node.value]);
    }
}
