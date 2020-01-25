const express = require('express');
const axios = require('axios');
const constants = require('../constants.js')

module.exports = async function (req, res, next) {
    console.log("middleware getNonce hit")

    const endpoint = "api/get_nonce/"

    let response = await axios.get(constants.storeURL + endpoint, {
      params: {
        controller: "user",
        method: "register",
      }
    })

    res.locals.nonce = response.data.nonce
    res.locals.displayName = req.body.displayName
    res.locals.username = req.body.name
    res.locals.email = req.body.email
    res.locals.password = req.body.password
    next()
}

