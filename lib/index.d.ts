export declare class Database {
constructor(host: string, 
    user: string,
    password: string,
    database: string,
    port?: number,
    waitForConnections?: boolean,
    connectionLimit?: number,
    queueLimit?: number,
    debug?: boolean); 

    checkConnection(): Promise<boolean>;
    query(sql: string, values: any): Promise<[]>
    closePool(): Promise<void>;
}

export interface Column {
    type: string,
    allowNull?: boolean,
    isPrimaryKey?: boolean,
    references?: string,
    isUnique?: boolean,
    default?: boolean,
    autoIncrement?: boolean,
}

export interface Schema {
    [x: string]: Column, 
}

export interface defaults {
    limit: number, 
    page: number, 
    order: string, 
    orderby: string
}


export interface Where {
    key: string,
    value: string,
    operator?: string,
    comparison?: string
}

export declare class Table {
    constructor(database: typeof Database, name: string, schema: Schema, defaults: defaults);
    find(arg?: defaults): Promise<typeof Object[]>;
    findWhere(key: string, value: any, operator?: string): Promise<typeof Object[]>; 
    findOne(id: number): Promise<typeof Object>; 
    findOneBy(key: string, value: any): Promise<typeof Object>; 
    create(obj: typeof Object): Promise<typeof Object>; 
    updateOne(id: number, obj: typeof Object): Promise<typeof Object>;
    updateOneBy(key: string, value: any, obj: typeof Object): Promise<typeof Object>;
    deleteOne(id: number): Promise<boolean>;
    deleteOneBy(key: string, value: any): Promise<boolean>;
    deleteOneByWhere(key1: string, value1: any, key2: string, value2: any): Promise<boolean>;
    select(fields?: string[], where?: Where[], orderby?: string, order?: string,  limit?: number, page?: number): Promise<typeof Object[]>;
}


