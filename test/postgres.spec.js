require("dotenv").config();
const sql = require("../postgres");
const showResult = false;

// create db connection
const db = new sql.Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME,
  { ssl: false }
);

const tbl = db.table("member_tbl", {
  id: {
    type: "serial",
  },
  primary_email: {
    type: "varchar(75)",
  },
  verified_email: {
    type: "boolean",
  },
  last_name: {
    type: "varchar(40)",
  },
});


// init test users
const timestamp = Date.now();
let user1 = { id: 1, primary_email: `testuser${timestamp}@mail1.mil` };
let user2 = { id: 2, primary_email: `testuser${timestamp}@mail2.mil` };

describe("core", () => {

  beforeAll(async () => {
    await db.query(`CREATE SCHEMA IF NOT EXISTS test;`);

    await db.query(`CREATE TABLE IF NOT EXISTS test.member_tbl (
      id serial PRIMARY KEY,
      primary_email VARCHAR(75),
      verified_email BOOLEAN DEFAULT false,
      last_name VARCHAR(40)
    );`);
  });

  test("insert", async () => {
      const rows = await tbl.insert({ primary_email: user1.primary_email });
      user1.id = rows[0].id;
      expect(rows[0].id).toBeTruthy();
  });

  test("select", async () => {
    
      const rows = await tbl.select(
        ["primary_email"],
        [
          {
            key: "id",
            value: user1.id,
          },
        ]
      );
      expect(rows[0].primary_email).toEqual(user1.primary_email);
    
  });

  test("update", async () => {
    
      const rows = await tbl.update({ verified_email: true }, [
        { key: "id", value: user1.id },
      ]);
      console.log(rows);
      expect(rows[0].verified_email).toBeTruthy();
    
  });

  test("delete", async () => {
    
      const result = await tbl.delete([{ key: "id", value: user1.id }]);
      expect(result).toBeTruthy();
    
  });
});

describe("singletons", () => {
  test("insert", async () => {
    
      const rows = await tbl.insert({ primary_email: user2.primary_email });
      user2.id = rows[0].id;
      expect(rows[0].id).toBeTruthy();
    
  });

  test("selectOne", async () => {
    
      const rows = await tbl.selectOne(user2.id, ["primary_email"]);
      expect(rows[0].primary_email).toEqual(user2.primary_email);
    
  });

  test("updateOne", async () => {
    
      const rows = await tbl.updateOne(user2.id, { verified_email: true });
      expect(rows[0].verified_email).toBeTruthy();
    
  });

  test("deleteOne", async () => {
    
      const result = await tbl.deleteOne(user2.id);
      expect(result).toBeTruthy();
    
  });

  afterAll(async () => {
    await db.query(`DROP TABLE IF EXISTS test.member_tbl;`);
    await db.query(`DROP SCHEMA IF EXISTS test;`);

  });

});
