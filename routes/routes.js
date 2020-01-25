const express = require('express');
const axios = require('axios');
const querystring = require('querystring')
const fs = require( 'file-system' );
const stripe = require('stripe')('sk_test_wWkkDeUKiuZ1E29smvXqQ3vj00sy5Gz0rG');

const getNonce = require('../middleware/getNonce.js')
const validateAuth = require('../middleware/validateAuth.js')
const uploadImage = require('../middleware/uploadImage.js')

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const constants = require('../constants.js');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage});

let router = express.Router()

const api = new WooCommerceRestApi({
  url: constants.storeURL,
  consumerKey: "ck_afcabe0fb998063a7206c351ad6e5a9b0f537c5b",
  consumerSecret: "cs_cd6ac146e17e81a633d44ee89decba480a4d89e2",
  version: "wc/v3",
});

router.get('/tjanster', async (req, res, next) => {
  try {
    let response = await api.get("products", {
      per_page: 20, // 20 products per page
    })

    res.send(response.data)
  } catch (err) {
    res.status(err.response.status).send(err.response.statusText);
  }

  next()
})

router.post('/tjanster/id', async (req, res, next) => {
  try {
    let response = await api.get(`products/${req.body.productId}`)
    res.send(response.data)
  } catch (err) {
    res.status(err.response.status).send(err.response.statusText);
  }

  next()
})


router.post('/register', getNonce, async (req, res, next) => {
  if (!res.locals.username || !res.locals.displayName || !res.locals.email || !res.locals.password) {
    res.sendStatus(403)
  }
  try {
    let username = res.locals.username;
    let displayName = res.locals.displayName;
    let email = res.locals.email;
    let password = res.locals.password;
    let nonce = res.locals.nonce

    const endpoint = "api/user/register/";

    let response = await axios.get(constants.storeURL + endpoint, {
      params: {
        username: username,
        email: email,
        user_pass: password,
        nonce: nonce,
        display_name: displayName,
        insecure: "cool"
      }
    }) 

    res.send(response.data)
  } catch (err) {
    res.status(err.response.status).send(err.response.statusText)
    console.error(err)
  }

  next()
})

router.post('/login', async (req, res, next) => {
  try {
    const endpoint = "api/auth/generate_auth_cookie/";

    let response = await axios.get(constants.storeURL + endpoint, {
      params: {
        username: req.body.name,
        password: req.body.password,
        insecure: "cool"
      }
    })

    res.send(response.data)
  } catch (err) {
    res.status(err.response.status).send(err.response.statusText)
    console.error(err.response.status + " " + err.response.statusText)
  }

  next()
})

router.post('/createProduct', upload.any(), validateAuth, uploadImage, async (req, res, next) => {
  if (!req.body.title || !req.body.name || !req.body.description || !req.body.price || !req.body.customerMessage || !res.locals.imgSrcUrl) {
    res.sendStatus(403)
  } else {
    let response = await api.post("products", {
      type: "simple",
      name: req.body.title,
      description: req.body.description,
      regular_price: req.body.price,
      purchase_note: req.body.customerMessage,
      short_description: req.body.name,
      images: [
        {
          src: res.locals.imgSrcUrl
        }
      ]
    })
  
    res.sendStatus(200)

  }

  next()
})

router.post('/checkout', async (req, res, next) => {
  for (const product of req.body) {
    product.amount *= 100
  }
  
  try {
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: req.body,
          success_url: 'http://localhost:8080/success',
          cancel_url: 'http://localhost:8080/?success=false',
      });
      res.json({ sessionId: session.id })
  } catch (err) {
      console.error(err)
      res.status(500).json(err)
  }
})


module.exports = router;