const express = require('express');
const router = express.Router();
const oAuth = require('../config.js');
const Twit = require('twit');
let username = '';

const T = new Twit(oAuth);

// Test if user credetials are valid
T.get(`https://api.twitter.com/1.1/account/verify_credentials.json`, (req, res) => {
    username = res.screen_name;
    
})
console.log(username);
router.get('/', (req, res) => {
    const username = '@kateross01';
    res.render('./index',  { username }  );
    console.log(T);
});


module.exports = router;