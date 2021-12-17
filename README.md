# cooper-union-sqlite-json-storage
### A sample project for creating simple CRUD interfaces

# Intro
This project contains three separate, related projects, bundled in one for easy remixing and distribution. It was created for the Interactive Design Concepts class at [Cooper Union](https://cooper.edu), but is broadly applicable.

The three projects are:
* api server
* npm client
* sample web app client

In addition to walking through the above three categories, there is also a bonus Metadata section at the bottom of this document that covers:
* SQLite schema definitions, as implemented in db_helpers.js
* A brief exploration of SQL queries in this project

## Background
The goal of this project was multi-fold, but primarily to provide a useful, queryable storage interface entirely hosted on Glitch. This goal of a self-contained storage system was arrived at considering the needs of student work at Cooper over the past 12 years. Many of the most interesting student projects require data storage of one type or another, and any number of solutions exist, but with caveats. 

## Competition
* In previous years, Google Sheets API offered a relatively easy way of storing and retrieving data, but their migration from the v3 to v4 api has left many efficient client libraries, and the student projects that run on them, in the lurch. 
* [Low.db](https://github.com/typicode/lowdb) offers a great set of utilities on top of an parseable JSON file, but with a non-standard query syntax.
* The positioning of the brand Firebase under the Google umbrella seems to change on a quarterly basis. The original offering was incredibly useful for students, but there is a direct correlation between the increase of the surface area of the brand "Firebase" and a decrease in utility of the "Getting started tutorials"

This project is neither a replacement for the above, nor a full-fledged storage solution. Rather, it fits a niche need of a person who a) needs to store things in some fashion, b) would like to learn about SQL, and c) values speed and hackability over robustness.

---

# API Server
The server attempts to simplify some of the aspects of creating a CRUD (create, read, update, delete) interface on top of an SQLite database. While no explicit knowledge of SQL is necessary to use this project, experience with editing express-based node apps can be of great help.

The interface that the *api server* presents roughly emulates that of a NoSQL-style named JSON object store. 


## Create, Read, Update and Delete Endpoints
```
//TODO: Replace with an OpenAPI spec diagram

// ✓ get an entry by id or name
GET /data/:id
GET /data/name/:name

// ✓ post an entry
POST /data

// ✓ update an entry by id or name
POST /data/update
POST /data/name/update

// ✓ delete an entry by id or name
POST /erase/:id
POST /erase/name/:name

```
Named JSON entries are submitted via POST to the system, and stored in the underlying SQLite database. These auto-generate an id, and can be fetched by id or name. ather than provide a comprehensive deep-dive into the inner workings of 
ll of the underlying tech, the following walkthroughs are meant to provide 
n entry point into how to hunderstand and ack on this project.


## API Server Walkthrough
The api server consists of a few relevant parts to understand:
* The [express](https://expressjs.com/)-based `server.js` entrypoint to the entire project
* The `routes.js` file, where all of the endpoints go to, and where the SQLite queries are defined for talking to the database.

### Server.jsThe entrypoint into the backend of this project is `server.js`. The two sections 
of import are denoted with *HTML Routes* and *API Routes* within the file. All client-side
logic is contained within the single `index.html` file, but each api function
requires its own endpoint.

### Simple Example
In express, a route is defined as one or more middleware steps that either process
and return data to the browser, or process and pass it along to the next middleware.
Taking the first api example, `app.get("/", routes.index);`, this directive says 
"any request at the root / of this domain should be routed to the functoin index in
the file routes.js". In `routes.js`, exports.index outputs the html file 
`views/index.html`.

### Advanced Example
A more involved example `app.post("/erase/:id", routes.eraseLData routes.index)` 
requires a lot more explanation.
* This route is only triggered via a *POST* request.
* The `:id` in `/erase/:id` is a required parameter. In this case, it assumes a 
request comes in the form of `/erase/4`, which would then trigger the deletion of 
a post with `id=4`.
* The `id` is passed first to the *eraseLink* function in `routes.js`, triggering
the delete. Once this function completes, the data is passed to *index* in `routes.js`,
which pulls the latest posts and displays the updated list.


---#
# NPM API Client
The api client library is contained in the `/client` folder of this project. For easy installation and use in other projects, it is packaged on [npm](https://www.npmjs.com/package/cooper-union-sqlite-client).

## Installation
`npm install --save cooper-union-sqlite-client`
`const client = require('cooper-union-sqlite-client')({apiKey:apiKey})`

## Configuration
Both configuration options can be set when instantiating the client (as `apiKey` is in the above usage example). As of 0.1.6, api keys are not required, and are just included to help set up future development.

```
client.apiKey = <provided api key>
client.endpoint = <url to a remixed or self-hosted version of this project>
```

## Functions
* client.get(key)
* client.post(key, payload)
* client.update(key, payload)
* client.delete(key)

In the case of all functions, the `key` is a string that should uniquely identify the object, and the payload is a JSON object. All operations return promises, and are designed to be used in an async/await context.

## Examples
The following example creates a stored JSON object called *test*, retrieves it, updates it, and then deletes it.

```
await client.post('test', {
  "fancy":true
})

const testData = await client.get('test')

await client.update('test', {
  "fancy":false,
  "another": true
})

await client.delete('test')

```


## Current Test Coverage
```
✓ api key should be set correctly (6ms)
✓ setting a new endpoint should work
✓ client.get() without a key should fail (1ms)
✓ client.get(testDataKey) should fail when the key does not exist (1188ms)
✓ client.post() without data should fail
✓ client.post() with new data should succeed (54ms)
✓ client.get(testDataKey) should return correctly after it exists (28ms)
✓ client.update should fail with an invalid key (37ms)
✓ client.update should succeed with new data (122ms)
✓ client.delete should succeed with a valid key (129ms)
```

---

# Client Website Walkthrough
Most of the logic for this application is handled in the `crud.js` file, but there are 
some features of note in `index.html` to go over first.

### views/index.html
The `<form>` tags starts out as hidden. Various features of the application are triggered
via url query parameters, which contextually show or manage the form tag. The `.data-list` 
and `#actions` section tags get populated with information via client-side requests contained
in the `crud.js` file.

### public/crud.js
The main `crud.js` file contains an async function called `run()`, which does a number 
of things:
1. Determine if there are any query parameters to trigger separate routines from.
2. Get the current list of links from the database.
3. For each link, generate a `<li>` for it with various attributes.
4. Show a version of the add form if required.
5. Show the "erase" button if required.

Most of the action happens in the `generateListItem()` function. If the links are requested
in a normal way, the information from the database is rendered as a series of list items in
the form of `<li><a href="..."></a></li>`. If the list is requested with the `editable` 
option (triggered via the *?edit* query param), each list-item also has an *edit* and 
*delete* in-line item added to itself.

The `generateEraseButton()` is injected when the query parameter of *?erase* is added to 
the url, which triggers the `/eraseLinks` api function from *routes.js*.

## Relevant Files

* `views/index.html`
* `public/crud.js`
* `public/style.css`


---

# Metadata: Database Schemas and Queries 

## Schema definition
One of the core tenets of this project is the definition and storage of information 
locally in an SQLite database. Relational Databases need to have their columns, 
or data types, clearly defined during the creation of the database. The `schema` 
function in `routes.js` helps facilitate this in a number of ways.

```javascript
const schema = {
  name: "attributedStorage", //no special punctuation like - or .
  columns: {
    id: "id", //leave this here, no matter what else you change
    author: "text",
    name: "text",
    data: "json" //put json here
  }
}
```

The `name` key is used as the name of the table in the database to be created. **Valid**
names are *data*, *fancy* or *myCoolProj123*, whereas **invalid** names are *data-proj*
or *data.v1*. 

The `columns` object contains a list of properties and their simple datatypes. The
datatypes can be any valid [sqlite3 data type](https://www.sqlite.org/datatype3.html):
*text, integer, real, blob, json* and *null*. *JSON* is supported with the bundled `json1` extension, included by default with the sqlite3 library.

### Updating the schema
If you want to store a new column of data, start by changing the column list to reflect
the changes you want, then rename the `name` field. When you rename the `name` value,
the server rebuilds the database with the new name and column list.

If you check the server logs, there are three message that can appear regarding the schema:
1. **"table is current and columns are in sync"** - All is well, and your currently defined
schema is deployed.
2. **"table is current but columns are out of sync. please update schema name."** - You have 
updated the columns that you'd like to store, but have not yet renamed the table. Please 
rename the `name` field.
3. **"table does not exist, creating it"** - A new table name has triggered a rebuild, and will
be online immediately.

**Note:** data from the old table to the new one is not migrated, but it also isn't deleted. 
Old data is preserved under the old table name with the old schema. This magic is facilitated
in `helpers.js`.


### SQLite Queries
The *routes.js* file contains a number of SQL queries. The simplest, 
`SELECT * from ${schema.name}`, selects all of the data from the database name as defined
in the `schema` function. 

SQL queries can use a number of *WHERE* clauses to limit data 
retrieved as well, for example `Select * from ${schema.name} WHERE id = 4` would only 
return a single row where an *id=4*. 

The `INSERT` statement is used in conjunction with features from the sqlite3 js library. 
In the following example, an *Insert* statement is constructed via filling in the two ?
question marks with the values from the data array `[url, description]`.

```
db.run(`INSERT INTO ${schema.name} (url, description) VALUES (?, ?)`, 
[url, description], error => {...});
```

These two techniques (WHERE and sqlite3 features) are combined in the Update function. 
In this example, the three ? question marks are replaced in order from the data array
`[url, description, id]`, but the *id* is used in the `WHERE` clause to limit the update
to a single row.
 
``` 
db.run(`UPDATE ${schema.name} SET url = (?), description = (?) WHERE id = (?)`, 
[url, description, id], (error) => {...});
```

