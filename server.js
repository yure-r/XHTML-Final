const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const cors = require("cors")
const routes = require('./routes')
// const {aggregator} = require('./helpers')
const querystring = require('querystring')
const axios = require('axios')
const Twitter = require('twitter')
const session = require('express-session')
var queryText
// Session
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // secure: true,
    httpOnly: true
  }
}))

app.use(express.static("public"));


// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get('/oauth/twitter/:value', (req, res) => {
  console.log(req.params.value)
  req.params.value[0] = ""
  req.params.value[req.params.value.length]=""
  console.log(req.params.value)
  queryText = req.params.value
  const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: '',
    access_token_secret: ''
  });

  client.post('https://api.twitter.com/oauth/request_token', {
    'oauth_callback': 'https://final-final-final-final-final.glitch.me/oauth/twitter2/callback',
    'callback_url': 'https://final-final-final-final-final.glitch.me/oauth/twitter2/callback',
    // 'oauth_consumer_key': process.env.CONSUMER_KEY
  }, (err, result, response) => {
    // text/plain responses may cause an err with status code 200

    if (response.statusCode !== 200) {
      console.log(err)
      console.log(response.rawHeaders)
      console.log(result)      
      res.status(500).send('failed to request to the Twitter API')
    }
    else {
      const { oauth_token, oauth_token_secret, oauth_callback_confirmed } = querystring.parse(result)
      const url = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
      
      req.session.twitterSession = {
        oauth_token
      }

      res.redirect(url)
    }
  })
})

app.get('/oauth/twitter2/callback', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query
  
  const twitterSession = req.session.twitterSession

  const getAccessToken = async () => {
    return axios.post('https://api.twitter.com/oauth/access_token', querystring.stringify({
      oauth_consumer_key: process.env.CONSUMER_KEY,
      oauth_token,
      oauth_verifier
    }))
    .then(({ data }) => {
      console.log(data)
      console.log("was data")
      return querystring.parse(data)
    })
  }
      
  // Response
  if (!twitterSession) {
    res.status(401).json({ message: 'Could not find your session.' })
  }
  else if (oauth_token !== twitterSession.oauth_token) {
    res.status(401).json({ message: 'The oauth_token from querystring does not match' })
  }
  else {
    getAccessToken()
    .then(async accessToken => {
      req.session.twitterSession.accessToken = accessToken
      console.log(accessToken)
      console.log("was access Token")
      // res.redirect('/twitter/statuses/home_timeline') 
      
        const postTweet = async (t, text) =>{
    
    // console.log(t.oauth_token)
    // console.log(t.oauth_token_secret)
    // console.log(t)
    
    const { TwitterApi } = require('twitter-api-v2');
    
    const userClient = new TwitterApi({
  appKey: process.env.CONSUMER_KEY,
  appSecret: process.env.CONSUMER_SECRET,
  // Following access tokens are not required if you are
  // at part 1 of user-auth process (ask for a request token)
  // or if you want a app-only client (see below)
  accessToken: t.oauth_token,
  accessSecret: t.oauth_token_secret,
});
    

 const { data: createdTweet } = await userClient.v2.tweet(text)
 console.log('Tweet', createdTweet.id, ':', createdTweet.text);
 return{'Tweet': createdTweet.id,
        'Text':createdTweet.text}

  }
        
        postTweet(accessToken, queryText).then(response=>res.redirect("/?edit"))
      
      
    })
    .catch(error => {
      console.log(error)
      console.log("line 97")
      res.status(500).json({
        error: 'Not Auth\'d yet!'
      })
    })
  }
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors())

//helper for cross-origin access
const prepare = (req, res, next)=>{
  //handle tokens eventually
  
  // res.set({'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  next()
}

//allow for static asset serving, like html, css and js files
// app.use(express.static("public"));

//HTML routes
app.get("/", routes.index);

app.get("/nyu/en.html", routes.weather)
app.get("/content/nyu/en/students.html", routes.weather)
app.get("/content/nyu/en/faculty.html", routes.weather)
app.get("/content/nyu/en/alumni.html", routes.weather)
app.get("/content/nyu/en/employees.html", routes.weather)
app.get("/content/nyu/en/community.html", routes.weather)



app.get("/thankyou", routes.thankYou)

app.get("/schoolnameerror", routes.nameError)
//API endpoints
// ✓ get all data
app.get("/data", prepare, routes.getData);

// ✓ get a datum by id
app.get("/data/:id", prepare, routes.getDatum)

// get a datum by id
app.get("/data/name/:name", prepare, routes.getDatumByName)

// ✓ add a datum
app.post("/data", prepare, routes.postDatum, routes.index)

// ✓ edit a datum
app.post("/data/update", routes.editDatum, routes.index)

app.post("/data/name/update", routes.editDatumByName, routes.index)

app.post("/nopage/data/name/update", routes.editDatumByNameNoPage, routes.index)

// ✓ danger: erase a specific datum
app.post("/erase/:id", routes.eraseDatum, routes.index)

app.post("/erase/name/:name", routes.eraseDatumByName, routes.index)


// ✓ danger: erase everything
// app.post("/erase", routes.eraseData, routes.index)

// ✓ surface the schema... just for fun
app.get("/schema", prepare, routes.schema);

app.get("/authors", prepare, routes.authors)

app.get("/postTweet", prepare, routes.postTweet)



// listen for requests :)
var listener = app.listen(process.env.PORT, async () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
  // await aggregator()
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// init passport for authentication management & express-session for session management
const passport = require('passport');
// const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const LocalStrategy = require('passport-local').Strategy;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
app.use(session({ 
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  secret: 'nice hair',
  resave: false, 
  saveUninitialized: false, 
  
}));
app.use(passport.initialize());
app.use(passport.session());

// app.get("/edit", routes.edit)


const adminDirectory = '/' + process.env.ADMIN_DIRECTORY;

// set passport to use LocalStrategy to check for username and password fields
passport.use(new LocalStrategy(
  function(username, password, callback) {
    if (username !== process.env.USERNAME || password !== process.env.PASSWORD) {
      console.log('login attempt failed:', username, password);
      return callback(null, false);
    }
    let user = { username, password };
    return callback(null, { username: username, password: password });
}));

// passport authenticated session persistence config
passport.serializeUser(function(user, callback) {
  callback(null, 0);
});
passport.deserializeUser(function(user, callback) {
  callback(null, {username: process.env.USERNAME, password: process.env.PASSWORD});
});

// ROUTE: success is sent to the directory sent in .env

app.get('/AuthenticateAdmin', function(request, response){
  response.sendFile(__dirname + '/views/login.html')

});

app.get('/login', function(request, response){
  response.sendFile(__dirname + '/views/login.html')

});

app.get(adminDirectory, ensureLoggedIn(), function(request, response) {
  console.log('success', request.user);
  response.sendFile(__dirname + '/views/editindex.html');
});



// ROUTE: login post endpoint
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(request, response) {
  response.redirect(adminDirectory);
});

// ROUTE: logout
app.get('/logout', function(request, response) {
  request.logout();
  response.redirect('/');
});

// ROUTE: failed login
app.get('/error', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// ROUTE: everywhere else is not auth'd
app.get('*', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});