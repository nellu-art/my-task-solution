import { Database } from './Database';
import { Cache } from './Cache';
import { cloneDeep } from 'lodash';

const db = new Database();
const cache = new Cache(db);

export function loadNodeToCache(id) {
  cache.fetch(id);
}

export function addNodeToCache(value, parentId) {
  cache.add(value, parentId);
}

export function editNode(id, value) {
  cache.edit(id, value);
}

export function deleteNode(id) {
  cache.delete(id);
}

export function saveChanges() {
  cache.save();
}

export function readCache() {
  return { data: cloneDeep(cache.data), changes: cloneDeep(cache.changes) };
}

export function readDatabase(offset) {
  return db.read(offset);
}
