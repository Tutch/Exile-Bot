// Variables from Configuration file
var config = require("../config.js");

var request = config.request;
var cheerio = config.cheerio;
var exileBot = config.exileBot;

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
      exileBot.sendMessage(msg.chat.id, "Something went wrong. There might be a problem with PoeLab or with me. Try again later!");
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
      exileBot.sendMessage(msg.chat.id, "Something went wrong. There might be a problem with PoeLab or with me. Try again later!");
    }

    if(res.statusCode == 200 ){
      var data = res.body;
      var image = cheerio.load(body);
      var filter = ".story";

      image(`${filter} p > img`).each(function(){
        var target = image(this);
        var targetImage = target.attr("src");

        // As of 6/3/2017, PoeLab is using discord cdn to host images.
        // Telegram Bot API for NodeJs does not support https
        //exileBot.sendPhoto(msg.chat.id, targetImage);

        exileBot.sendMessage(msg.chat.id, targetImage);
      })
    }
  });

}

exports.Lab = getPoelabLink;
