const fs = require("fs");

const HeadlessChrome = require("simple-headless-chrome");
// TODO: check if needed later and remove
// const Input = require('prompt-input');

// TODO: remove
// const readFilePromise = () => {
//   return new Promise((resolve, reject) => {
//     fs.readFile('test-db.json', (err, data) => {
//       if (err) {
//         reject(err);
//       }
//       let student = JSON.parse(data);
//       resolve(student);
//     });
//   })
// }

const browser = new HeadlessChrome({
  headless: false
});

var mongodb = require("mongodb");

var CONTACTS_COLLECTION = "contacts";
var MONGODB_URI =
  "mongodb://autocoinbase:autocoinbase1@ds243084.mlab.com:43084/auto-coinbase-db";

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
function connectDB() {
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
    }
  );
}

function checkForSMSInsert(login_id) {
  return new Promise((resolve, reject) => {
    db.collection(CONTACTS_COLLECTION).findOne({
      login_id
    }, (err, doc) =>{
      if (err) {
        reject(err)
      } else {
        doc.sms_now_recieved ? resolve(sms_auth_token) : resolve(false)
      }
    })
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function navigateWebsite(login_id, username, password) {
  try {
    console.log("in navigateWebsite");

    await browser.init();
    const mainTab = await browser.newTab({
      privateTab: false
    });
    await mainTab.goTo(
      "https://www.coinbase.com/oauth/authorize/oauth_signin?client_id=2d06b9a69c15e183856ff52c250281f6d93f9abef819921eac0d8647bb2b61f9&meta%5Baccount%5D=all&redirect_uri=https%3A%2F%2Fpro.coinbase.com%2Foauth_redirect&response_type=code&scope=user+balance&state=cce4a8c7-4bd3-4130-8a70-c4165fca6f48"
    );

    console.log(`filling in details ${username} ${password}`);
    await mainTab.fill("#email", username);
    await mainTab.fill("#password", password);

    await mainTab.wait(2000);

    console.log("singing in");
    // await mainTab.click('#signin_button')

    console.log(login_id);

    // for some reason thats how ids are inputed in mongodb
    db.collection(CONTACTS_COLLECTION).findAndModify(
      { login_id: login_id },
      [["_id", "asc"]],
      { $set: { sms_now_required: true } },
      { new: true },
      async (err, doc) => {
        if (err) {
          console.log(`err ${err}`);
        } else {
          /*
            { lastErrorObject: { n: 1, updatedExisting: true },
              value: 
              { _id: 5c21e094c0f0381d2552488b,
                login_id: '0.3223672828869586',
                complete: false,
                progress_bar: 0,
                sms_now_required: true,
                sms_auth_token: '' },
              ok: 1,
              operationTime: Timestamp { _bsontype: 'Timestamp', low_: 1, high_: 1545724061 },
              '$clusterTime': 
              { clusterTime: Timestamp { _bsontype: 'Timestamp', low_: 1, high_: 1545724061 },
                signature: { hash: [Object], keyId: [Object] } } }
          */
          const hello = await checkForSMSInsert(login_id)
          console.log(hello)

          while (!hello) {
            console.log("waitign for auth token")
            await sleep(2000)
          }
        }
      }
    );

    // return;

    const ans = await input.run();

    await mainTab.fill("#token", ans);

    await mainTab.wait(2000);
    await mainTab.click("#step_two_verify");

    await mainTab.waitForSelectorToLoad('[data-pup="161381559"]');

    await mainTab.click('[data-pup="161381559"]');

    await mainTab.goTo("https://pro.coinbase.com/profile/api");

    await mainTab.waitForPageToLoad();

    // get a 2fa code
    // post to the apikeys route

    // await browser.close()
  } catch (err) {
    console.log("ERROR!", err);
  }
}

async function sendMultipleMails(id) {
  // logic for
  // sending multiple mails
  while (true) {
    rand = Math.random();
    console.log(`${rand} keep it up`);

    const read = await readFilePromise();

    console.log(`read ${JSON.stringify(read)}`);
  }

  return sendMails;
}

// receive message from master process
process.on("message", async message => {
  // setup the db variable first
  connectDB();

  const numberOfMailsSend = await navigateWebsite(
    message.id,
    message.username,
    message.password
  );

  // send response to master process
  process.send({ counter: numberOfMailsSend });
});
