// Modules
var request = require('request');
var fs = require("fs");
var path = require("path");
var util = require("util");
var htmlparser = require("htmlparser2");
var cheerio = require("cheerio");

// Helper files
var izarosWisdom = require("./izarosWisdom");
var mastersGreets = require("./greetings");
var helpful = require("./helpfulResources");

// Necessary variables
var gamepediaAPI = "http://pathofexile.gamepedia.com/api.php?action=opensearch&search=";
var botToken = "//YOUR BOT TOKEN";
var Bot = require('node-telegram-bot-api'),
    exileBot = new Bot(botToken, {polling:true});

    // This bot is using webhook. You might try polling to test.
    exileBot.setWebHook('somedomain' + exileBot.token);

exports.Bot = exileBot;

/*
====================================================
  BOT COMMANDS
====================================================

about - Information about the bot
greetings - Replies with one of the masters's greetings
help - Shows a list of commands
lab - Retrieves last lab layout for given difficulty from Poelab
ladder - Shows a list of top 10 players for given league
onsale - Shows a list of items on sale
resources - Shows a list of helpful links
safelevels - Level range with no penalty
unique - Retrieves information and wiki link of unique item name
wisdom - One of Izaro's many, many quotes
wiki - Returns closest matching wiki link for given term


*/

// /about
// Information about the bot
exileBot.onText(/^\/about|^\/about@PathOfExileBot$/, function (msg, match) {
  var message = "<b>About ExileBot:</b>\nBlip blop may the goddess of justice watch over you.\n\nIf you want to request a feature or report a nasty bug, shoot an email to my creator at lucasmapurunga@gmail.com.\n\nMy code is on https://github.com/Tutch/Exile-Bot.";

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
});

// /greetings
// Replies with one of the masters' greetings
exileBot.onText(/^\/greetings|^\/greetings@PathOfExileBot$/, function (msg, match) {
  var message = mastersGreets.Hi[Math.floor(Math.random() * mastersGreets.Hi.length)];

  var options = {
    reply_to_message_id: msg.message_id
  };

  exileBot.sendMessage(msg.chat.id, message, options);
});

// /help
// Shows bot help
exileBot.onText(/^\/help|^\/exilehelp@PathOfExileBot (.+)$/, function (msg, match) {
  var message = "<b>Available Commands:</b>\n/about\n/greetings\n/lab &lt;difficulty&gt;\n/ladder &lt;league&gt;\n/onsale\n/resources\n/safelevels &lt;levels&gt;\n/unique &lt;name&gt;\n/wiki &lt;term&gt;\n/wisdom";

  exileBot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
});

// /lab difficulty
// Shows bot help
exileBot.onText(/^\/lab (.+)|^\/lab@PathOfExileBot (.+)$/, function (msg, match) {
  var difficulty = match[1];

  if (['normal', 'cruel', 'merciless', 'uber'].indexOf(difficulty) >= 0) {
    exileBot.sendMessage(msg.chat.id, "I'm fetching today's layout for you.\nPlease wait a little bit, this can take a while.");
    getPoelabLink(difficulty, msg);
  }else{
    exileBot.sendMessage(msg.chat.id, "Usage: /lab <normal><cruel><merciless><uber>");
  }

});

// /ladder league
// Shows top 10 players on league
exileBot.onText(/^\/ladder (.+)|^\/ladder@PathOfExileBot (.+)$/, function (msg, match) {
  var ladderId = match[1];

  getLadder(ladderId, msg);
});

// /onsale
// List of discounted items
exileBot.onText(/^\/onsale|^\/onsale@PathOfExileBot (.+)$/, function (msg, match) {
  getDailyDeals(msg);
});

// /resources
// Outputs a list of helpful resources
exileBot.onText(/^\/resources|^\/resources@PathOfExileBot (.+)$/, function (msg, match) {
  var message = "";

  for(var i=0; i<helpful.Resources.length; i++){
    message += `<b>${helpful.Resources[i].name}</b>\n<i>${helpful.Resources[i].desc}</i>\n${helpful.Resources[i].url}\n\n`;
  }

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
});

// /safelevels level
// Gives safe leveling range for level
exileBot.onText(/^\/safelevels (.+)$|^\/safelevels@PathOfExileBot (.+)$/, function (msg, match) {
  var level = match[1];

  getOptimalLevel(level, msg);
});

// /unique itemName
// Check for unique item on name.
exileBot.onText(/^\/unique (.+)$|^\/unique@PathOfExileBot (.+)$/, function (msg, match) {
  var itemName = match[1];

  checkIfItemExists(itemName, msg);
});

// /wiki term
// Check for unique item on name.
exileBot.onText(/^\/wiki (.+)$|^\/wiki@PathOfExileBot (.+)$/, function (msg, match) {
  var searchTerm = match[1];

  getWikiLink(searchTerm, msg);
});

// /wisdom
// Retuns mad wisdom from emperor Izaro, that magnificent bastard
exileBot.onText(/^\/wisdom$|^\/wisdom@PathOfExileBot$/, function (msg, match) {
  var message = izarosWisdom.Quotes[Math.floor(Math.random() * izarosWisdom.Quotes.length)];

  exileBot.sendMessage(msg.chat.id, message);
});


/*
====================================================
  REACTIONS TO CHAT
====================================================
*/

// If the user say stuff like "thanks, exile bot!"
exileBot.onText(/^thanks.*exile.*|^thank you.*exile.*/, function (msg, match) {
    exileBot.sendMessage(msg.chat.id, `You are welcome, exile.`);
});

/*
====================================================
  COMMAND IMPLEMENTATION
====================================================
*/

// Checks if this unique item exists on Path of Exile wiki
function checkIfItemExists(itemName, msg){
  request.get(gamepediaAPI+itemName, function(err,res,body){
    if(err){
      console.log("Something went very, very wrong.");
      exileBot.sendMessage(msg.chat.id, "I'm sorry, but something went wrong when fetching your item. Try again, maybe?");
    }
    if(res.statusCode == 200 ){
      var data = JSON.parse(res.body);

      if(data[1].length === 0){
        console.log("No item found.");
        exileBot.sendMessage(msg.chat.id, "I couldn't find it. Are you sure the item name is correct?");
      }else{

        var itemName;
        var url;
        var multipleOcurrences = false;

        console.log(data);

        // Checks if there are more than ony of that item.
        // Vessel of Vinktar is infamous for that. Thanks, GGG.
        // What do? I choose to inform the user and let him decide.
        // Trying with greater than two to see if solves for items like
        // The Scourge unique claw. Freaking talisman league fml.
        if(data[1].length == 2){
          itemName = data[1][0].toString();
          url = data[3][0].toString();

        }else if(data[1].length > 2){
          itemName = data[1][1].toString();
          url = data[3][1].toString();

          multipleOcurrences = true;
        }else{
           itemName = data[1].toString();
           url = data[3].toString();
        }

        getUniqueItem(itemName, url, msg, multipleOcurrences)
      }

    }
  });
}

// Retrieves item info. Sends image to user.
// It's quite low quality and takes a while to load.
// TODO: calculate box size before generating image!
// This was deemed too slow to be used, but it might be useful
// for someone, for some reason.
function getUniqueItemImage(itemName, wikiPage, msg){

    // I was having isseus with the window size. Yes, this is a workaround. No, this ain't pretty.
    var options = {
      siteType: 'url',
      windowSize: { width: 1024, height: 920 },
      shotSize: { width: 800, height: 920 },
      shotOffset: {left: 709, right:470, top: 326, bottom: 448},
      streamType: 'jpg',
      quality: 100
    }

    var name = itemName + '__' + msg.chat.id + '.jpg';

    webshot(wikiPage, name, options, function(err) {
      exileBot.sendPhoto(msg.chat.id, name).then(function(){
         fs.unlink(name, function(e){
         })
      });

    });

}


// Retrieves item info. Sends image to user.
function getUniqueItem(itemName, wikiPage, msg, multipleOcurrences){

  var url = `https://pathofexile.gamepedia.com/api.php?action=parse&page=${itemName}&format=json`;

  request.get(url, function(err,res,body){
    if(err){
      console.log("Something went very, very wrong.");
      exileBot.sendMessage(msg.chat.id, "I'm sorry, but something went wrong when fetching your item. Try again, maybe?");
    }

    if(res.statusCode == 200 ){
      var data = JSON.parse(res.body);
      var filter = '/></a></span></span>';
      var uniqueFilter = '<span class=\\"infobox-page-container\\"><span class=\\"item-box -unique\\">';
      var dom = data.parse.text["*"];
      var begin = dom.search(filter);
      dom = dom.substring(0,begin + filter.length);

      // Searches to see if the infobox has the -unique class.
      // If it doesn't, the item isn't unique, so...
      var isUnique = dom.search(uniqueFilter);

      if(isUnique < 0){
        exileBot.sendMessage(msg.chat.id, "The item you searched for isn't Unique.");
        return;
      }


      var output = "";
      var currentAtt = "";

      // Parse HTML to search for tags
      var parser = new htmlparser.Parser({
          onopentag: function(name, attribs){
              currentAtt = attribs.class;

              // Checking some specific html tags
              if(name === "span" && attribs.class === "group"){
                output += "\n";
              }

              if(name === "br"){
                output += "\n";
              }

              // Formatting for some classes...
              switch(attribs.class){
                case "header -double":
                output += "<b>";
                break;

                case "group -textwrap tc -flavour":
                output += "\n\n<i>";
                break;

                case "header -double":
                output += "\n";
                break;

                case "group -textwrap tc -mod":
                output += "\n";
                break;

                case "group -textwrap tc -help":
                output += "\n( ";
                break;
              }

          },
          ontext: function(text){

              if(currentAtt === "group"){
                output += "\n\n";
              }

              output += text;

              // Closing bold for the item name
              if(currentAtt === "header -double"){
                output += "</b>";
              }

              if(currentAtt === "group -textwrap tc -help"){
                output += " )";
              }


          },
          onclosetag: function(tagname){
              if(tagname === "span"){
                output += "\n";
              }

          }
      }, {decodeEntities: true});
      parser.write(dom);
      parser.end();

      output += "</i>";
      //console.log(output);

      var wikiMessage = "";

      if(multipleOcurrences){
        wikiMessage = "There is more than one version of the item you are searching for.\n" +
        "This is one of them, but you should check wiki for others.\n\n"
      }

      // Sends wiki link back to chat
      exileBot.sendMessage(msg.chat.id, `${wikiMessage}${wikiPage}`).then(function(){
        // Sends formatted item info back to chat
        exileBot.sendMessage(msg.chat.id, output , { parse_mode: "HTML" });
      });

    }
  });
}


// Gets link to last Poelab layout of that difficulty
function getPoelabLink(difficulty, msg){
  var category;

  // Picks class for right difficulty
  switch(difficulty){
    case "normal":
    category = ".category-normal-layouts";
    break;

    case "cruel":
    category = ".category-cruel-layouts";
    break;

    case "merciless":
    category = ".category-merciless-layouts";
    break;

    case "uber":
    category = ".category-uber-layouts";
    break;
  }

  request.get('http://www.poelab.com/posts', function(err,res,body){
    if(err){

    }

    if(res.statusCode == 200 ){
      var data = res.body;
      var poelab = cheerio.load(body);

      var firstResult = poelab(`${category} > a`).first();

      var link = poelab(firstResult);
      var text = link.text();
      var href = link.attr("href");

      getPoelabLayout(href, msg);
    }
  });

}

//Sends image to chat
function getPoelabLayout(postUrl, msg){

  request.get(postUrl, function(err,res,body){
    if(err){
      // oops
    }

    if(res.statusCode == 200 ){
      var data = res.body;
      var image = cheerio.load(body);
      var filter = ".story";

      image(`${filter} a`).each(function(){
        var target = image(this);
        var targetImage = target.attr("href");

        exileBot.sendPhoto(msg.chat.id, targetImage);
      })
    }
  });

}

// Gets url on wiki for given searh term
function getWikiLink(searchTerm, msg){
  request.get(gamepediaAPI+searchTerm, function(err,res,body){
    if(err){
      console.log("Something went very, very wrong.");
      exileBot.sendMessage(msg.chat.id, "I'm sorry, but something went wrong when fetching your link. Try again, maybe?");
    }
    if(res.statusCode == 200 ){
      var data = JSON.parse(res.body);

      if(data[1].length === 0){
        console.log("No item found.");
        exileBot.sendMessage(msg.chat.id, `I couldn't find anything about ${searchTerm}`);
      }else{

        var url;
        var extraMessage = "";

        // Checks if there are more than ony of that term
        if(data[1].length > 1){
          url = data[3][0].toString();
          extraMessage = "There are multiple pages refering to your search term. This is the closest to what you were looking for: ";
        }else{
           url = data[3].toString();
        }

        exileBot.sendMessage(msg.chat.id, `${extraMessage}${url}`);

      }

    }
  });
}

// Return items on sale
function getDailyDeals(msg){
  request.get('https://www.pathofexile.com/shop/category/daily-deals', function(err,res,body){
    if(err){
      exileBot.sendMessage(msg.chat.id, "Something went wrong while accessing the shop");
    }
    if(res.statusCode == 200 ){
      var data = res.body;
      var ch = cheerio.load(body);
      var filter = ".shopItemBase";

      var responseText = "";

      ch(`${filter}`).each(function(){
        var target = ch(this);
        var itemName = target.find('a.name').text();
        var itemPrice = target.find('div.price').text();

        responseText += `<b>${itemName}</b> is on sale for ${itemPrice} points\n`

        console.log(responseText);
      })

      responseText += `\nhttps://www.pathofexile.com/shop/category/daily-deals`;

      exileBot.sendMessage(msg.chat.id, responseText, { parse_mode: "HTML"});
    }
  });
}

// Returns experience range
// TODO: map tier calculation, maybe?
function getOptimalLevel(level, msg){

  var level;

  if( level = parseInt(level)|| level > 0 || level < 101){

    var safeZone = 3 + Math.floor(parseInt(level)/16);
    var responseText = "";
    var minLevel = (level - safeZone < 2) ? 1 : level - safeZone;
    var maxLevel = (level + safeZone > 100) ? 100 : level + safeZone;
    //var minTier = (minLevel - 68 > 0) ? minLevel - 68 + 1 : 1;
    //var maxTier = (maxLevel - 84 > 16) ? maxLevel - 84 + 1 : 1;
    //  var tiers = maxLevel - level + level - minTier + 1;

    responseText = `At level <b>${level}</b>, you receive no experience penalty from areas level ${minLevel} to ${maxLevel}.\n\n`;
    responseText += "<i>Reminder: maps go from Tier 1 (68) to Tier 16 (83). Shaper's Realm is area level 84.</i>";

    exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
  }else{
    exileBot.sendMessage(msg.chat.id, "Invalid level");
  }

}

// Gets top 10 for some given league
function getLadder(ladderId, msg){
  // Get league list, first of all
  getLeagueList(function(leagueNames){

    // Messy ES2015 check to see if ladderId is a valid league
    if (leagueNames.findIndex(item => ladderId.toLowerCase() === item.toLowerCase()) < 0) {
      var responseText = "<b>Those are valid leagues: </b>\n";

      leagueNames.forEach(name => {
        responseText += `${name}\n`;
      });

      exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
      return;
    }else{
      // Get top 10
      request.get(`http://api.pathofexile.com/ladders/${ladderId}?limit=10`, function(err,res,body){
        if(err){
          exileBot.sendMessage(msg.chat.id, "Something went wrong while accessing the ladder you wanted.");
        }

        if(res.statusCode == 200 ){
          var data = JSON.parse(res.body);

          var responseText = `<b>Showing top 10 players in ${ladderId} league:</b>\n`;
          var char = {};

          data.entries.forEach(ladderEntry => {
            char = ladderEntry.character;

            responseText += `<b>${ladderEntry.rank}.</b> ${char.name}(${ladderEntry.account.challenges.total}) - lvl ${char.level} ${char.class}\n`;
          });

          exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
        }

      });
    } //else

  });
}

// Returns main league names
function getLeagueList(callback){
  request.get('http://api.pathofexile.com/leagues?type=main', function(err,res,body){
    if(err){
      return [];
    }

    if(res.statusCode == 200 ){
      var data = JSON.parse(res.body);
      var leagueNames = [];

      data.forEach(league => {
        leagueNames.push(league.id);
      });

      if (typeof callback === "function") {
        callback(leagueNames);
      }

    }
  });
}
