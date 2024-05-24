var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var mongodb = require('mongodb');
var session = require('express-session');
const { markAsUntransferable } = require('worker_threads');
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


app.get('/user_markers', async(req,res)=> {

  /*
  markers : [
      {
        name : "text"
        long : float
        lat : float
        info : "text"
        
      }
    ]
  */

    var user_data = await searchDb({username : req.session.username});
    
    console.log(user_data);
    markers = user_data[0].markers.list;
    console.log(markers);
    res.json(markers);
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get('/add_user_data.html', (req,res) =>{
  res.sendFile(path.join(__dirname, "add_user_data.html"));
});

app.post('/add_user_data', async (req,res) =>{
  user_data = req.body.user_data

  var logged_in = await searchDb({username:req.session.usernameVal})
  console.log(req.session);
  console.log()
  console.log(logged_in);
  
  res.sendFile(path.join(__dirname, "add_user_data.html"));
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
    } else{
      req.session.username = req.body.username
      req.session.password = req.body.password

   //   user_data = await searchDb{session_data:}

      console.log("Successful login")
    }
    
    var result = results[0];
    if (result.username == enteredUsername && result.password == enteredPassword){
      console.log("Sucessful login");
      req.session.isLoggedIn = true;
      req.session.username = enteredUsername;
      res.sendFile(path.join(__dirname, "map.html"));
    } else{
      console.log("Login failed");
    }
});


async function searchDb(query){
  var result = await collection.find(query).toArray();
  return result;
}


client.connect();
app.listen(8080);