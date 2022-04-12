"use strict";
/**
 * @abstract
 */
module.exports = class _Table {
  database;
  name;
  schema;
  defaults;

  constructor(
  ) {
    if (this.constructor == _Table) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  async select() {
    throw new Error("Method 'select()' must be implemented.");
  }

  async selectCount() {
    throw new Error("Method 'selectCount()' must be implemented.");
  }

  async insert() { throw new Error("Method 'insert()' must be implemented."); }

  async update() {
    throw new Error("Method 'update()' must be implemented.");
  }

  async delete() {
    throw new Error("Method 'delete()' must be implemented.");
  }

  async selectOne() {
    throw new Error("Method 'selectOne()' must be implemented.");
  }

  async updateOne() {
    throw new Error("Method 'updateOne()' must be implemented.");
  }

  async deleteOne() {
    throw new Error("Method 'deleteOne()' must be implemented.");
  }

  validateKeys(table, keys, operation){
    for (const key of keys) {
      if (!table.schema.hasOwnProperty(key)) {
        throw new Error(
          `Cannot ${operation} field ${key} because it is not in the schema of ${table.name}.`
        );
      }
    }
    return true; 
  }
};
