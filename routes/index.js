/****************************************************************
 * Required modules
 ***************************************************************/

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const router = express.Router();
const oAuth = require('../config.js');
const Twit = require('twit');
const moment = require('moment');

/****************************************************************
 * Global variables
 ***************************************************************/

let userData;
let timelineData;
let friendData;
const userInfo = {};
const tweetInfo = {};
const friendInfo = {};

const T = new Twit(oAuth);
app.use(cookieParser());

/****************************************************************
 * General functions
 ***************************************************************/

// Get user information
const getUserData = T.get('https://api.twitter.com/1.1/account/verify_credentials.json', (err, data, res) => {
    userData = data;
});
getUserData.done(() => {
    userInfo.username = userData.screen_name;
    userInfo.profilePic = userData.profile_image_url;
    userInfo.backgroundImg = userData.profile_background_image_url;
    userInfo.friendsCount = userData.friends_count;
});

/****************************************************************
 * Timeline functions
 ***************************************************************/

//Get home timeline and display 5 tweets
const getTimelineData = T.get('https://api.twitter.com/1.1/statuses/home_timeline.json?count=5&exclude_replies', (err, data, res) => {
    timelineData = data;
});
getTimelineData.done(() => {
    //Function to format twitter timestamp
    function parseTwitterDate(tDate) {
        //use moment package to parse twitter date
        const system_date = moment(tDate, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
        const user_date = new Date();
        //format dateTime
        var diff = Math.floor((user_date - system_date) / 1000);
        if (diff <= 1) { return 'just now'; }
        if (diff < 60) { return diff + 's'; }
        if (diff <= 90) { return '1m'; }
        if (diff <= 3540) { return Math.round(diff / 60) + 'm'; }
        if (diff <= 5400) { return '1 hour ago'; }
        if (diff <= 86400) { return Math.round(diff / 3600) + 'h'; }
        if (diff <= 129600) { return '1 day ago'; }
        if (diff < 604800) { return Math.round(diff / 86400) + 'd'; }
        if (diff <= 777600) { return '1w'; }
        return 'on ' + system_date;
    }
    //get relevent tweet data for 5 tweets only and store in tweetInfo object
    for (let i = 0; i < timelineData.length; i += 1) {
        tweetInfo[i] = {
            name: timelineData[i].user.name,
            userName: timelineData[i].user.screen_name,
            profilePic: timelineData[i].user.profile_image_url,
            text: timelineData[i].text,
            timePosted: parseTwitterDate(timelineData[i].created_at)
            // Number of retweets
            // Likes
        };
    }
});

/****************************************************************
 * Following functions
 ***************************************************************/
const getFriendsData = T.get('https://api.twitter.com/1.1/friends/list.json?count=5', (err, data, res) => {
    friendData = data.users;
});
getFriendsData.done(() => {
    for (let i = 0; i < friendData.length; i += 1) {
        friendInfo[i] = {
            name : friendData[i].name,
            userName : friendData[i].screen_name,
            following : friendData[i].following,
            profilePic : friendData[i].profile_image_url,
        };
    }
});

/****************************************************************
 * Direct messages functions
 ***************************************************************/





router.get('/', (req, res) => {
    res.render('index', { userInfo, tweetInfo, friendInfo });
});


module.exports = router;