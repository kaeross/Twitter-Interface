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
let DMData;
const userInfo = {};
const tweetInfo = {};
const friendInfo = {};
const DMInfo = {};

const T = new Twit(oAuth);
app.use(cookieParser());

/****************************************************************
 * General functions
 ***************************************************************/

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

// Get user information and verify oAuth credentials
const getUserData = T.get('https://api.twitter.com/1.1/account/verify_credentials.json', (err, data, res) => {
    //if unsuccessful
    //show readable error message

    //store data in userData variable     
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
    //store data in timelineData variable    
    timelineData = data;
});
getTimelineData.done(() => {
    //get relevent tweet data for 5 tweets only and store in tweetInfo object
    for (let i = 0; i < timelineData.length; i += 1) {
        tweetInfo[i] = {
            name: timelineData[i].user.name,
            userName: timelineData[i].user.screen_name,
            profilePic: timelineData[i].user.profile_image_url,
            text: timelineData[i].text,
            timePosted: parseTwitterDate(timelineData[i].created_at),
            retweetCount: timelineData[i].retweet_count,
            favouriteCount: timelineData[i].favorite_count
        };
    }
});

/****************************************************************
 * Following functions
 ***************************************************************/

//get 5 items from following / friends list from twitter api
const getFriendsData = T.get('https://api.twitter.com/1.1/friends/list.json?count=5', (err, data, res) => {
    //save data
    friendData = data.users;
});
//when data has been retrieved store relevant data in friendsInfo object
getFriendsData.done(() => {
    for (let i = 0; i < friendData.length; i += 1) {
        friendInfo[i] = {
            name: friendData[i].name,
            userName: friendData[i].screen_name,
            following: friendData[i].following,
            profilePic: friendData[i].profile_image_url,
        };
    }
});

/****************************************************************
 * Direct messages functions
 ***************************************************************/

//get 5 most recent direct messages from twitter api
const getDMData = T.get('https://api.twitter.com/1.1/direct_messages.json?count=5', (err, data, res) => {
    //save data
    DMData = data;
});
//when data has been retrieved store relevant data in friendsInfo object
getDMData.done(() => {
    
    if (DMData.errors) {
        var error = new Error(DMData.errors.message);
        console.error(error);
    }
    for (let i = 0; i < DMData.length; i += 1) {
        DMInfo[i] = {
            text: DMData[i].text,
            name: DMData[i].sender.name,
            userName: DMData[i].sender.screen_name,
            timePosted: parseTwitterDate(DMData[i].sender.created_at),
            profilePic: DMData[i].sender.profile_image_url,
        };
    }
});




router.get('/', (req, res) => {
    res.render('index', { userInfo, tweetInfo, friendInfo, DMInfo });
});


module.exports = router;