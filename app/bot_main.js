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
var poelabURL = "http://www.poelab.com/posts";
var gamepediaAPI = "http://pathofexile.gamepedia.com/api.php?action=opensearch&search="
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
resources - Shows a list of helpful links
unique - Retrieves information and wiki link of unique item name
wisdom - One of Izaro's many, many quotes


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
  var message = "<b>Available Commands:</b>\n/about\n/greetings\n/lab &lt;difficulty&gt;\n/unique &lt;name&gt;\n/resources\n/wisdom";

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
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

// /resources
// Outputs a list of helpful resources
exileBot.onText(/^\/resources|^\/resources@PathOfExileBot (.+)$/, function (msg, match) {
  var message = "";

  for(var i=0; i<helpful.Resources.length; i++){
    message += `<b>${helpful.Resources[i].name}</b>\n<i>${helpful.Resources[i].desc}</i>\n${helpful.Resources[i].url}\n\n`;
  }

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
});

// /unique itemName
// Check for unique item on name.
exileBot.onText(/^\/unique (.+)$|^\/unique@PathOfExileBot (.+)$/, function (msg, match) {
  var itemName = match[1];

  checkIfItemExists(itemName, msg);
});

// /wisdom
// Retuns mad wisdom from emperor Izaro, that magnificent bastard
exileBot.onText(/^\/wisdom$|^\/wisdom@PathOfExileBot$/, function (msg, match) {
  var message = izarosWisdom.Quotes[Math.floor(Math.random() * izarosWisdom.Quotes.length)];

  exileBot.sendMessage(msg.chat.id, message);
});



/*
====================================================
  METHODS THAT ACTUALLY DO SOMETHING
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

  var url = "https://pathofexile.gamepedia.com/api.php?action=parse&page=" + itemName + "&format=json";

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
      exileBot.sendMessage(msg.chat.id, wikiMessage + wikiPage).then(function(){
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

  request.get(poelabURL, function(err,res,body){
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