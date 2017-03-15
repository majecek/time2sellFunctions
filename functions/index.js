// // Start writing Firebase Functions
// // https://firebase.google.com/preview/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// })


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = require('lodash');
const googleStocks = require('google-stocks');


admin.initializeApp(functions.config().firebase);
const db = admin.database();

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


  db.ref('users').on('value', snapUser => {
    _.keys(snapUser.val()).forEach(userKey => {
      // let stockArray = [];
console.log('===>USER:', userKey);
        db.ref('users').child(`${userKey}/stocks`).on('value', snapStocks => {

         const stockArray = convertToArray(snapStocks.val());
console.log('stockArray1',userKey, stockArray);
          const stocksSymbols = stockArray.map(stock => { return stock.symbol });
console.log('stocksSymbols',userKey, stocksSymbols);
          // const updatedStocks = getUpdatedPrices(stocksSymbols);



          googleStocks([stocksSymbols])
            .then(function (data) {
              // console.log('google updated price:', stocksSymbols, data);

              let result = {};
              stockArray.map(stock => {
                const updatedStockObj = data.filter(updatedStock => {
                  return updatedStock.t === stock.symbol
                });
      console.log('updatedStockObj',userKey, JSON.stringify(updatedStockObj));
                stock.lastPrice = updatedStockObj[0] ? updatedStockObj[0].l : 0;
                result[`stocks/${stock.id}/lastPriceTimeStamp`] = Date.now();
                result[`stocks/${stock.id}/lastPrice`] = stock.lastPrice;
              })
      // console.log('stockArray2', stockArray);



              // stockArray.map(stock => {
              //           result[`stocks/${stock.id}/lastPriceTimeStamp`] = Date.now();
              //   return  result[`stocks/${stock.id}/lastPrice`] = stock.lastPrice;
              // });

      // console.log('result:', result);
              db.ref(`users/${userKey}`).update(result);
console.log('stocks updated', userKey, result);
            })

            .catch(function (error) {
              console.log('google-error', error);

              // // let result = {};
              //
              // stockArray.map(stock => {
              //   result[`stocks/${stock.id}/errorTimeStamp`] = Date.now();
              //   return  result[`stocks/${stock.id}/error`] = error;
              // });
              //
              // db.ref(`users/${userKey}`).update(result);
            });
      //TODO I should put update here - out of google functions
        });
console.log('===>USER-END:', userKey);

    });

  });

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
