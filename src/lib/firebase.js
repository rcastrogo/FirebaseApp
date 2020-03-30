import app from 'firebase/app';
import 'firebase/functions';
import 'firebase/auth';
import 'firebase/firebase-firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAIownX-ySe-_52p4JniFHPkAQ0Fn_McrE",
  authDomain: "belloto-c925d.firebaseapp.com",
  databaseURL: "https://belloto-c925d.firebaseio.com",
  projectId: "belloto-c925d",
  storageBucket: "belloto-c925d.appspot.com",
  messagingSenderId: "931612603004",
  appId: "1:931612603004:web:85d23bf6f0287b42f78ff9"
};

app.initializeApp(firebaseConfig);

const functions = app.functions();
const database = app.firestore();
const auth = app.auth();
//functions.useFunctionsEmulator('http://localhost:5000');
export { functions, database, auth, app};