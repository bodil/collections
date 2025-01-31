import { assert } from "@bodil/core/assert";

export interface ListNode {
    prev?: this;
    next?: this;
}

export class LinkedList<Node extends ListNode> implements Iterable<Node> {
    head?: Node;
    tail?: Node;

    remove(node: Node) {
        if (node.prev !== undefined) {
            node.prev.next = node.next;
        } else {
            assert(this.head === node);
            this.head = node.next;
        }
        if (node.next !== undefined) {
            node.next.prev = node.prev;
        } else {
            assert(this.tail === node);
            this.tail = node.prev;
        }
        node.prev = undefined;
        node.next = undefined;
    }

    insert(node: Node, prev?: Node, next?: Node): Node {
        assert(node.prev === undefined && node.next === undefined);
        node.prev = prev;
        node.next = next;
        if (next !== undefined) {
            next.prev = node;
        }
        if (prev !== undefined) {
            prev.next = node;
        } else {
            this.head = node;
        }
        return node;
    }

    pushHead(node: Node) {
        assert(node.prev === undefined && node.next === undefined);
        if (this.head === undefined || this.tail === undefined) {
            this.head = node;
            this.tail = node;
        } else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
    }

    pushTail(node: Node) {
        assert(node.prev === undefined && node.next === undefined);
        if (this.head === undefined || this.tail === undefined) {
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
    }

    popHead(): Node | undefined {
        const node = this.head;
        if (node === undefined) {
            return undefined;
        }
        this.head = node.next;
        if (this.head === undefined) {
            this.tail = undefined;
        }
        node.prev = undefined;
        node.next = undefined;
        return node;
    }

    popTail(): Node | undefined {
        const node = this.tail;
        if (node === undefined) {
            return undefined;
        }
        this.tail = node.prev;
        if (this.tail === undefined) {
            this.head = undefined;
        }
        node.prev = undefined;
        node.next = undefined;
        return node;
    }

    [Symbol.iterator] = function* (this: LinkedList<Node>): Generator<Node> {
        let node = this.head;
        while (node !== undefined) {
            yield node;
            node = node.next;
        }
    };
}
