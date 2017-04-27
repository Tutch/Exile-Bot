// Modules
var request = require('request');
var util = require('util');
var htmlparser = require('htmlparser2');
var cheerio = require('cheerio');

var gamepediaSearch = "http://pathofexile.gamepedia.com/api.php?action=opensearch&search=";

// Don't forget to use your own bot token
var botToken = '//YOUR BOT TOKEN';
var Bot = require('node-telegram-bot-api'),
    exileBot = new Bot(botToken, {polling:true});

    // Your server
    exileBot.setWebHook(`http://somedomain.com/${exileBot.token}`);

module.exports = {
  gamepediaAPI : gamepediaSearch,
  exileBot : exileBot,
  bot : Bot,
  htmlparser : htmlparser,
  request : request,
  cheerio : cheerio
}
