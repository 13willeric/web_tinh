const firebaseConfig = {
  apiKey: "AIzaSyDsZGUIWm5X8i79CnSnJKwlv4_Pu3q3iuc",
  authDomain: "myfirstfb-65c63.firebaseapp.com",
  databaseURL:
    "https://myfirstfb-65c63-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myfirstfb-65c63",
  storageBucket: "myfirstfb-65c63.appspot.com",
  messagingSenderId: "290610857576",
  appId: "1:290610857576:web:593011b529606c2b611ddd",
  measurementId: "G-55Z9TR5GK7",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export default db;
