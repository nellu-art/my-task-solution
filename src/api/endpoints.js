import { Database } from './Database';
import { Cache } from './Cache';
import { cloneDeep } from 'lodash';

const db = new Database();
const cache = new Cache(db);

export function loadNodeToCache(id) {
  cache.fetch(id);
}

export function readCache() {
  return { ...cloneDeep(cache.data), ...cloneDeep(cache.changes) };
}

export function readDatabase(offset) {
  return db.read(offset);
}
