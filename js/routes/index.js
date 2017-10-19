/****************************************************************
 * Required modules
 ***************************************************************/

const express = require('express');
const app = express();
const router = express.Router();
const oAuth = require('../../config.js');
const Twit = require('twit');
const moment = require('moment');

/****************************************************************
 * Global variables
 ***************************************************************/

const T = new Twit(oAuth);
const ifData = {};
    ifData.userInfo = {};
    ifData.tweets = [];
    ifData.friendInfo = [];

/****************************************************************
 * General functions
 ***************************************************************/

//Function to format twitter timestamp
function parseTwitterDate(tDate, shortOrLong) {
    //use moment package to parse twitter date
    const date = moment(tDate, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
    const seconds = Math.floor((new Date() - date) / 1000);
    //shortOrLong - use param 'short' for mobile friendly shortened version or 'long' for extended version

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        if (shortOrLong === 'long') {
            return interval + ' years ago';
        } else {
            return interval + 'y';
        }
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        if (shortOrLong === 'long') {
            return interval + ' months ago';
        } else {
            return interval + 'm';
        }
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        if (shortOrLong === 'long') {
            return interval + ' days ago';
        } else {
            return interval + 'd';
        }
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        if (shortOrLong === 'long') {
            return interval + ' hours ago';
        } else {
            return interval + 'h';
        }
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        if (shortOrLong === 'long') {
            return interval + ' minutes ago';
        } else {
            return interval + 'm';
        }
    }
    if (shortOrLong === 'long') {
        return interval + ' seconds ago';
    } else {
        return interval + 's';
    }

}


/****************************************************************
 * Router
 ***************************************************************/


// Get user information and verify oAuth credentials
const getUserInfo = (req, res, next) => {
    T.get('https://api.twitter.com/1.1/account/verify_credentials.json')
        .catch(function (err) {
            console.log('Could not verify credentials', err.stack);
            next(err);
        })
        .then(function (response) {
            let data = response.data;
            ifData.userInfo = {
                userName: data.screen_name,
                name: data.name,
                profileImage: data.profile_image_url,
                friendsCount: data.friends_count,
                profile_banner_url: data.profile_banner_url
            };
        });
    setTimeout(next, 1000);
};



/****************************************************************
 * Timeline functions
 ***************************************************************/

const getTimelineData = (res, req, next) => {
    T.get('https://api.twitter.com/1.1/statuses/home_timeline.json?count=5&exclude_replies')
        .catch(function (err) {
            console.log('Could not retrieve friend data', err.stack);
            next(err);
        })
        .then(function(response) {
            const timelineData = response.data;
            for (let i = 0; i < timelineData.length; i += 1) {
                const tweet = {
                    name: timelineData[i].user.name,
                    userName: timelineData[i].user.screen_name,
                    profilePic: timelineData[i].user.profile_image_url,
                    text: timelineData[i].text,
                    timePosted: parseTwitterDate(timelineData[i].created_at, 'short'),
                    retweetCount: timelineData[i].retweet_count,
                    favouriteCount: timelineData[i].favorite_count
                };
                ifData.tweets.push(tweet);
            }
        });
    setTimeout(next, 1000);
};

/****************************************************************
 * Following functions
 ***************************************************************/

//get 5 items from following / friends list from twitter api
const getFriendsData = (res, req, next) => {
    T.get('https://api.twitter.com/1.1/friends/list.json?count=5')
        .catch(function (err) {
            console.log('There was a problem retrieving friend data', err.stack);
            next(err);
        })
        .then(function (response) {
            const friendData = response.data.users;
            for (let i = 0; i < friendData.length; i += 1) {
                const friend = {
                    name: friendData[i].name,
                    userName: friendData[i].screen_name,
                    following: friendData[i].following,
                    profilePic: friendData[i].profile_image_url,
                };
                ifData.friendInfo.push(friend);
            }
        });
    setTimeout(next, 1000);
};

router.use(getUserInfo, getTimelineData, getFriendsData);

router.get('/', (req, res) => {
    console.log(ifData);
    res.render('index', { ifData });
});


module.exports = router;