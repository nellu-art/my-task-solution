export class Node {
  constructor(id, value, parent = null) {
    this.id = id;
    this.value = value;
    this.parent = parent;
    this.children = [];
    this.deleted = false;
  }
}
