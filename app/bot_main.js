'use strict';

// Commands - Refer to each file for its implementation
const izarosWisdom = require('./commands/izaros_wisdom');
const mastersGreets = require('./commands/greetings');
const helpful = require('./commands/helpful_resources');
const uniqueItem = require('./commands/unique');
const labLayout = require('./commands/lab_layout');
const wikiArticle = require('./commands/wiki');
const dailyDeals = require('./commands/daily_deals.js');
const ladderRanking = require('./commands/ladder_ranking.js');
const safeLevels = require('./commands/safe_levels.js');

// Variables from Configuration file
const config = require('./config.js');

let gamepediaAPI = config.gamepediaAPI;
let exileBot = config.exileBot;

/*
====================================================
  LIST OF BOT COMMANDS
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
exileBot.onText(/^\/(about|about@PathOfExileBot)$/, function (msg, match) {
  var message = "<b>About ExileBot:</b>\nBlip blop may the goddess of justice watch over you.\n\nIf you want to request a feature or report a nasty bug, shoot an email to my creator at lucasmapurunga@gmail.com.\n\nMy code is on https://github.com/Tutch/Exile-Bot.";

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
});

// /greetings
// Replies with one of the masters' greetings
exileBot.onText(/^\/(greetings|greetings@PathOfExileBot)$/, function (msg, match) {
  let message = mastersGreets.Hi[Math.floor(Math.random() * mastersGreets.Hi.length)];

  let options = {
    reply_to_message_id: msg.message_id
  };

  exileBot.sendMessage(msg.chat.id, message, options);
});

// /help
// Shows bot help
exileBot.onText(/^\/(help|help@PathOfExileBot)$/, function (msg, match) {
  let message = "<b>Available Commands:</b>\n/about\n/greetings\n/lab &lt;difficulty&gt;\n/ladder &lt;league&gt;\n/onsale\n/resources\n/safelevels &lt;levels&gt;\n/unique &lt;name&gt;\n/wiki &lt;term&gt;\n/wisdom";

  exileBot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
});

// /lab difficulty
// Shows bot help
exileBot.onText(/^\/(lab|lab@PathOfExileBot) (.+)$/, function (msg, match) {
  let difficulty = match[2];

  if (['normal', 'cruel', 'merciless', 'uber'].indexOf(difficulty) >= 0) {
    exileBot.sendMessage(msg.chat.id, "I'm fetching today's layout for you.\nPlease wait a little bit, this can take a while.");

    labLayout.Lab(difficulty, msg);
  }else{
    exileBot.sendMessage(msg.chat.id, "Usage: /lab <normal><cruel><merciless><uber>");
  }

});

// /ladder league
// Shows top 10 players on league
exileBot.onText(/^\/(ladder|ladder@PathOfExileBot) (.+)$/, function (msg, match) {
  let ladderId = match[2];

  ladderRanking.Ladder(ladderId, msg);
});

// /onsale
// List of discounted items
exileBot.onText(/^\/(onsale|onsale@PathOfExileBot)$/, function (msg, match) {
  dailyDeals.Deal(msg);
});

// /resources
// Outputs a list of helpful resources
exileBot.onText(/^\/(resources|resources@PathOfExileBot)$/, function (msg, match) {
  let message = "";

  for(let i=0; i<helpful.Resources.length; i++){
    message += `<b>${helpful.Resources[i].name}</b>\n<i>${helpful.Resources[i].desc}</i>\n${helpful.Resources[i].url}\n\n`;
  }

  exileBot.sendMessage(msg.chat.id, message, { parse_mode: "HTML"});
});

// /safelevels level
// Gives safe leveling range for level
exileBot.onText(/^\/(safelevels|safelevels@PathOfExileBot) (.+)$/, function (msg, match) {
  let level = match[2];

  safeLevels.Optimal(level, msg);
});

// /unique itemName
// Check for unique item on name.
exileBot.onText(/^\/(unique|unique@PathOfExileBot) (.+)$/, function (msg, match) {
  let itemName = match[2];

  uniqueItem.Unique(itemName, msg);
});

// /wiki term
// Check for unique item on name.
exileBot.onText(/^\/(wiki|wiki@PathOfExileBot) (.+)$/, function (msg, match) {
  let searchTerm = match[2];

  wikiArticle.Wiki(searchTerm, msg);
});

// /wisdom
// Retuns mad wisdom from emperor Izaro, that magnificent bastard
exileBot.onText(/^\/(wisdom|wisdom@PathOfExileBot)$/, function (msg, match) {
  let message = izarosWisdom.Quotes[Math.floor(Math.random() * izarosWisdom.Quotes.length)];

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
