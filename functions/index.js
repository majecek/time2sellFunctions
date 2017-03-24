const functions = require('firebase-functions')
const admin = require('firebase-admin')
const _ = require('lodash')
const googleStocks = require('google-stocks')
const nodemailer = require('nodemailer')

const gmailEmail = encodeURIComponent(functions.config().gmail.email)
const gmailPassword = encodeURIComponent(functions.config().gmail.password)
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`)

admin.initializeApp(functions.config().firebase)
const db = admin.database()

exports.updateStocks = functions.https.onRequest((req, res) => {

  db.ref('users').once('value', snapUser => {
    // console.log('snapUser',snapUser.val());

    _.keys(snapUser.val()).forEach(userKey => {
      const userObj = snapUser.val()[userKey]
      const userEmail = userObj.email
      // console.log('===>USER:', userKey)
      db.ref('users').child(`${userKey}/stocks`).once('value', snapStocks => {
        getPricesFromGoogle(snapStocks, userKey, userEmail)
      })
      // console.log('===>USER-END:', userKey);

    })
  })

  res.send('Hello from Firebase!')
})

function convertToArray (objGroup) {
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

function preparePricesForDB (stocksFromDB, googlePrices, userKey, userEmail) {
  let result = {}
  stocksFromDB.map(stock => {
    const updatedStockFromGoogle = googlePrices.filter(googlePrice => {
      return googlePrice.t === stock.symbol
    })
    // console.log('Prices from Google', userKey, JSON.stringify(updatedStockFromGoogle))
    const lastPrice = updatedStockFromGoogle[0] ? updatedStockFromGoogle[0].l : 1
    const highestPrice = stock.lastPrice > stock.highestPrice ? stock.lastPrice : stock.highestPrice
    const gain = _.round(((100 * lastPrice ) / stock.purchasePrice) - 100, 2)
    const currentTreshold = _.round(((1 - (lastPrice / highestPrice)) * 100), 2)
    // console.log(userKey, 'highestPrice', highestPrice, 'lastPrice', lastPrice, 'gain', gain, 'currentTreshold', currentTreshold)
    result[`stocks/${stock.id}/lastPriceTimeStamp`] = new Date().toISOString()
    result[`stocks/${stock.id}/lastPrice`] = lastPrice
    result[`stocks/${stock.id}/highestPrice`] = highestPrice
    result[`stocks/${stock.id}/gain`] = gain
    result[`stocks/${stock.id}/currentTreshold`] = currentTreshold

    if (currentTreshold > stock.threshold && !stock.notified) {
      sendEmail(userEmail, stock, gain, highestPrice, lastPrice)
      result[`stocks/${stock.id}/notified`] = true
    }
  })
  return result
}

function sendEmail (email, stock, gain, highestPrice, lastPrice) {
  const mailOptions = {
    from: '"Time2Sell Corp." <noreply@firebase.com>',
    to: email,
    subject: 'Time2Sell Treshold Alert',
    text: `Hello
    you just hit your treshold alert! Here is summary:
    
    symbol: ${stock.symbol} 
    highest price: ${highestPrice} - current price: ${lastPrice}
    current P&L: ${gain}
    
    best regards, 
    time2sell `
  }
  return mailTransport.sendMail(mailOptions).then(() => console.log('email sent to', email))
}

function getPricesFromGoogle (snapStocks, userKey, userEmail) {

  const stocksFromDB = convertToArray(snapStocks.val())
  const stocksSymbols = stocksFromDB.map(stock => {
    return stock.symbol
  })
  // console.log('stocksArray', userKey, stocksFromDB);
  console.log('stocksSymbols', userKey, stocksSymbols)

  googleStocks([stocksSymbols])
    .then(function (data) {
      const result = preparePricesForDB(stocksFromDB, data, userKey, userEmail)
      db.ref(`users/${userKey}`).update(result)
      console.log('stocks updated', userKey, result)
    })
    .catch(function (error) {
      console.error('google-error', userKey, stocksSymbols, error)
      // if (error.code !== 'ECONNRESET') {
      db.ref(`users/${userKey}/errors`).push().set({
        error,
        errorTimeStamp: new Date().toISOString()
      })
      // }

    })
}
