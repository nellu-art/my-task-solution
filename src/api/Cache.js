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
    this.changes[parentId] = {
      ...(this.changes[parentId] ?? this.data[parentId]),
      children: [...(this.changes[parentId] ?? this.data[parentId]).children, element.id],
    };
  }

  edit(id, value) {
    this.changes[id] = { ...this.data[id], value };
  }

  delete(id) {
    const element = this.data[id];
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
