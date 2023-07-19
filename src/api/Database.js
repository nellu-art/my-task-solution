import { Node } from './Node';

export class Database {
  constructor() {
    const rootNode = new Node(1, 'root', null);
    const child1 = new Node(2, 'child 1', rootNode.id);
    const child2 = new Node(3, 'child 2', rootNode.id);
    rootNode.children.push(child1.id, child2.id);

    this.root = rootNode;
    this.data = {
      1: rootNode,
      2: child1,
      3: child2,
    };
    this.nextId = 4;
  }

  getNode(id) {
    if (!this.data[id]) {
      throw new Error(`Node with id ${id} not found`);
    }

    return this.data[id];
  }

  save(changes) {
    if (!changes || typeof changes !== 'object') {
      throw new Error('Invalid changes');
    }

    Object.keys(changes).forEach((id) => {
      this.data[id] = { ...this.data[id], ...changes[id] };
    });
  }
}
