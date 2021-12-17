const sqlite3 = require("sqlite3").verbose();
const dbFile = "./.data/sqlite.db";
const db = new sqlite3.Database(dbFile);

const list_tables = async () => {
  return new Promise((resolve, reject)=>{
    const query = `SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';`
    db.all(query, [], (err, rows)=>{
        if (err) { reject(err) }
        let tables = rows.map(row => row.name)
        resolve(tables)
    })
  })
}

const list_columns = async (table) => {
  return new Promise((resolve, reject)=>{
    const query = `PRAGMA table_info(${table});`
    db.all(query, [], (err, rows)=>{
        if (err) { reject(err) }      
        resolve(rows.map((row)=>{
          return row.name
        }))
    })
  })
}

const compare_schemas = async (table, schema) => {
  const dbDefinition = JSON.stringify(await list_columns(table).then(response=>response.sort()))
  const schemaDefinition = JSON.stringify(Object.keys(schema.columns).sort())
  if(schemaDefinition != dbDefinition) {
    // console.log("schema needs to be updated")
    return false
  } else {
    // console.log("schema is current")
    return true
  }  
}

const create_table_from_schema = async (schema) => {
  return new Promise((resolve, reject)=>{
    const dbName = schema.name
    const query = []
    for (let [key, value] of Object.entries(schema.columns)) {
      query.push((key === 'id') ? 'id INTEGER PRIMARY KEY AUTOINCREMENT' : `${key} ${value.toUpperCase()}`)
    }
    const createQuery = `CREATE TABLE ${dbName} (${query.join(', ')})`
    db.serialize(()=>{
      db.run(createQuery, [], ()=>{
        console.log(`New table ${dbName} created!`);   
        resolve(createQuery)
      })
    })    
  })
}

//create the database, if it doesn't exist, based on the passed-in schema
//after created, or if it does exist, return the db object
exports.initialize = async (schema) => {  

  let tables = await list_tables()
  let columns = await list_columns(schema.name)
  
  const comparison = await compare_schemas(schema.name, schema)
  if(tables.includes(schema.name) && comparison) {
    console.log("table is current and columns are in sync")
  } else if(tables.includes(schema.name) && (comparison === false)) {
    console.log("table is current but columns are out of sync. please update schema name.") 
  } else if (!tables.includes(schema.name)) {
    console.log("table does not exist, creating it")
    const new_table = await create_table_from_schema(schema)
  }
  
  return db;
}