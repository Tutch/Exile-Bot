'use strict';

// Variables from Configuration file
const config = require("../config.js");
const gamepediaAPI = config.gamepediaAPI;
const exileBot = config.exileBot;
const cheerio = config.cheerio;
const request = config.request;

// Return items on sale
function getDailyDeals(msg){
  request.get('https://www.pathofexile.com/shop/category/daily-deals', function(err,res,body){
    if(err){
      exileBot.sendMessage(msg.chat.id, "Something went wrong while accessing the shop");
    }
    if(res.statusCode == 200 ){
      let data = res.body;
      let ch = cheerio.load(body);
      let filter = ".shopItemBase";

      let responseText = "";

      ch(`${filter}`).each(function(){
        let target = ch(this);
        let itemName = target.find('a.name').text();
        let itemPrice = target.find('div.price').text();

        responseText += `<b>${itemName}</b> is on sale for ${itemPrice} points\n`
      })

      responseText += `\nhttps://www.pathofexile.com/shop/category/daily-deals`;

      exileBot.sendMessage(msg.chat.id, responseText, { parse_mode: "HTML"});
    }
  });
}

exports.Deal = getDailyDeals;
