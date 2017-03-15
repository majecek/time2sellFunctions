// // Start writing Firebase Functions
// // https://firebase.google.com/preview/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// })


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _  = require('lodash');
var googleStocks = require('google-stocks');
// const axios = require('axios');

admin.initializeApp(functions.config().firebase);

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original

function convertToArray(objGroup) {
  const newArray = []
  if (!objGroup) {
    return newArray
  }
  _.forEach(objGroup, (eachObj, index) => {
    eachObj.id = index
    newArray.push(eachObj)
  })
  return newArray
}

exports.updateStocks = functions.https.onRequest((req, res) => {
  const axios = require('axios');

  const time1 =Date.now();
  console.log('timestamp',time1);

  // var response = UrlFetchApp.fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=');
// console.log('urlfetch:', response.getContentText());

  axios.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=')
    .then(res => {
      console.log('axios', JSON.parse(res.data))
      console.log('axios2', JSON.parse(res.data.substring(3))[0].l)
      JSON.parse(res.data.substring(3)).forEach(st => {
        console.log(st.t, st.l)
      })
    });

  // let stockArray = [];
  // admin.database().ref(`users/109037309929453943367`).on('value', snapshot => {
  //   // console.log('snapshot', snapshot.val().stocks);
  //   stockArray = convertToArray(snapshot.val().stocks);
  //   console.log('stockArray', stockArray);
  //
  //
  //
  //   // stockArray.forEach(stock => {
  //   //   console.log('google-prep',stock);
  //   //   console.log('google-prep1',stock.symbol);
  //   //
  //   //
  //   //   googleStocks([stock.symbol])
  //   //     .then(function(data) {
  //   //       console.log('google',stock.symbol,data.l);
  //   //       /* do something with data */
  //   //     })
  //   //     .catch(function(error) {
  //   //       console.log('google-error', error);
  //   //     });
  //   // })
  //   console.log('timestamp3',Date.now() - time1);
  //
  // });

  console.log('timestamp2',Date.now() - time1);

  // googleStocks(['AAPL'], function(error, data) {
  //   console.log(data);
  // });

  // googleStocks(['AAPL'])
  //   .then(data => {
  //     console.log('google-stock', JSON.stringify(data))
  //     /* do something with data */
  //   })
  //   .catch(error => {
  //     /* error logic */
  //   });
  // console.log('stockArray', stockArray);

  // stockArray.map(stock => {
  //   console.log('google-prep',stock);
  //   googleStocks([stock.symbol])
  //     .then(function(data) {
  //       console.log('google',stock.symbol,data.l);
  //       /* do something with data */
  //     })
  //     .catch(function(error) {
  //       console.log('google-error', error);
  //     });
  // })

  // Grab the text parameter.
  // const original = req.query.text;
  // // Push it into the Realtime Database then send a response
  // admin.database().ref('/messages')
  //   .push({original: original})
  //   .then(snapshot => {
  //     // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  //     res.redirect(303, snapshot.ref);
  //   });
  res.send("Hello from Firebase!");
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
//   .onWrite(event => {
//     // Grab the current value of what was written to the Realtime Database.
//     const original = event.data.val();
//     console.log('Uppercasing', event.params.pushId, original);
//     const uppercase = original.toUpperCase();
// // You must return a Promise when performing asynchronous tasks inside a Functions such as
// // writing to the Firebase Realtime Database.
// // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//     return event.data.ref.parent.child('uppercase').set(uppercase);
//   });
