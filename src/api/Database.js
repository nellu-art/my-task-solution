import { Node } from './Node';

export class Database {
  constructor() {
    const rootNode = new Node('root', null);
    const child1 = new Node('child 1', rootNode.id);
    const child2 = new Node('child 2', rootNode.id);
    rootNode.children.push(child1.id, child2.id);

    this.root = rootNode;
    this.data = {
      [rootNode.id]: rootNode,
      [child1.id]: child1,
      [child2.id]: child2,
    };
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
