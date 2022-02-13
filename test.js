require("dotenv").config();
const sql = require("./postgres");

// create db connection
const db = new sql.Database(
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASS,
    process.env.DB_NAME,
    {ssl: false}
  );

  
async function checkConnection(database) {
    try {
    await database.checkConnection();
    } catch (error) {
      console.error(error)
    }
  }
  checkConnection(db);

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
let user3 = { id: 3, primary_email: `testuser${timestamp}@mail3.mil` };

  async function insertMember() {
      
    try {
        console.log('inserting member');
        const rows = await tbl.insert({ primary_email: user2.primary_email });
        console.log(`inserted member with id ${rows[0].id}`);
        selectAllMembers(); 
      } catch (ex) {
          console.error(ex);
        throw ex;
      }
  }

  async function selectAllMembers() {
      try {
          console.log('selecting members');
          const rows = await tbl.select([], [], 'id', 'ASC');
          console.log('selected members');
          updateMember(rows[0].id);
      } catch (ex) {
        console.error(ex);
      throw ex;
    }
  }

  async function updateMember(id) {
    try {
        console.log('update member');
        const rows = await tbl.update({verified_email: true}, [{key: "id", value: id}]);
        console.log('updated member');
        deleteMember(id);
    } catch (ex) {
      console.error(ex);
    throw ex;
  }
  }

  async function deleteMember(id) {
    try {
        console.log('deleting member');
        const rows = await tbl.delete([{key: "id", value: id}]);
        console.log('deleted member');
    } catch (ex) {
      console.error(ex);
    throw ex;
  }
  }

  async function createSchema(database) {
      try {
          console.log('creating member_tbl');
        await database.query(`CREATE TABLE IF NOT EXISTS member_tbl (
            id serial PRIMARY KEY,
            primary_email VARCHAR(75),
            verified_email BOOLEAN DEFAULT false,
            last_name VARCHAR(40)
          );`);
          console.log('member_tbl created');
        insertMember();
        
      } catch (error) {
          console.error(error);
      }
   
  }

  createSchema(db);


