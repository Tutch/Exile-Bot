// Variables from Configuration file
var config = require("../config.js");

var gamepediaAPI = config.gamepediaAPI;
var exileBot = config.exileBot;
let cheerio = config.cheerio;
var request = config.request;

// Extracts text content from the wiki article
function extractWikiText(searchTerm, msg) {
  getWikiLink(searchTerm).then((url, multiple) => {
    exileBot.sendMessage(msg.chat.id, url);

    request.get(url, function(err,res,body){
      if(err){
        exileBot.sendMessage(msg.chat.id, "I'm sorry, but something went wrong when fetching your item. Try again, maybe?");
      }
      
      let data = res.body;
      let ch = cheerio.load(body);
      let children = ch('#mw-content-text').children();
      
      let allowedTags = ['span','h2','p','ul'];
      let forbiddenClasses = ['infobox-page-container'];
      let topicFilter = [
        'Threshold jewels',
        'Gem level progression',
        'Microtransactions',
        'Version history',
        'Alternate artwork',
        'Gallery',
        'Alt Art']
      let output = `<i>-- This is a stripped down version of the wiki page --</i>\n\n`;

      children.each(function(index,elem) {
        let chElem = ch(elem);
        let tagName = chElem[0].tagName;
        let className = chElem.attr('class');
        
        if(allowedTags.includes(tagName) && 
           !forbiddenClasses.includes(className)) {
            
            chElem.find('.c-item-hoverbox__display').remove();
            let text = chElem.text().trim();
          
            if(!topicFilter.includes(text)) {
              switch(tagName) {
                case 'h2':
                  text = `\n<b>${text}</b>`;
              }
              
              if(text != '') {
                output += text + '\n';
              }
            }
        }
      });

      let galleryIndex = output.search(new RegExp('alt art', "i"));
      if(galleryIndex > 0) {
        output = output.substr(0, galleryIndex);
      }

      if(output.length > 2000) {
        for(let i=0; i<output.length/2000; i++) {
          let message = output.substr((i-1)*2000,i*2000);
          if(message.length > 0) {
            exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
          }
        }
      }else {
        exileBot.sendMessage(msg.chat.id, output, { parse_mode: "HTML"});
      }
      
    });
  }).catch(err => {
    exileBot.sendMessage(msg.chat.id, err);
  });
}

// Gets url on wiki for given searh term
function getWikiLink(searchTerm){
  return new Promise((resolve, reject) => {
    request.get(gamepediaAPI+searchTerm, function(err,res,body){
      if(err){
        reject("I'm sorry, but something went wrong with your search.");
      }
      if(res.statusCode == 200 ){
        let data = JSON.parse(res.body);
  
        if(data[1].length === 0){
          reject(`I couldn't find anything about ${searchTerm}`);
        }else{
          let url;
          let extraMessage = "";
          let multiple = false;
          
          // Checks if there are more than ony of that term
          if(data[1].length > 1){
            url = data[3][0].toString();
            multiple = true;
            extraMessage = "There are multiple pages refering to your search term. This is the closest to what you were looking for: ";
          }else{
             url = data[3].toString();
          }

          resolve(url, multiple);
        }
      }
    });
  });
}

exports.Wiki = extractWikiText;
