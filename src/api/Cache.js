import { Node } from './Node';

export class Cache {
  constructor(database) {
    this.database = database;
    this.data = {};
    this.changes = {};
  }

  fetch(id) {
    const element = this.database.getNode(id);
    this.data[id] = element;
  }

  add(value, parentId) {
    const element = new Node(value, parentId);
    this.changes[element.id] = element;
    const parentElement = this.changes[parentId] ?? this.data[parentId];
    this.changes[parentId] = {
      ...parentElement,
      children: [...parentElement.children, element.id],
    };
  }

  edit(id, value) {
    const element = this.changes[id] ?? this.data[id];
    this.changes[id] = { ...element, value };
  }

  delete(id) {
    const element = this.changes[id] ?? this.data[id];
    this.changes[id] = { ...element, deleted: true };
    element.children.forEach((childId) => {
      this.delete(childId);
    });
  }

  save() {
    this.saveToCache();
    this.database.save(this.changes);
    this.changes = {};
  }

  saveToCache() {
    Object.keys(this.changes).forEach((id) => {
      this.data[id] = this.changes[id];
    });
  }
}
