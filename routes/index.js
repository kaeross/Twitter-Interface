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
let dmRecievedData;
let dmSentData;
const userInfo = {};
const tweetInfo = {};
const friendInfo = {};
const DMRInfo = {};
const DMSInfo = {};
const DMArray = [];
const T = new Twit(oAuth);

/****************************************************************
 * Prototypes
 ***************************************************************/
// function DM(text, name, userName, id, date, timePosted, profilePic, recipient) {
//     this.text = text;
//     this.name = name;
//     this.userName = userName;
//     this.id = id;
//     this.date = date;
//     this.timePosted = parseTwitterDate(timePosted, 'long');
//     this.profilePic = profilePic;
//     this.recipient = recipient;
// }

function DM(dataSource) {
    this.text = dataSource.text;
    this.name = dataSource.sender.name;
    this.userName = dataSource.sender.screen_name;
    this.id = dataSource.sender_id;
    this.date = dataSource.sender.created_at;
    this.timePosted = parseTwitterDate(dataSource.sender.created_at, 'long');
    this.profilePic = dataSource.sender.profile_image_url;
    this.recipient = dataSource.recipient.id;
}

DM.prototype.add = function() {
    DMArray.push(this);
}

/****************************************************************
 * General functions
 ***************************************************************/

//Function to format twitter timestamp
//shortOrLong - use param 'short' for mobile friendly shortened version or 'long' for extended version
function parseTwitterDate(tDate, shortOrLong) {
    //use moment package to parse twitter date
    const date = moment(tDate, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
    const seconds = Math.floor((new Date() - date) / 1000);

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
    userInfo.id = userData.id;
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
            timePosted: parseTwitterDate(timelineData[i].created_at, 'short'),
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

//get 5 most recent direct messages RECEIVED from twitter api
const getDmRecievedData = T.get('https://api.twitter.com/1.1/direct_messages.json?count=5', (err, data, res) => {
    //save data
    dmRecievedData = data;
});
//when data has been retrieved store relevant data in DMRInfo object
getDmRecievedData.done(() => {
    //Display error messages
    if (dmRecievedData.errors) {
        var error = new Error(dmRecievedData.errors.message);
        console.error(error);
    }
    for (let i = 0; i < dmRecievedData.length; i += 1) {
        // var getNewDM = new DM(dmRecievedData[i]);
        // getNewDM.add();
        DMRInfo[i] = {
            text: dmRecievedData[i].text,
            name: dmRecievedData[i].sender.name,
            userName: dmRecievedData[i].sender.screen_name,
            id: dmRecievedData[i].sender_id,
            date: dmRecievedData[i].sender.created_at,
            timePosted: parseTwitterDate(dmRecievedData[i].sender.created_at, 'long'),
            profilePic: dmRecievedData[i].sender.profile_image_url,
            recipient: dmRecievedData[i].recipient.id
        };
    }

    //get 5 most recent direct messages RECEIVED from twitter api
    const getDmSentData = T.get('https://api.twitter.com/1.1/direct_messages/sent.json?count=5', (err, data, res) => {
        //save data
        dmSentData = data;
    });
    //when data has been retrieved store relevant data in DMRInfo object
    getDmSentData.done(() => {
        //Display error messages
        if (dmSentData.errors) {
            var error = new Error(dmSentData.errors.message);
            console.error(error);
        }
        for (let i = 0; i < dmSentData.length; i += 1) {
            // var getNewDM = new DM(dmSentData[i]);
            // getNewDM.add();
            
            DMSInfo[i] = {
                text: dmSentData[i].text,
                name: dmSentData[i].sender.name,
                userName: dmSentData[i].sender.screen_name,
                id: dmSentData[i].sender_id,
                date: dmSentData[i].sender.created_at,
                timePosted: parseTwitterDate(dmSentData[i].sender.created_at, 'long'),
                profilePic: dmSentData[i].sender.profile_image_url,
                recipient: dmSentData[i].recipient.id
            };
        }
        //Put all DMR DMS into one array in date / time order
        //push all items to array
        const recievedDMs = Object.values(DMRInfo);
        const sentDMs = Object.values(DMSInfo);
        var dateOrderedDMs = Object.assign(recievedDMs);
        for(let i = 0; i < sentDMs.length; i++) {
            dateOrderedDMs.push(sentDMs[i]);
        };
        console.log(dateOrderedDMs);
        // console.log(recievedDMs);
        // console.log(sentDMs);
        //sort into date / time order
        (function(){
            if (typeof Object.defineProperty === 'function'){
              try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
            }
            if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;
          
            function sb(f){
              for (var i=this.length;i;){
                var o = this[--i];
                this[i] = [].concat(f.call(o,o,i),o);
              }
              this.sort(function(a,b){
                for (var i=0,len=a.length;i<len;++i){
                  if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
                }
                return 0;
              });
              for (var i=this.length;i;){
                this[--i]=this[i][this[i].length-1];
              }
              return this;
            }
          })();
        //dateOrderedDMs.sortBy((o)=>{return new Date( o.date ) });


        const conversations = [];
        //function to create threads of conversatio
        const createThreads = () => {
            var firstRecipient = DMRInfo[1].recipient;
            var sender = DMSInfo[1].id;
            var firstConvo = DMRInfo[1];
            var senderConvo = DMSInfo[1];
            // If sender in dmR is equal to recipient in DMS


            //loop check each DMS and DMI against first DM then plus 1
            if (firstRecipient === sender) {
                conversations
                conversations.splice(0, 0, firstConvo, senderConvo);
                console.log(conversations);
            } else {
                console.log(false);
            }
        };
    });
    //create new conversation object
    //push dm to conversation in order of timePosted

});







router.get('/', (req, res) => {
    res.render('index', { userInfo, tweetInfo, friendInfo, DMRInfo });
});


module.exports = router;