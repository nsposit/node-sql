require("dotenv").config();
const sql = require("../lib/index");
const showResult = false;

// create db connection
const db = new sql.Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME
);

//create table
const tbl = new sql.Table(db, "member_tbl", {
  id: {
    type: "int"
  },
  primary_email: {
    type: "varchar(75)",
  },
  verified_email: {
    type: "tinyint(1)",
  },
  last_name: {
    type: 'varchar(40)'
  }
});

async function test() {
    try{
      const {id} = await tbl.insert({primary_email: "testuser121320211447@mail1.mil" });

        const rows = await tbl.select(['primary_email'], [{
          key: "id",
          value: id
        }]);
        console.log(rows);

        const result = await tbl.update({primary_email:  "testuser121320211447@mail2.mil"}, [{  key: "id",
        value: id}]);
    }catch(ex){
        console.error(ex);
    }

}

test(); 



async function testFind(args) {
  try {
    const rows = await tbl.find(args);
    if (!rows) return false;
    if (showResult) console.log(rows);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }

}

async function testFindWhere(key, value) {
  try {
    const rows = await tbl.findWhere(key, value);
    if (!rows) return false;
    if (showResult) console.log(rows);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testFindOne(id) {
  try {
    const row = await tbl.findOne(id);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testFindOneBy(key, value) {
  try {
    const row = await tbl.findOneBy(key, value);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testCreate(obj) {
  try {
    const row = await tbl.create(obj);
    if (!row) return false;
    if (showResult) console.log(row);
    return row;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testUpdateOne(id, obj) {
  try {
    const row = await tbl.updateOne(id, obj);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testUpdateOneBy(key, value, obj) {
  try {
    const row = await tbl.updateOneBy(key, value, obj);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testDeleteOne(id) {
  try {
    const row = await tbl.deleteOne(id);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testDeleteOneBy(key, value) {
  try {
    const row = await tbl.deleteOneBy(key, value);
    if (!row) return false;
    if (showResult) console.log(row);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function testDeleteOneByWhere(key1, value1, key2, value2) {
  try {
    const result = await tbl.deleteOneByWhere(key1, value1, key2, value2);
    if (!result) return false;
    if (showResult) console.log(result);
    return true;
  } catch (ex) {
    console.error("Error: ", ex);
    return false;
  }
}

async function run() {
  // test db connection
  try {
    await db.checkConnection();
  } catch (ex) {
    console.error("Error: ", ex);
    return;
  }

  // init test users
  const user1 = { primary_email: "testuser121120211108@mail1.mil" };
  const user2 = { primary_email: "testuser121120211108@mail2.mil" };
  const user3 = { primary_email: "testuser121120211108@mail3.mil" };

  try {
    // find users
    console.log("Starting unit test 'find users'...");
    const usersFound = await testFind({});
    if (!usersFound) {
      console.error("Unit test 'find users' failed.");
      return;
    }
    console.log("Unit test 'find users' passed.");

    // find users where
    console.log("Starting unit test 'find users where'...");
    const usersFoundWhere = await testFindWhere("verified_email", 1);
    if (!usersFoundWhere) {
      console.error("Unit test 'find users where' failed.");
      return;
    }
    console.log("Unit test 'find users where' passed.");

    // create test user 1
    console.log("Starting unit test 'create test user 1'...");
    const testUser1Created = await testCreate(user1);
    if (!testUser1Created) {
      console.error("Unit test 'create test user 1' failed.");
      return;
    }
    console.log("Unit test 'create test user 1' passed.");
    const testUser1Id = testUser1Created.id;

    // create test user 2
    console.log("Starting unit test 'create test user 2'...");
    const testUser2Created = await testCreate(user2);
    if (!testUser2Created) {
      console.error("Unit test 'create test user 2' failed.");
      return;
    }
    console.log("Unit test 'create test user 2' passed.");

    // create test user 3
    console.log("Starting unit test 'create test user 3'...");
    const testUser3Created = await testCreate(user3);
    if (!testUser3Created) {
      console.error("Unit test 'create test user 3' failed.");
      return;
    }
    console.log("Unit test 'create test user 3' passed.");

    // find test user 1
    console.log("Starting unit test 'find test user 1'...");
    const testUser1Found = await testFindOne(testUser1Id);
    if (!testUser1Found) {
      console.error("Unit test 'find test user 1' failed.");
      return;
    }
    console.log("Unit test 'find test user 1' passed.");

    // find test user 2 by
    console.log("Starting unit test 'find test user 2 by'...");
    const testUser2FoundBy = await testFindOneBy(
      "primary_email",
      user2.primary_email
    );
    if (!testUser2FoundBy) {
      console.error("Unit test 'find test user 2 by' failed.");
      return;
    }
    console.log("Unit test 'find test user 2 by' passed.");

    // update test user 1
    console.log("Starting unit test 'update test user 1'...");
    const testUser1Updated = await testUpdateOne(testUser1Id, {
      verified_email: 1,
    });
    if (!testUser1Updated) {
      console.error("Unit test 'update test user 1' failed.");
      return;
    }
    console.log("Unit test 'update test user 1' passed.");

    // update test user 2 by
    console.log("Starting unit test 'update test user 2 by'...");
    const testUser2UpdatedBy = await testUpdateOneBy(
      "primary_email",
      user2.primary_email,
      { verified_email: 1 }
    );
    if (!testUser2UpdatedBy) {
      console.error("Unit test 'update test user 2 by' failed.");
      return;
    }
    console.log("Unit test 'update test user 2 by' passed.");

    // delete test user 1
    console.log("Starting unit test 'delete test user 1'...");
    const testUser1Deleted = await testDeleteOne(testUser1Id);
    if (!testUser1Deleted) {
      console.error("Unit test 'delete test user 1' failed.");
      return;
    }
    console.log("Unit test 'delete test user 1' passed.");

    // delete test user 2 by
    console.log("Starting unit test 'delete test user 2 by'...");
    const testUser2DeletedBy = await testDeleteOneBy(
      "primary_email",
      user2.primary_email
    );
    if (!testUser2DeletedBy) {
      console.error("Unit test 'delete test user 2 by' failed.");
      return;
    }
    console.log("Unit test 'delete test user 2 by' passed.");

    // delete test user 3 by where
    console.log("Starting unit test 'delete test user 3 by where'...");
    const testUser3DeletedByWhere = await testDeleteOneByWhere(
      "primary_email",
      user3.primary_email,
      "verified_email",
      0
    );
    if (!testUser3DeletedByWhere) {
      console.error("Unit test 'delete test user 3 by where' failed.");
      return;
    }
    console.log("Unit test 'delete test user 3 by where' passed.");

    await db.closePool();
  } catch (ex) {
    console.error("Error: ", ex);
    return;
  }
}

// run();
