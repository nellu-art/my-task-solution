import { v4 as uuidv4 } from 'uuid';

export class Node {
  constructor(value, parentId = null) {
    this.id = uuidv4();
    this.value = value;
    this.parentId = parentId;
    this.children = [];
    this.deleted = false;
  }
}
