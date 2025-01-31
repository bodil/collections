import { assert } from "@bodil/core/assert";

import { LinkedList, type ListNode } from "./linked-list";

interface OrderedSetNode<A> extends ListNode {
    value: A;
}

export class OrderedSet<A> implements Disposable, Iterable<A> {
    [Symbol.toStringTag] = "OrderedSet";

    readonly #index = new Map<A, OrderedSetNode<A>>();
    #list = new LinkedList<OrderedSetNode<A>>();

    [Symbol.dispose](): void {
        this.clear();
    }

    add(value: A): this {
        let node = this.#index.get(value);
        if (node === undefined) {
            node = { value };
            this.#index.set(value, node);
        } else {
            this.#list.remove(node);
        }
        this.#list.pushTail(node);
        return this;
    }

    clear(): void {
        this.#index.clear();
        this.#list = new LinkedList();
    }

    delete(value: A): boolean {
        const node = this.#index.get(value);
        if (node === undefined) {
            return false;
        }
        this.#list.remove(node);
        const didDelete = this.#index.delete(value);
        assert(didDelete);
        return true;
    }

    has(value: A): boolean {
        return this.#index.has(value);
    }

    get size(): number {
        return this.#index.size;
    }

    [Symbol.iterator](): IteratorObject<A> {
        return Iterator.from(this.#list).map((node) => node.value);
    }
}
