const fs = require('fs')
const sqlite3 = require("sqlite3").verbose();
const helpers = require("./db_helpers")
const {cleanseString, isValidJSON} = require("./helpers")
const path = require('path');
const passport = require('passport')
const LocalStrategy = require('passport-local')
//super simple schema for the db
const schema = {
  name: "attributedStorage2", //no special punctuation like - or .
  columns: {
    id: "id", //leave this here, no matter what else you change
    author: "text",
    name: "text",
    data: "json" //put json here
  }
}

//set up static route for loading index.html
exports.index = (req, res)=> {
  return res.sendFile(__dirname + '/views/index.html');
};

exports.authors = (req, res)=>{
  return res.json(["hehhe"])
}

//
//api routes
exports.getData = async (req, res) => {
  const db = await helpers.initialize(schema)
  
  console.log("getting links...")
  db.all(`SELECT * from '${schema.name}'`, (err, rows) => {

    console.log(rows)

    if(rows) {
      const parsedRows = rows.map((row)=>{
        row.data = JSON.parse(row.data)
        return row
      })    
      console.log(`record: ${JSON.stringify(parsedRows)}`);

      return res.json(parsedRows)
    } else {
      console.log(err)
      return res.end("here are not your links")
    }
  });
  
}

exports.getDatum = async (req, res) => {
  const db = await helpers.initialize(schema)

  const id = req.params.id
  
  console.log("getting links...")
  db.get(`SELECT id, author, name, json(data) as data from '${schema.name}' WHERE id = ${id}`, (err, row) => {
    if (row) {
      console.log(`record: ${JSON.stringify(row)}`);

      row.data = JSON.parse(row.data)
      
      return res.json(row)
    } else {
      console.log(err)
      return res.end("here are not your links")
    }
  });
  
}

exports.getDatumByName = async (req, res) => {
  const db = await helpers.initialize(schema)

  const name = req.params.name
  
  console.log("getting links...")
  db.get(`SELECT id, author, name, json(data) as data from '${schema.name}' WHERE name = '${name}' LIMIT 1`, (err, row) => {
    if (row) {
      console.log(`record: ${JSON.stringify(row)}`);

      row.data = JSON.parse(row.data)
      
      return res.status(200).json(row)
    } else {
      console.log(err)
      return res.status(404).json({message: `key with name ${name} not found`})
    }
  });
  
}

exports.editDatum = async (req, res, next) => {
  if(!isValidJSON(req.body.data)) {
    res.status(500).end(`Invalid JSON payload: ${req.body.data}`)
  }

  const db = await helpers.initialize(schema)

  console.log("updating a link...")
  
  const id = req.body.id
  const name = req.body.name;
  const data = req.body.data;
  const author = req.body.author;
  
  db.run(`UPDATE ${schema.name} SET name = (?), author = (?), data = (?) WHERE id = (?)`, [name, author, data, id], (error) => {
    if (error) {
      console.log(error)
      return res.send({ message: "error!" });
    } else {
      console.log(`row ${id} updated with ${name}, ${author} and ${data}`)
      next()
    }
  });
  
}

exports.editDatumByName = async (req, res, next) => {
  if(!isValidJSON(req.body.data)) {
    res.status(500).end(`Invalid JSON payload: ${req.body.data}`)
  }

  const db = await helpers.initialize(schema)

  console.log("updating a link by name...")
  console.log(req.body)
  const name = req.body.name;
  const data = req.body.data;
  const author = req.body.author;
  
  db.get(`UPDATE ${schema.name} SET author = (?), data = (?) WHERE name = (?)`, [author, data, name], (error, row) => {
    
    if (error) {
      console.log(error)
      return res.send({ message: "error!" });
    } 
    
    if (req.headers['x-sender'] === 'npm-client') {
      return res.status(200).json({
        status:200,
        message: `Update successful for key ${name}`
      })
    } else {
      console.log(`row with name ${name} updated with ${author} and ${data}`)
      next()
    }
  });
  
}


exports.editDatumByNameNoPage = async (req, res, next) => {
  console.log("NOPAGE")
  if(!isValidJSON(req.body.data)) {
    res.status(500).end(`Invalid JSON payload: ${req.body.data}`)
  }

  const db = await helpers.initialize(schema)

  console.log("updating a link by name...")
  // console.log(req.body)
  console.log(req.query)
  const name = req.query.name;
  const data = req.query.data;
  const author = req.query.author;
  
  db.get(`UPDATE ${schema.name} SET author = (?), data = (?) WHERE name = (?)`, [author, data, name], (error, row) => {
    
    if (error) {
      console.log(error)
      return res.send({ message: "error!" });
    } 
    
    if (req.headers['x-sender'] === 'npm-client') {
      return res.status(200).json({
        status:200,
        message: `Update successful for key ${name}`
      })
    } else {
      console.log(`row with name ${name} updated with ${author} and ${data}`)
      next()
    }
  });
  
}

exports.postDatum = async (req, res, next) => {
  req.body.data = "{\"approved\":\"false\"}"
  if(!isValidJSON(req.body.data)) {
    res.status(500).end(`Invalid JSON payload: ${req.body.data}`)
  } else {
  
  if(req.body.name == ""){
    res.redirect('/schoolnameerror')
  } else {
      req.body.data = "{\"approved\":\"false\"}"
  
  const db = await helpers.initialize(schema)
  
  console.log(req.body)
  console.log(`add to links ${req.body.name}, ${req.body.data} by ${req.body.author}`);
  
  const name = req.body.name;
  const data = req.body.data;
  const author = req.body.author;
  
  db.run(`INSERT INTO ${schema.name} (name, data, author) VALUES (?, json(?), ?)`, [name, data, author], error => {
    if (error) {
      console.log(error)
      return res.status(500).end({ message: "error!" });
    } 
    
    if (req.headers['x-sender'] === 'npm-client') {
      return res.status(200).json({
        status:200,
        message: `Insert Successful for key ${name}`
      })
    } else {
      console.log("new links entered into the db, moving on")
      next()
    }
    
    // res.status(500).end(`Thank you for expanding our curriculum. Your school will show up once it is approved.`)
    
    res.redirect('/thankyou')
  });
    
  }
  }
  

}

exports.thankYou = (req, res)=> {
  return res.sendFile(__dirname + '/views/thankyou.html');
};

exports.nameError = (req, res)=> {
  return res.sendFile(__dirname + '/views/mustsubmitschool.html');
};

exports.weather = (req, res)=> {
  return res.sendFile(__dirname + '/views/weather.html');
};

// exports.edit = (req, res)=>{
//   // app.use(express.basicAuth('user', 'password'));

//   return res.sendFile(__dirname + '/views/editindex.html');
// }

exports.eraseDatum = async (req, res, next) => {
  const db = await helpers.initialize(schema)
  
  console.log("deleting data...")
  db.run(`DELETE From ${schema.name} WHERE id = '${req.params.id}'`, (error) => {
    if (error) {
      console.log(error)
      return res.status(500).end({ message: "error!" });
    } 
    
    if (req.headers['x-sender'] === 'npm-client') {
      return res.status(200).json({
        status:200,
        message: `Deleted key with id ${req.params.id}`
      })
    } else {
      console.log(`contents of id ${req.params.name} deleted`)
      next()
    }
  });
}

exports.eraseDatumByName = async (req, res, next) => {
  const db = await helpers.initialize(schema)
  
  console.log("deleting data...")
  db.get(`DELETE From ${schema.name} WHERE name = '${req.params.name}'`, (error) => {
    
    if (error) {
      console.log(error)
      return res.status(500).end({ message: "error!" });
    } 
        
    if (req.headers['x-sender'] === 'npm-client') {
      return res.status(200).json({
        status:200,
        message: `Deleted key ${req.params.name}`
      })
    } else {
      console.log(`contents of id ${req.params.name} deleted`)
      next()
    }
    
  });
}

exports.eraseData = async (req, res, next) => {
  const db = await helpers.initialize(schema)

  console.log("deleting data...")
  db.run(`DELETE From ${schema.name}`, (error) => {
    if (error) {
      console.log(error)
      return res.send({ message: "error!" });
    } else {
      console.log("contents of table deleted")
      next()
    }
  });
}


exports.postTweet = async (req, res, next) => {
  // const db = await helpers.initialize(schema)

  
  
  
  // console.log("deleting data...")
  // db.run(`DELETE From ${schema.name}`, (error) => {
    // if (error) {
    //   console.log(error)
    //   return res.send({ message: "error!" });
    // } else {
    //   console.log("contents of table deleted")
    //   next()
    // }
  }


exports.schema = (req, res) =>{
  
  return res.json(schema)
}