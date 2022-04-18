"use strict";

const mysql = require("mysql2/promise");
const _Database = require("../core/database");
const Table = require("./table");

module.exports = class Database extends _Database {
    host;
    user;
    password;
    database;
    options;
    pool;
    operators;
    comparisons;
    
  
    constructor(
      host,
      user,
      password,
      database,
      options
    ) {
        super(); 
      this.host = host;
      this.user = user;
      this.password = password;
      this.database = database;
      
      const defaultOptions = {
        port: 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        debug: false,
        ssl: {
          rejectUnauthorized: false
        }
      }
      this.options = {...defaultOptions, ...options};
      
      this.pool = mysql.createPool({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
        ...this.options
      });
      
      this.operators = [
        "=",
        ">",
        ">=",
        "<",
        "!=",
        "<=",
        "LIKE",
        "NOT LIKE",
        "REGEXP",
        "NOT REGEXP",
      ];
      this.comparisons = ["AND", "OR", "XOR"]; 
    }
  
  
    async checkConnection() {
      try {
        const connection = await this.pool.getConnection();
        await connection.connect();
        console.log("Successfully connected to database...");
        connection.destroy();
        return true;
      } catch (ex) {
        console.error("Error connecting to database...", ex);
        return false;
      }
    }
  
    async query(sql, values) {
      try {
        const [rows] = await this.pool.execute(sql, values);
        return rows;
      } catch (ex) {
        throw ex;
      }
    }
  
    table(
      name,
      schema,
      defaults = { limit: 10, page: 1, order: "DESC", orderby: "" }
    ) {
      return new Table(this, name, schema, defaults);
    }
  
    async closePool() {
      try {
        this.pool.end();
      } catch (ex) {
        console.error("Error: ", ex);
        throw ex;
      }
    }
}