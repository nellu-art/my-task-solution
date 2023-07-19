export class Node {
  constructor(id, value, parentId = null) {
    this.id = id;
    this.value = value;
    this.parentId = parentId;
    this.children = [];
    this.deleted = false;
  }
}
