require("dotenv").config();
const sql = require("../index");
const showResult = false;

// create db connection
const db = new sql.Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME
);

const tbl = db.table("member_tbl", {
  id: {
    type: "int",
  },
  primary_email: {
    type: "varchar(75)",
  },
  verified_email: {
    type: "tinyint(1)",
  },
  last_name: {
    type: "varchar(40)",
  },});

//create table
// const tbl = new sql.Table(db, "member_tbl", {
//   id: {
//     type: "int",
//   },
//   primary_email: {
//     type: "varchar(75)",
//   },
//   verified_email: {
//     type: "tinyint(1)",
//   },
//   last_name: {
//     type: "varchar(40)",
//   },
// });

// init test users
const timestamp = Date.now();
let user1 = { id: 1, primary_email: `testuser${timestamp}@mail1.mil` };
let user2 = { id: 2, primary_email: `testuser${timestamp}@mail2.mil` };
let user3 = { id: 3, primary_email: `testuser${timestamp}@mail3.mil` };

describe("core", () => {
  test("insert", async () => {
    try {
      const { id } = await tbl.insert({ primary_email: user1.primary_email });
      user1.id = id;
      expect(id).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });

  test("select", async () => {
    try {
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
    } catch (ex) {
      throw ex;
    }
  });

  test("update", async () => {
    try {
      const result = await tbl.update({ verified_email: 1 }, [
        { key: "id", value: user1.id },
      ]);
      expect(result).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });

  test("delete", async () => {
    try {
      const result = await tbl.delete([{ key: "id", value: user1.id }]);
      expect(result).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });
});

describe("singletons", () => {
  test("insert", async () => {
    try {
      const { id } = await tbl.insert({ primary_email: user2.primary_email });
      user2.id = id;
      expect(id).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });

  test("selectOne", async () => {
    try {
      const row = await tbl.selectOne(user2.id, ["primary_email"]);
      expect(row.primary_email).toEqual(user2.primary_email);
    } catch (ex) {
      throw ex;
    }
  });

  test("updateOne", async () => {
    try {
      const result = await tbl.updateOne(user2.id, { verified_email: 1 });
      expect(result).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });

  test("deleteOne", async () => {
    try {
      const result = await tbl.deleteOne(user2.id);
      expect(result).toBeTruthy();
    } catch (ex) {
      throw ex;
    }
  });
});
