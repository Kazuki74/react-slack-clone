import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var config = {
    apiKey: "AIzaSyCZSzCQzVb2q2VQ3RtbsYqAXKZ0A29wbMM",
    authDomain: "react-slack-clone-48a01.firebaseapp.com",
    databaseURL: "https://react-slack-clone-48a01.firebaseio.com",
    projectId: "react-slack-clone-48a01",
    storageBucket: "react-slack-clone-48a01.appspot.com",
    messagingSenderId: "72938984846"
  };
firebase.initializeApp(config);