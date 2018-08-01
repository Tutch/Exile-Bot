'use strict';

// Modules
const request = require('request');
const util = require('util');
const htmlparser = require('htmlparser2');
const cheerio = require('cheerio');

const gamepediaSearch = "http://pathofexile.gamepedia.com/api.php?action=opensearch&search=";

// Don't forget to use your own bot token
var botToken = '// Token';

let Bot = require('node-telegram-bot-api'),
    exileBot = new Bot(botToken, {polling:true});
    
    // Your server
    // You can also run the bot locally by commenting the line below and
    // using npm start. Note you will still need a valid bot.
    exileBot.setWebHook(`https://exilebot.herokuapp.com/${exileBot.token}`);

module.exports = {
  gamepediaAPI : gamepediaSearch,
  exileBot : exileBot,
  bot : Bot,
  htmlparser : htmlparser,
  request : request,
  cheerio : cheerio
}
