const functions = require('firebase-functions');
const express   = require('express');
const cors      = require('cors')({origin: true});
const fetch     = require('node-fetch');

const app  = express();
app.use(cors);

exports.app = functions.https.onRequest(app);
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

exports.helloWorld = functions.https.onCall((data, context) => {
  //  if (!context.auth) return {status: 'error', code: 401, message: 'Not signed in'}
  //  return new Promise((resolve, reject) => {
  //    // find a user by data.uid and return the result
  //    resolve(user)
  //  })
  return { success : true, message : 'Hello from Firebase!'};

});

exports.getDate = functions.https.onRequest((request, response) => {
  enableCors(request, response); 
  response.setHeader('Content-Type', 'application/json')
  response.status(200)
          .send(
    result({ 
      success : true, 
      date    : Date.now()
    })
  );
})

function result(data) {
  return JSON.stringify({ data : data });
}

function enableCors(request, response) {
  response.set('Access-Control-Allow-Headers', 'Origin, Content-Type, authorization');
  response.set('Access-Control-Allow-Origin', request.headers.origin);
  response.set('Access-Control-Allow-Credentials', 'true');
}



