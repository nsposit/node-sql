const sql = require('../lib/index');

const db = new sql.Database("localhost", "root", "", "dsiac_iss");
db.checkConnection(); 
const tbl = new sql.Table(db, "member_tbl", {});

async function testFind() {
    try{
        const rows = await tbl.find();
        if(rows){
            console.log(rows);
        }
    }catch(ex){
        console.error("Error: ", ex);
    }
}
// testfind(); 

async function testFindWhere() {
    try{
        const rows = await tbl.findWhere("primary_email", "doug@survice.com");
        if(rows){
            console.log(rows);
        }
    }catch(ex){
        console.error("Error: ", ex);
    }
}
//testFindWhere(); 

async function testFindOne() {
    try{
        const rows = await tbl.findOne(1);
        if(rows){
            console.log(rows);
        }
    }catch(ex){
        console.error("Error: ", ex);
    }
}
// testFindOne(); 

async function testFindOneBy() {
    try{
        const rows = await tbl.findOneBy("primary_email", "doug@survice.com");
        if(rows){
            console.log(rows);
        }
    }catch(ex){
        console.error("Error: ", ex);
    }
}
// testFindOneBy(); 

async function testCreate() {
    try{
        const rows = await tbl.create({primary_email: ""});
        if(rows){
            console.log(rows);
        }
    }catch(ex){
        console.error("Error: ", ex);
    }
}
testCreate(); 
