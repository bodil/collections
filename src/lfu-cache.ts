import { None, Some, type Option } from "@bodil/opt";
import { isDisposable } from "@bodil/disposable";
import "@bodil/monkey-business";

import { LinkedList, type ListNode } from "./linked-list";
import { assert } from "@bodil/core/assert";

interface LFUNode<K> extends ListNode {
    freq: number;
    items: Set<K>;
}

interface LFURecord<K, V> {
    value: V;
    parent: LFUNode<K>;
}

export type LFUCacheOptions<V> = {
    maxLength?: number;
    disposeFunction?: (value: V) => void;
};

export class LFUCache<K, V> implements Disposable {
    readonly #index = new Map<K, LFURecord<K, V>>();
    #list = new LinkedList<LFUNode<K>>();
    readonly #options: LFUCacheOptions<V>;

    constructor(options: LFUCacheOptions<V> = {}) {
        this.#options = options;
    }

    [Symbol.dispose](): void {
        for (const record of this.#index.values()) {
            this.#disposeValue(record.value);
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
        const record = this.#index.get(key);
        if (record === undefined) {
            return None;
        }
        const node = record.parent;
        let nextNode = node.next;
        if (nextNode === undefined || nextNode.freq !== node.freq + 1) {
            nextNode = this.#list.insert({ freq: node.freq + 1, items: new Set() }, node, nextNode);
        }
        nextNode.items.add(key);
        record.parent = nextNode;
        node.items.delete(key);
        if (node.items.size === 0) {
            this.#list.remove(node);
        }
        return Some(record.value);
    }

    set(key: K, value: V) {
        let record = this.#index.get(key);
        if (record !== undefined) {
            if (record.value !== value) {
                this.#disposeValue(record.value);
                record.value = value;
            }
        } else {
            if (this.#index.size >= (this.#options.maxLength ?? 256)) {
                const head = this.#list.head;
                head?.items
                    .keys()
                    .takeOne()
                    .ifSome((key) => {
                        const record = this.#index.get(key);
                        assert(record !== undefined);
                        this.#disposeValue(record.value);
                        head.items.delete(key);
                        this.#index.delete(key);
                    });
            }

            let node = this.#list.head;
            if (node === undefined || node.freq !== 1) {
                node = this.#list.insert({ freq: 1, items: new Set() }, undefined, node);
            }
            record = { value, parent: node };
            node.items.add(key);
            this.#index.set(key, record);
        }
    }
}
