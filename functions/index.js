// ===============================================================
// Firebase Functions
// ===============================================================
const functions = require('firebase-functions');
// ===============================================================
// Firebase
// ===============================================================
require('firebase/firebase-auth');
const firebaseApp = require('firebase/app');
const admin       = require('firebase-admin');
// ===============================================================
// Firebase auth
// ===============================================================
firebaseApp.initializeApp({
  apiKey: "AIzaSyAIownX-ySe-_52p4JniFHPkAQ0Fn_McrE",
  authDomain: "belloto-c925d.firebaseapp.com",
  databaseURL: "https://belloto-c925d.firebaseio.com",
  projectId: "belloto-c925d",
  storageBucket: "belloto-c925d.appspot.com",
  messagingSenderId: "931612603004",
  appId: "1:931612603004:web:85d23bf6f0287b42f78ff9"
});
// ===============================================================
// Firebase admin
// ===============================================================
let serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  databaseURL: "https://belloto-c925d.firebaseio.com",
  credential: admin.credential.cert(serviceAccount)
});

// ===============================================================
// Express middelware
// ===============================================================
const fetch   = require('node-fetch');
const express = require('express');
const cors    = require('cors')({origin: true});
const app     = express();


const validateFirebaseIdToken = async (req, res, next) => {
  console.log(req.url);
  if (req._parsedUrl.pathname == '/auth/token') {
    next();
    return;
  }
  if (req._parsedUrl.pathname == '/auth/users') {
    next();
    return;
  }
  if (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  try {
    let idToken = req.headers.authorization.split('Bearer ')[1];
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
    return;
  } catch (error) {
    res.status(403).send('Unauthorized');
    return;
  }
};

app.use(validateFirebaseIdToken);
app.use(cors);

app.get('/books', (req, res) => {
  
  const cat  = req.query.category || '';
  const tags = req.query.any_tags || '';  
  const url  = 'http://www.etnassoft.com/api/v1/get/?' +
               'num_items=100&' +
               'decode=true'   +
                (cat  ? '&category=#'.replace('#', cat)   : '') + 
                (tags ? '&any_tags=[#]'.replace('#', tags) : '');
  console.log(url);
  fetch(url)
    .then(res => res.json())
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(200).send(err);
    });

});

app.get('/auth/token', async (req, res) => { 
  firebaseApp.auth()
             .signInWithEmailAndPassword(
               req.query.username || '', 
               req.query.password || ''
             )
             .then((result) => {
               res.json(result.user.toJSON());
             })
             .catch((err) => {              
               res.send(err);
             });
});

app.get('/auth/data', async (req, res) => { 
  if(!req.headers.authorization) {
    return res.status(403)
              .send({ message: "authorization: Bearer"});
  }
  admin.auth()
       .verifyIdToken(req.headers.authorization.split(' ')[1] || '')
       .then(function(result) {
         res.send(result)
       }).catch(function(error) {
         res.send(error);
       });
})

app.get('/auth/users', async (req, res) => { 
  if(!req.headers.authorization) {
    return res.status(403)
              .send({ message: "authorization: Bearer"});
  }

  listAllUsers()
    .then(users => {
      res.status(200)
         .json( 
           { data : { 
             success  : true, 
             users    : users
           }
         });
    })
    .catch(function(error) {
      res.status(400)
         .send(error);
    });

})

function listAllUsers(nextPageToken) {
  return new Promise((resolve, reject) => {
    let users = [];
    admin.auth()
         .listUsers(1000, nextPageToken)
         .then(function(result) {
           result.users.forEach( user => {
             let {uid, email} = user;
             users.push({uid, email}); 
           });
           resolve(users);
         })
         .catch(function(error) {
           reject('Error listing users: ' + error);
         });
  });
}

exports.helloWorld = functions.https.onCall((data, context) => {
  if (!context.auth){
    return { 
      status  : 'error', 
      code    : 401, 
      message : 'Not signed in'
    }
  }
  return { 
    success : true, 
    message : 'Hello from Firebase!'
  };
});

exports.getDate = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Headers', 'Origin, Content-Type, authorization, firebase-instance-id-token');
  response.set('Access-Control-Allow-Origin', request.headers.origin);
  response.set('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Content-Type', 'application/json')
  response.status(200)
          .send(
            { data : { 
              success : true, 
              date    : Date.now()
            }
          });
})

exports.app = functions.https.onRequest(app);