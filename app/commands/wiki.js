// Variables from Configuration file
var config = require("../config.js");

var gamepediaAPI = config.gamepediaAPI;
var exileBot = config.exileBot;
var request = config.request;

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

exports.Wiki = getWikiLink;
