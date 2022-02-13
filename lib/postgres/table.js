"use strict";

const _Table = require("../core/table");

module.exports = class Table extends _Table {
    database;
    name;
    schema;
    defaults;

    constructor(
        database,
        name,
        schema,
        defaults = { limit: 10, page: 1, order: "DESC", orderby: "" }
    ) {
        super();
        this.database = database;
        this.name = name;
        this.schema = schema;
        this.defaults = defaults;
    }

    async select(
        fields = [],
        where = [],
        orderby = this.defaults.orderby,
        order = this.defaults.order,
        limit = this.defaults.limit,
        page = this.defaults.page
    ) {
        try {
            let counter = 1; 
            let values = [];

            let fieldsValue = "*";
            if (fields.length != 0) {
                this.validateKeys(this, fields, "SELECT");
                fieldsValue = fields.join(",");
            }

            let query = `SELECT ${fieldsValue} FROM ${this.name}`;

            if (where.length != 0) {
                query += ` WHERE`;
                for (var w of where) {
                    if (!this.schema.hasOwnProperty(w.key)) {
                        throw new Error(
                            `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
                        );
                    }
                    let operator = "=";
                    if (w.hasOwnProperty("operator")) {
                        if (!this.database.operators.includes(w.operator)) {
                            throw new Error(
                                `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
                            );
                        }
                        operator = w.operator;
                    }
                    let comparison = "AND";
                    if (w.hasOwnProperty("comparison")) {
                        if (!this.database.comparisons.includes(w.comparison)) {
                            throw new Error(
                                `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
                            );
                        }
                        comparison = w.comparison;
                    }
                    if (where.indexOf(w) != 0) {
                        query += ` ${comparison}`;
                    }
                    query += ` ${w.key} ${operator} $${counter}`;
                    counter++;
                    const likeOperators = ["LIKE", "NOT LIKE"];
                    if (likeOperators.includes(operator)) {
                        w.value = `%${w.value}%`;
                    }
                    values.push(w.value);
                }
            }

            if (orderby) {
                const orders = ["ASC", "DESC"];
                if (!this.schema.hasOwnProperty(orderby)) {
                    throw new Error(
                        `Cannot perform ORDER BY operation with field ${orderby} because it is not in the schema of ${this.name}.`
                    );
                }
                if (!orders.includes(order.toUpperCase())) {
                    throw new Error(
                        `Cannot perform ORDER BY operation with field ${orderby} because an invalid order value ${order} was provided.`
                    );
                }
                query += ` ORDER BY ${orderby} ${order.toUpperCase()}`;
            }
            if (limit > 0) {
                query += ` LIMIT ${limit}`;
                if (page) {
                    let offset = (parseInt(page) - 1) * parseInt(limit);
                    query += ` OFFSET ${offset}`;
                }
            }

            query += ';';
            return await this.database.query(query, values);

        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async insert(obj) {
        try {
            let keys = Object.keys(obj);
            this.validateKeys(this, keys, "INSERT");
            let values = Object.values(obj); // check value types
            let namespace = "";
            for (let i = 0; i < values.length; i++) {
                namespace += `$${i + 1},`
            }
            namespace = namespace.slice(0, -1);
            let query = `INSERT INTO ${this.name
                } (${keys.toString()}) VALUES (${namespace}) RETURNING *;`;

            return await this.database.query(query, values);
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async update(obj, where = []) {
        try {
            let counter = 1; 
            let keys = Object.keys(obj);
            this.validateKeys(this, keys, "UPDATE");
            let values = Object.values(obj); // check value types
            let query = `UPDATE ${this.name} SET `;
            for(const key of keys){
                query += `${key} = $${counter},`;
                counter++;
            }
           
            query = query.slice(0, -1);

            if (where.length != 0) {
                query += ` WHERE`;
                for (var w of where) {
                    if (!this.schema.hasOwnProperty(w.key)) {
                        throw new Error(
                            `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
                        );
                    }
                    let operator = "=";
                    if (w.hasOwnProperty("operator")) {
                        if (!this.database.operators.includes(w.operator)) {
                            throw new Error(
                                `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
                            );
                        }
                        operator = w.operator;
                    }
                    let comparison = "AND";
                    if (w.hasOwnProperty("comparison")) {
                        if (!this.database.comparisons.includes(w.comparison)) {
                            throw new Error(
                                `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
                            );
                        }
                        comparison = w.comparison;
                    }
                    if (where.indexOf(w) != 0) {
                        query += ` ${comparison}`;
                    }
                    query += ` ${w.key} ${operator} $${counter}`;
                    counter++;
                    values.push(w.value);
                }
            }

            query += ` RETURNING *;`;
            const result = await this.database.query(query, values);
            if (result.affectedRows < 1) throw new Error("No rows updated.");
            return true;
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async delete(where) {
        try {

            let counter = 1; 

            let values = [];

            let query = `DELETE FROM ${this.name}`;

            if (where.length == 0) {
                throw new Error(
                    `Cannot perform DELETE operation because at WHERE cannot be empty.`
                );
            }
            query += ` WHERE`;
            for (var w of where) {
                if (!this.schema.hasOwnProperty(w.key)) {
                    throw new Error(
                        `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
                    );
                }
                let operator = "=";
                if (w.hasOwnProperty("operator")) {
                    if (!this.database.operators.includes(w.operator)) {
                        throw new Error(
                            `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
                        );
                    }
                    operator = w.operator;
                }
                let comparison = "AND";
                if (w.hasOwnProperty("comparison")) {
                    if (!this.database.comparisons.includes(w.comparison)) {
                        throw new Error(
                            `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
                        );
                    }
                    comparison = w.comparison;
                }
                if (where.indexOf(w) != 0) {
                    query += ` ${comparison}`;
                }
                query += ` ${w.key} ${operator} $${counter}`;
                counter++;
                values.push(w.value);
            }

            query += ` RETURNING *;`;

            return await this.database.query(query, values);
            
           
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async selectOne(id, fields = []) {
        try {
            const [row] = await this.select(fields, [
                {
                    key: "id",
                    value: id,
                },
            ]);
            return row;
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async updateOne(id, obj) {
        try {
            return await this.update(obj, [
                {
                    key: "id",
                    value: id,
                },
            ]);
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }

    async deleteOne(id) {
        try {
            return await this.delete([
                {
                    key: "id",
                    value: id,
                },
            ]);
        } catch (ex) {
            console.error("Error: ", ex);
            throw ex;
        }
    }


};