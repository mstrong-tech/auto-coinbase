// const HeadlessChrome = require("simple-headless-chrome");
// const Input = require("prompt-input");

// const filter = require('lodash/filter')

// TODO: update to https https://medium.freecodecamp.org/getting-off-the-ground-with-expressjs-89ada7ef4e59
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
// TODO: make sure its not needed and remove
// app.use(express.static(__dirname + "/public"));
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse application/json
// TODO: add in a parser for content type text/plain and text (default for postman)
// TODO: or add in a error message
// app.use(bodyParser.text())
// app.use((request, response) => {
//   if (req.headers['content-type'] == "text/plain") {
//   }
// })

// testing request body
// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })

// var input = new Input({
//   name: "code",
//   message: "What is your code?"
// });

// const browser = new HeadlessChrome({
//   headless: false
// });

// navigateWebsite()

// const something = {}

// app.get('/', function (req, res) {

//   something["ksjdfljsdflkjsf"] = false

//   res.send('Hello World')

//   rand = Math.random()

//   while (something["ksjdfljsdflkjsf"] == false) {
//     console.log(`waiting ${rand}`)
//   }

//   console.log("done")
// })

// app.get('/hi', function (req, res) {

//   something["ksjdfljsdflkjsf"] = true

//   res.send('something updated')
// })

var mongodb = require("mongodb");

var CONTACTS_COLLECTION = "contacts";
var MONGODB_URI =
  "mongodb://autocoinbase:autocoinbase1@ds243084.mlab.com:43084/auto-coinbase-db";

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(
  MONGODB_URI,
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    app.listen(1234);
  }
);

app.post("/db-test", (request, response) => {
  db.collection(CONTACTS_COLLECTION)
    .find({})
    .toArray(function(err, docs) {
      if (err) {
        handleError(response, err.message, "Failed to get contacts.");
      } else {
        response.status(200).json(docs);
      }
    });
});

const { fork } = require("child_process");
app.post("/coinbase/submit-creds", (request, response) => {

  const login_id = Math.random().toString()

  console.log(`body ${JSON.stringify(request.body)} ${request.body.coinbase_username} ${request.body.username}`)

  // const id = Math.random();
  const newLogin = {
    login_id,
    complete: false,
    progress_bar: 0,
    sms_now_required: false,
    sms_now_recieved: false,
    sms_auth_token: ""
  };

  // insert into the db a slot for this id
  db.collection(CONTACTS_COLLECTION).insertOne(newLogin, function(err, doc) {
    if (err) {
      handleError(response, err.message, "Failed to create new contact.");
    } else {
      // fork another process
      const process = fork("./send_mail.js");

      // send list of e-mails to forked process

      console.log(`login_id ${login_id}`)

      process.send({
        id: login_id,
        username: request.body.coinbase_username,
        password: request.body.coinbase_password
      });

      response.status(201).json(doc.ops[0]);
    }
  });

  // listen for messages from forked process
  //  process.on('message', (message) => {
  //    console.log(`Number of mails sent ${message.counter}`);
  //  });

  //  return response.json({ status: true, sent: true });
});

// TODO: something fancy like sending a 15%, 25%, ... progress on each step
app.get("/coinbase/check-progress/:id", async (request, response) => {
  // pull from the file / db the progress
  db.collection(CONTACTS_COLLECTION).findOne({ login_id: login_id }, function(err, doc) {
    response.status(201).json(doc);
  })
});

app.post("/coinbase/send-smsauth", (request, response) => {
  // write into the file / db the smsauth

  return response.json({ status: true, sent: true });
});
