import { None, Some, type Option } from "@bodil/opt";
import { assert } from "@bodil/core/assert";
import { isDisposable } from "@bodil/disposable";

import { LinkedList, type ListNode } from "./linked-list";

interface LRUNode<K, V> extends ListNode {
    key: K;
    value: V;
}

export type LRUCacheOptions<V> = {
    maxLength?: number;
    disposeFunction?: (value: V) => void;
};

export class LRUCache<K, V> implements Disposable {
    readonly #index = new Map<K, LRUNode<K, V>>();
    #list = new LinkedList<LRUNode<K, V>>();
    readonly #options: LRUCacheOptions<V>;

    constructor(options: LRUCacheOptions<V> = {}) {
        this.#options = options;
    }

    [Symbol.dispose](): void {
        for (const node of this.#index.values()) {
            this.#disposeValue(node.value);
        }
        this.#index.clear();
        this.#list = new LinkedList();
    }

    #disposeValue(value: V) {
        if (this.#options.disposeFunction !== undefined) {
            this.#options.disposeFunction(value);
        } else if (isDisposable(value)) {
            value[Symbol.dispose]();
        }
    }

    get size(): number {
        return this.#index.size;
    }

    has(key: K): boolean {
        return this.#index.has(key);
    }

    get(key: K): Option<V> {
        const node = this.#index.get(key);
        if (node === undefined) {
            return None;
        }
        this.#list.remove(node);
        this.#list.pushHead(node);
        return Some(node.value);
    }

    set(key: K, value: V) {
        let node = this.#index.get(key);
        if (node !== undefined) {
            this.#list.remove(node);
            if (node.value !== value) {
                this.#disposeValue(node.value);
                node.value = value;
            }
        } else {
            node = { key, value };
            this.#index.set(key, node);
        }
        this.#list.pushHead(node);

        while (this.#index.size > (this.#options.maxLength ?? 256)) {
            const expiredNode = this.#list.popTail();
            assert(expiredNode !== undefined);
            this.#index.delete(expiredNode.key);
            this.#disposeValue(expiredNode.value);
        }
    }
}
