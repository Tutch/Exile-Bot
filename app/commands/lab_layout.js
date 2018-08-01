// Variables from Configuration file
const config = require("../config.js");

let request = config.request;
let cheerio = config.cheerio;
let exileBot = config.exileBot;

// Gets link to last Poelab layout of that difficulty
function getPoelabLink(difficulty, msg){
  let category;

  // Picks html selector based on difficulty
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
    category = "#mh_magazine_posts_large-3";
    break;
  }

  request.get('http://www.poelab.com', function(err,res,body){
    if(err){
      exileBot.sendMessage(msg.chat.id, "Something went wrong. There might be a problem with PoeLab or with me. Try again later!");
    }

    if(res.statusCode == 200 ){
      let data = res.body;
      let ch = cheerio.load(body);
      let labPage = ch(`${category}`).find('a ').attr('href');

      getPoelabLayout(labPage, msg);
    }
  });
}

//Sends image URL to chat
function getPoelabLayout(postUrl, msg){
  request.get(postUrl, function(err,res,body){
    if(err){
      exileBot.sendMessage(msg.chat.id, "Something went wrong. There might be a problem with PoeLab or with me. Try again later!");
    }

    if(res.statusCode == 200 ){
      let data = res.body;
      let ch = cheerio.load(body);
      let filter = "#main-content";
      let targetImage = ch(`${filter}`).find('img').attr('src')
     
      exileBot.sendMessage(msg.chat.id, targetImage);
    }
  });
}

exports.Lab = getPoelabLink;
