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
            return interval + ' mth';
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
            //create interface data object
            res.locals.ifData = {};
            res.locals.ifData.userInfo = {
                userName: data.screen_name,
                name: data.name,
                id: data.id,
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

const getTimelineData = (req, res, next) => {
    T.get('https://api.twitter.com/1.1/statuses/user_timeline.json?count=5')
        .catch(function (err) {
            console.log('Could not retrieve tweets', err.stack);
            next(err);
        })
        .then(function (response) {
            const tweets = [];
            const timelineData = response.data;
            res.locals.timelineData = response.data;
            if (timelineData.errors) {
                var error = new Error(timelineData.errors.message);
                console.error(error);
            }
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
                tweets.push(tweet);
                res.locals.ifData.tweets = tweets;
            }
        });
    setTimeout(next, 1000);
};

/****************************************************************
 * Following functions
 ***************************************************************/

//get 5 items from following / friends list from twitter api
const getFriendsData = (req, res, next) => {
    T.get('https://api.twitter.com/1.1/friends/list.json?count=5')
        .catch(function (err) {
            console.log('There was a problem retrieving friend data', err.stack);
            next(err);
        })
        .then(function (response) {
            const friendInfo = [];
            const friendData = response.data.users;
            if (friendData != 'undefined' && friendData.errors) {
                var error = new Error(friendData.errors.message);
                console.error(error);
            }
            for (let i = 0; i < friendData.length; i += 1) {
                const friend = {
                    name: friendData[i].name,
                    userName: friendData[i].screen_name,
                    following: friendData[i].following,
                    profilePic: friendData[i].profile_image_url,
                };
                friendInfo.push(friend);
                res.locals.ifData.friendInfo = friendInfo;
            }
        });
    setTimeout(next, 1000);
};

/****************************************************************
 * Direct messages functions
 ***************************************************************/

//get 5 most recent direct messages RECEIVED from twitter api
const getDmRecievedData = (req, res, next) => {
    T.get('https://api.twitter.com/1.1/direct_messages.json?count=5')
        .catch(function (err) {
            console.log('There was a problem retrieving recieved DMS', err.stack);
            next(err);
        })
        .then(function (response) {
            const dmRecievedData = response.data;
            if (dmRecievedData.errors) {
                var error = new Error(dmRecievedData.errors.message);
                console.error(error);
            }
            res.locals.DMRInfo = [];
            //when data has been retrieved store relevant data in DMRInfo object
            for (let i = 0; i < dmRecievedData.length; i += 1) {
                res.locals.DMRInfo[i] = {
                    text: dmRecievedData[i].text,
                    name: dmRecievedData[i].sender.name,
                    userName: dmRecievedData[i].sender.screen_name,
                    recipient: dmRecievedData[i].sender_id,
                    date: dmRecievedData[i].created_at,
                    timePosted: parseTwitterDate(dmRecievedData[i].sender.created_at, 'long'),
                    profilePic: dmRecievedData[i].sender.profile_image_url
                };
            }
        });
    setTimeout(next, 1000);
};

//get 5 most recent direct messages SENT from twitter api
const getDmSentData = (req, res, next) => {
    T.get('https://api.twitter.com/1.1/direct_messages/sent.json?count=5')
        .catch(function (err) {
            console.log('There was a problem retrieving sent DMs', err.stack);
            next(err);
        })
        .then(function (response) {
            const dmSentData = response.data;
            if (dmSentData.errors) {
                var error = new Error(dmSentData.errors.message);
                console.error(error);
            }
            res.locals.DMSInfo = [];
            for (let i = 0; i < dmSentData.length; i += 1) {
                res.locals.DMSInfo[i] = {
                    text: dmSentData[i].text,
                    name: dmSentData[i].sender.name,
                    userName: dmSentData[i].sender.screen_name,
                    id: dmSentData[i].sender_id,
                    date: dmSentData[i].created_at,
                    timePosted: parseTwitterDate(dmSentData[i].sender.created_at, 'long'),
                    profilePic: dmSentData[i].sender.profile_image_url,
                    recipient: dmSentData[i].recipient.id
                };
            }
        });
    setTimeout(next, 1000);
};

const organiseDMs = (req, res, next) => {
    const conversations = [];
    //Put all direct messages into one array in date / time order
    //push all items to array
    let concatDMs = [];
    const recievedDMs = res.locals.DMRInfo;
    const sentDMs = res.locals.DMSInfo;
    // concatDMs = Object.assign(recievedDMs);
    for (let i = 0; i < recievedDMs.length; i++) {
        concatDMs.push(recievedDMs[i]);
    }
    for (let i = 0; i < sentDMs.length; i++) {
        concatDMs.push(sentDMs[i]);
    }
    //sort into date / time order
    var byDate = concatDMs.slice(0);
    byDate.sort(function (a, b) {
        var x = moment(a.date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
        var y = moment(b.date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
        return x < y ? -1 : x > y ? 1 : 0;
    });
    //get most recent 5 DMs
    var leaveFive = byDate.length - 6;
    for (let i = 0; i <= leaveFive; i++) {
        byDate.splice(0, 1);
    }
    //sort into conversations
    //create array of single conversation then push to conversations array
    (function sortCovos() {
        var arrayIndex = 0;
        for (let i = 0; i < byDate.length; i += 1) {
            let conversation = [];
            //get item in ordered DMs 
            let matchDM = byDate[i];
            const compareA = matchDM.recipient;
            //push dm into new conversation array
            conversation.push(matchDM);
            //loop through subsequent dms and if match push to array
            (function compareDMs() {
                for (var j = i += 1; j < byDate.length; j += 1) {
                    var dmB = byDate[j];
                    var compareB = byDate[j].recipient;
                    if (compareA === compareB) {
                        conversation.push(dmB); //add matching DM to array
                    } else {
                        conversations.splice(arrayIndex, 0, conversation); //push array to conversations array
                        arrayIndex += 1; //next
                        conversation = []; //clear array
                        conversation.push(dmB); //start array with non matching DM
                        i = j; //skip already matched items 
                        return i;
                    }
                }
            })();
            //push last conversation array into conversations array
            conversations.splice(1, 0, conversation);
            arrayIndex += 1;
        }
    })(); //end sortConvos
    res.locals.ifData.conversations = conversations;
    setTimeout(next, 1000);
};

router.use(getUserInfo, getTimelineData, getFriendsData, getDmRecievedData, getDmSentData, organiseDMs);

router.get('/', (req, res) => {
    const ifData = res.locals.ifData;
    console.log(ifData);
    res.render('index', { ifData });
});


module.exports = router;