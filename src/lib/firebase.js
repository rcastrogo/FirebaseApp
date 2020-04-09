import pol from './mapa.js';
import app from 'firebase/app';
import 'firebase/functions';
import 'firebase/messaging';
import 'firebase/auth';
import 'firebase/firebase-firestore';

app.initializeApp({
  apiKey: "AIzaSyAIownX-ySe-_52p4JniFHPkAQ0Fn_McrE",
  authDomain: "belloto-c925d.firebaseapp.com",
  databaseURL: "https://belloto-c925d.firebaseio.com",
  projectId: "belloto-c925d",
  storageBucket: "belloto-c925d.appspot.com",
  messagingSenderId: "931612603004",
  appId: "1:931612603004:web:85d23bf6f0287b42f78ff9"
});

const functions = app.functions();
const database  = app.firestore();
const auth      = app.auth();
const messaging = app.messaging();

//functions.useFunctionsEmulator('http://localhost:5000');

function loadUsers(accesstoken) {
  return new Promise((resolve, reject) => {
    let url = functions._url('app/auth/users');
    pol.ajax
        .get(url, req => {
          req.setRequestHeader('Content-Type', 'application/json');
          req.setRequestHeader('Authorization', 'Bearer ' + accesstoken);
        })
        .then(result => {
          resolve(JSON.parse(result));
        })
        .catch( error => {
          reject(error);
        });
  });
}

export { 
  functions, 
  database, 
  auth, 
  app, 
  messaging,
  loadUsers
};
