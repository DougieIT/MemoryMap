var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var mongodb = require('mongodb');
var client = new mongodb.MongoClient("mongodb://127.0.0.1:27017"); 

session = require('express-session');

var db = client.db("MemoryMap");
var collection = db.collection("UsernamePassword");

app = express();
app.use(express.urlencoded({extended : true}));


app.use(session({
  secret: 'dougs-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
    

});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});


app.post('/register', async (req,res) => {
    var usernameVal = req.body.username;
    var passwordVal = req.body.password;

    var result = await searchDb({username:usernameVal});

    console.log(result);
    if(result.length == 0){
      console.log("username free");
      collection.insertOne({username: usernameVal, password:passwordVal});
    } else{
      console.log("username taken");
    }
    res.redirect('back');
});

app.post("/login", async (req, res) => {
    var enteredUsername = req.body.username;
    var enteredPassword = req.body.password;

    var results = (await searchDb({username:enteredUsername}));
    if (results.length == 0){
      console.log("Login failed");
      res.redirect('back');
      return;  
    }
    
    var result = results[0];
    if (result.username == enteredUsername && result.password == enteredPassword){
      console.log("Sucessful login");
      req.session.isLoggedIn = true;
      req.session.username = enteredUsername;
    } else{
      console.log("Login failed");
    }

    res.redirect('back');
});


async function searchDb(query){
  var result = await collection.find(query).toArray();
  return result;
}


client.connect();
app.listen(8080);