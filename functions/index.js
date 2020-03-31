const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

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
  response.send(result({ 
    success : true, 
    date    : Date.now()
  }));
})

function result(data) {
  return JSON.stringify({ data : data });
}

function enableCors(request, response) {
  response.set('Access-Control-Allow-Headers', 'Origin, Content-Type, authorization');
  response.set('Access-Control-Allow-Origin', request.headers.origin);
  response.set('Access-Control-Allow-Credentials', 'true');
}



