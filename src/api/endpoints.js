import { Database } from './Database';
import { Cache } from './Cache';

const db = new Database();
const cache = new Cache(db);

export function fetchNode(id) {
  cache.fetch(id);
}

export function readCache() {
  return cache.data;
}

export function readDatabase(offset) {
  return db.read(offset);
}
