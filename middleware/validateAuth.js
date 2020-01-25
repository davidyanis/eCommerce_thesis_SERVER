const express = require('express');
const axios = require('axios');
const constants = require('../constants.js')

module.exports = async function (req, res, next) {
  const endpoint = "api/auth/validate_auth_cookie/"

  let response = await axios.get(constants.storeURL + endpoint, {
    params: {
      cookie: req.body.cookie,
      insecure: "cool"
    }
  })

  let valid = response.data.valid

  if (valid === false) {
    res.sendStatus(401)
  } 

  next()
}

