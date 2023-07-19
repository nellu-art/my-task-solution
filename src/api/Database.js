import { Node } from './Node';

export class Database {
  constructor() {
    this.root = new Node(0, 'root');
    this.nodes = [this.root];
    this.nextId = 1;
  }

  addNode(value, parentId) {
    const parent = this.nodes.find((node) => node.id === parentId && !node.deleted);
    if (parent) {
      const node = new Node(this.nextId++, value, parent);
      parent.children.push(node);
      this.nodes.push(node);
    }
  }

  deleteNode(id) {
    const node = this.nodes.find((node) => node.id === id && !node.deleted);
    if (node) {
      this.markAsDeleted(node);
    }
  }

  markAsDeleted(node) {
    node.deleted = true;
    node.children.forEach((child) => this.markAsDeleted(child));
  }

  getNode(id) {
    return this.nodes.find((node) => node.id === id && !node.deleted);
  }

  updateNode(id, newValue) {
    const node = this.nodes.find((node) => node.id === id && !node.deleted);
    if (node) {
      node.value = newValue;
    }
  }
}
