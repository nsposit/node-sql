"use strict";

const Table = require("./table");

/**
 * @abstract
 */
module.exports = class _Database {
  host;
  user;
  password;
  database;
  options;
  pool;
  operators;
  comparisons;

  constructor() {
    if (this.constructor == _Database) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  async checkConnection() {
    throw new Error("Method 'checkConnection()' must be implemented.");
  }

  async query() {
    throw new Error("Method 'query()' must be implemented.");
  }

  table() {
    throw new Error("Method 'table()' must be implemented.");
  }

  async closePool() {
    throw new Error("Method 'closePool()' must be implemented.");
  }
};
