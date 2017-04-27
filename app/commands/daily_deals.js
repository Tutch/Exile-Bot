// Variables from Configuration file
var config = require("../config.js");

var gamepediaAPI = config.gamepediaAPI;
var exileBot = config.exileBot;
var cheerio = config.cheerio;
var request = config.request;

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
      })

      responseText += `\nhttps://www.pathofexile.com/shop/category/daily-deals`;

      exileBot.sendMessage(msg.chat.id, responseText, { parse_mode: "HTML"});
    }
  });
}

exports.Deal = getDailyDeals;
