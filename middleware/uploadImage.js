const express = require('express');
const axios = require('axios');
const constants = require('../constants.js')

const fs = require('file-system')

module.exports = async function (req, res, next) {
  const endpoint = "wp-json/wp/v2/media";
  try {
    let response = await axios.post(constants.storeURL + endpoint, 
      fs.createReadStream(req.files[0].path), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Disposition': 'attachment; filename=' + req.files[0].originalname
      },
      auth: {
        username: 'public',
        password: 'public'
      },
    })

    res.locals.imgSrcUrl = response.data.source_url
  } catch (err) {
    console.log(err)
  }

  next()
}


