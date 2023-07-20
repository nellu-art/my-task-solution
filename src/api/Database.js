import { cloneDeep } from 'lodash';

const defaultData = {
  root: {
    id: 'root',
    value: 'root',
    children: ['child 1', 'child 2'],
    parentId: null,
  },
  'child 1': {
    id: 'child 1',
    value: 'child 1',
    children: ['child 1.1'],
    parentId: 'root',
    deleted: false,
  },
  'child 2': {
    id: 'child 2',
    value: 'child 2',
    children: [],
    parentId: 'root',
    deleted: false,
  },
  'child 1.1': {
    id: 'child 1.1',
    value: 'child 1.1',
    children: ['child 1.1.1', 'child 1.1.2'],
    parentId: 'child 1',
    deleted: false,
  },
  'child 1.1.1': {
    id: 'child 1.1.1',
    value: 'child 1.1.1',
    children: ['child 1.1.1.1'],
    parentId: 'child 1.1',
    deleted: false,
  },
  'child 1.1.1.1': {
    id: 'child 1.1.1.1',
    value: 'child 1.1.1.1',
    children: [],
    parentId: 'child 1.1.1',
    deleted: false,
  },
  'child 1.1.2': {
    id: 'child 1.1.2',
    value: 'child 1.1.2',
    children: ['child 1.1.2.1'],
    parentId: 'child 1.1',
    deleted: false,
  },
  'child 1.1.2.1': {
    id: 'child 1.1.2.1',
    value: 'child 1.1.2.1',
    children: ['1.1.2.1.1'],
    parentId: 'child 1.1.2',
    deleted: false,
  },
  '1.1.2.1.1': {
    id: '1.1.2.1.1',
    value: '1.1.2.1.1',
    children: [],
    parentId: 'child 1.1.2.1',
    deleted: false,
  },
};

const DEFAULT_LIMIT = 10;

export class Database {
  constructor() {
    this.data = cloneDeep(defaultData);
    // this.root = this.data.root;
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

    function markNodeAsDeleted(node, data) {
      data[node.id] = { ...node, deleted: true };

      node.children.forEach((childId) => {
        markNodeAsDeleted(data[childId], data);
      });
    }

    Object.keys(changes).forEach((id) => {
      const prevEl = this.data[id];
      const newEl = changes[id];
      this.data[id] = { ...cloneDeep(prevEl), ...cloneDeep(newEl) };
    });

    Object.keys(changes).forEach((id) => {
      const element = this.data[id];

      if (element.deleted) {
        markNodeAsDeleted(element, this.data);
      }
    });
  }

  reset() {
    this.data = cloneDeep(defaultData);
  }

  read(offset) {
    const dbNodes = Object.values(this.data);
    const start = (offset ?? 0) > dbNodes.length ? 0 : offset ?? 0;
    const end = start + DEFAULT_LIMIT;

    return {
      data: dbNodes.slice(start, end),
      pagination: {
        offset: start,
        limit: DEFAULT_LIMIT,
        total: dbNodes.length,
      },
    };
  }
}
