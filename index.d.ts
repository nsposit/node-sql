export declare class Database {
  constructor(
    host: string,
    user: string,
    password: string,
    database: string,
    options: Options
  );

  checkConnection(): Promise<boolean>;
  query(sql: string, values: any): Promise<[]>;
  table(name: string, schema: Schema, defaults?: defaults): Table;
  closePool(): Promise<void>;
}

export interface SSL {
  ca?: string;
  rejectUnauthorized?: boolean;
}

export interface Options {
  port?: number;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
  debug?: boolean;
  ssl?: SSL;
}

export interface Column {
  type: string;
  allowNull?: boolean;
  isPrimaryKey?: boolean;
  references?: string;
  isUnique?: boolean;
  default?: boolean;
  autoIncrement?: boolean;
}

export interface Schema {
  [x: string]: Column;
}

export interface defaults {
  limit: number;
  page: number;
  order: string;
  orderby: string;
}

export interface Where {
  key: string;
  value: string;
  operator?: string;
  comparison?: string;
}

export interface Insert {
  id: number;
}

/**
 * Builds a model of a TABLE to perform SELECT, INSERT, UPDATE, and DELETE operations.
 *
 * @param {Database} database Instance of the database class.
 * @param {string} name Name of the table in the database.
 * @param {Schema} schema Representation of the table structure.
 * @param {defaults} defaults Optional.
 */
export declare class Table {
  constructor(
    database: Database,
    name: string,
    schema: Schema,
    defaults?: defaults
  );

  /**
   * Builds and executes SELECT query.
   *
   * @param {string[]} fields List of the fields to select. Selects all fields if empty.
   * @param {Where[]} where List of Where objects to filter the query. Where object contain required 'key' and 'value' properties and optional 'operator' and 'comparison' properties. The 'operator' propery has a default value of '=' and accepts '>', '>=', '<', '!=', '<=', 'LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP'. The 'comparison' property has a default value of 'AND' and accepts 'OR', 'XOR'.
   * @param {string} orderby Name of the field to order by.
   * @param {string} order 'ASC' or 'DESC'. Default 'DESC'.
   * @param {number} limit Maximum number of records to return. Default 10.
   * @param {number} page Sets the offset value. Default 1.
   * @return {Promise<[]>} A list of rows that match the query.
   */
  select(
    fields?: string[],
    where?: Where[],
    orderby?: string,
    order?: string,
    limit?: number,
    page?: number
  ): Promise<Object[]>;

  /**
   * Builds and executes INSERT query.
   *
   * @param {Object} obj Object of field value pairs to insert.
   * @return {Promise<Insert>} Insert object containing the id of the inserted row.
   */
  insert(obj: Object): Promise<Insert>;

  /**
   * Builds and executes UPDATE query.
   *
   * @param {Object} obj Object of field value pairs to update.
   * @param {Where[]} where List of Where objects to filter the query. Where object contain required 'key' and 'value' properties and optional 'operator' and 'comparison' properties. The 'operator' propery has a default value of '=' and accepts '>', '>=', '<', '!=', '<=', 'LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP'. The 'comparison' property has a default value of 'AND' and accepts 'OR', 'XOR'.
   * @return {Promise<boolean>} Returns true on successful update.
   */
  update(obj: Object, where?: Where[]): Promise<boolean>;

  /**
   * Builds and executes DELETE query.
   *
   * @param {Where[]} where List of Where objects to filter the query. Where object contain required 'key' and 'value' properties and optional 'operator' and 'comparison' properties. The 'operator' propery has a default value of '=' and accepts '>', '>=', '<', '!=', '<=', 'LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP'. The 'comparison' property has a default value of 'AND' and accepts 'OR', 'XOR'.
   * @return {Promise<boolean>} Returns true on successful deletion.
   */
  delete(where: Where[]): Promise<boolean>;

  /**
   * Selects a single row by id.
   *
   * @param {number} id
   * @param {string[]} fields List of the fields to select. Selects all fields if empty.
   * @return {Promise<Object>} Selected row.
   */
  selectOne(id: number, fields?: string[]): Promise<Object>;

  /**
   * Updates a single row by id.
   *
   * @param {number} id
   * @param {Object} obj Object of field value pairs to update.
   * @return {Promise<boolean>} Returns true on successful update.
   */
  updateOne(id: number, obj: Object): Promise<boolean>;

  /**
   * Deletes a single row by id.
   *
   * @param {number} id
   * @return {Promise<boolean>} Returns true on successful deletion.
   */
  deleteOne(id: number): Promise<boolean>;
}
