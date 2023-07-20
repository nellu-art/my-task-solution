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
    children: ['child 1.1.1'],
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
};

const DEFAULT_LIMIT = 5;

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

    Object.keys(changes).forEach((id) => {
      this.data[id] = { ...this.data[id], ...changes[id] };
    });
  }

  read(offset) {
    const start = offset ?? 0;
    const end = start + DEFAULT_LIMIT;
    const dbNodes = Object.values(this.data);

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
