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
    T.get('https://api.twitter.com/1.1/account/verify_credentials.json', { skip_status: true })
        .catch(function (err) {
            console.log('caught error at getting credentials', err.stack);
        })
        .then(function (result) {
            let data = result.data;
            req.userInfo = {
                userName : data.screen_name,
                name : data.name,
                profileImage : data.profile_image_url,
                friendsCount : data.friends_count,
                profile_banner_url : data.profile_banner_url
            };
        });

    setTimeout(next, 1000);
};

/****************************************************************
 * Timeline functions
 ***************************************************************/

//Get home timeline and display 5 tweets
const getTimelineData = (res, req, next) => {
    T.get('https://api.twitter.com/1.1/statuses/home_timeline.json?count=5&exclude_replies')
        .catch(function (err) {
            console.log('caught error at getting timeline data', err.stack);
        })
        .then(function (result) {
            let timelineData = result.data;
            for (let i = 0; i < timelineData.length; i += 1) {
                req.tweets[i] = {
                    name: timelineData[i].user.name,
                    userName: timelineData[i].user.screen_name,
                    profilePic: timelineData[i].user.profile_image_url,
                    text: timelineData[i].text,
                    timePosted: parseTwitterDate(timelineData[i].created_at, 'short'),
                    retweetCount: timelineData[i].retweet_count,
                    favouriteCount: timelineData[i].favorite_count
                };
            }
        });
    setTimeout(next, 1000);
};



//         (err, data, res) => {
//     //store data in timelineData variable    
//     timelineData = data;
// });
// getTimelineData.done(() => {
//     //get relevent tweet data for 5 tweets only and store in tweetInfo object
// for (let i = 0; i < timelineData.length; i += 1) {
//     tweetInfo[i] = {
//         name: timelineData[i].user.name,
//         userName: timelineData[i].user.screen_name,
//         profilePic: timelineData[i].user.profile_image_url,
//         text: timelineData[i].text,
//         timePosted: parseTwitterDate(timelineData[i].created_at, 'short'),
//         retweetCount: timelineData[i].retweet_count,
//         favouriteCount: timelineData[i].favorite_count
//     };
// }
// });

// /****************************************************************
//  * Following functions
//  ***************************************************************/

// //get 5 items from following / friends list from twitter api
// const getFriendsData = T.get('https://api.twitter.com/1.1/friends/list.json?count=5', (err, data, res) => {
//     if (err) return next(err);
//     //save data
//     friendData = data.users;
// });

// //when data has been retrieved store relevant data in friendsInfo object
// getFriendsData.done(() => {
//     for (let i = 0; i < friendData.length; i += 1) {
//         friendInfo[i] = {
//             name: friendData[i].name,
//             userName: friendData[i].screen_name,
//             following: friendData[i].following,
//             profilePic: friendData[i].profile_image_url,
//         };
//     }
// });

// /****************************************************************
//  * Direct messages functions
//  ***************************************************************/

// //get 5 most recent direct messages RECEIVED from twitter api
// const getDmRecievedData = T.get('https://api.twitter.com/1.1/direct_messages.json?count=5', (err, data, res) => {
//     //save data
//     dmRecievedData = data;
// });
// //when data has been retrieved store relevant data in DMRInfo object
// getDmRecievedData.done(() => {
//     //Display error messages
//     if (dmRecievedData.errors) {
//         var error = new Error(dmRecievedData.errors.message);
//         console.error(error);
//     }
//     for (let i = 0; i < dmRecievedData.length; i += 1) {
//         DMRInfo[i] = {
//             text: dmRecievedData[i].text,
//             name: dmRecievedData[i].sender.name,
//             userName: dmRecievedData[i].sender.screen_name,
//             recipient: dmRecievedData[i].sender_id,
//             date: dmRecievedData[i].created_at,
//             timePosted: parseTwitterDate(dmRecievedData[i].sender.created_at, 'long'),
//             profilePic: dmRecievedData[i].sender.profile_image_url
//         };
//     }

//     //get 5 most recent direct messages RECEIVED from twitter api
// const getDmSentData = T.get('https://api.twitter.com/1.1/direct_messages/sent.json?count=5', (err, data, res) => {
//     //save data
//     dmSentData = data;
// });
// //when data has been retrieved store relevant data in DMRInfo object
// getDmSentData.done(() => {
//     //Display error messages
//     if (dmSentData.errors) {
//         var error = new Error(dmSentData.errors.message);
//         console.error(error);
//     } else {
//         console.log(dmSentData)
//     }
// });
//         for (let i = 0; i < dmSentData.length; i += 1) {

//             DMSInfo[i] = {
//                 text: dmSentData[i].text,
//                 name: dmSentData[i].sender.name,
//                 userName: dmSentData[i].sender.screen_name,
//                 id: dmSentData[i].sender_id,
//                 date: dmSentData[i].created_at,
//                 timePosted: parseTwitterDate(dmSentData[i].sender.created_at, 'long'),
//                 profilePic: dmSentData[i].sender.profile_image_url,
//                 recipient: dmSentData[i].recipient.id
//             };
//         }
//         (function organiseDMs() {
//             //Put all DMR DMS into one array in date / time order
//             //push all items to array
//             let concatDMs = [];
//             const recievedDMs = Object.values(DMRInfo);
//             const sentDMs = Object.values(DMSInfo);
//             concatDMs = Object.assign(recievedDMs);
//             for (let i = 0; i < sentDMs.length; i++) {
//                 concatDMs.push(sentDMs[i]);
//             }
//             //sort into date / time order
//             var byDate = concatDMs.slice(0);
//             byDate.sort(function (a, b) {
//                 var x = moment(a.date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
//                 var y = moment(b.date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
//                 return x < y ? -1 : x > y ? 1 : 0;
//             });
//             //get most recent 5 DMs
//             var leaveFive = byDate.length - 6;
//             for (let i = 0; i <= leaveFive; i++) {
//                 byDate.splice(0, 1);
//             }
//             //sort into conversations
//             //create array of single conversation then push to conversations array
//             (function sortCovos() {
//                 var arrayIndex = 0;
//                 for (let i = 0; i < byDate.length; i += 1) {
//                     let conversation = [];
//                     //get item in ordered DMs 
//                     let matchDM = byDate[i];
//                     const compareA = matchDM.recipient;
//                     //push dm into new conversation array
//                     conversation.push(matchDM);
//                     //loop through subsequent dms and if match push to array
//                     (function compareDMs() {
//                         for (var j = i += 1; j < byDate.length; j += 1) {
//                             var dmB = byDate[j];
//                             var compareB = byDate[j].recipient;
//                             if (compareA === compareB) {
//                                 conversation.push(dmB); //add matching DM to array
//                             } else {
//                                 //use recipient name as conversation key
//                                 //loop through conversation for non user DM
//                                 //if username matches user.name 
//                                 //skip
//                                 //else 
//                                 // name = username 
//                                 //return name

//                                 // {
//                                 //     name: [object, object],
//                                 // }

//                                 conversations.splice(arrayIndex, 0, conversation); //push array to conversations array
//                                 arrayIndex += 1; //next
//                                 conversation = []; //clear array
//                                 conversation.push(dmB); //start array with non matching DM
//                                 i = j; //skip already matched items 
//                                 return i;
//                             }
//                         }
//                     })();
//                     //push last conversation array into conversations array
//                     conversations.splice(1, 0, conversation);
//                     arrayIndex += 1;
//                 } return conversations;
//             })(); //end sortConvos
//             console.log(conversations)
//         })(); //end organiseDMs
//     }); //end get dmSentData.done()


// });


router.use(getUserInfo);

router.get('/', (req, res, next) => {
    res.render('index', {
        userInfo: req.userInfo,
        timelineData: req.tweets
    });
});


module.exports = router;