// Variables from Configuration file
var config = require("../config.js");

var exileBot = config.exileBot;

// Returns experience range
// TODO: map tier calculation, maybe?
function getOptimalLevel(level, msg){

  var level;

  if( level = parseInt(level)|| level > 0 || level < 101){

    var safeZone = 3 + Math.floor(parseInt(level)/16);
    var responseText = "";
    var minLevel = (level - safeZone < 2) ? 1 : level - safeZone;
    var maxLevel = (level + safeZone > 100) ? 100 : level + safeZone;
    //var minTier = (minLevel - 68 > 0) ? minLevel - 68 + 1 : 1;
    //var maxTier = (maxLevel - 84 > 16) ? maxLevel - 84 + 1 : 1;
    //  var tiers = maxLevel - level + level - minTier + 1;

    responseText = `At level <b>${level}</b>, you receive no experience penalty from areas level ${minLevel} to ${maxLevel}.\n\n`;
    responseText += "<i>Reminder: maps go from Tier 1 (68) to Tier 16 (83). Shaper's Realm is area level 84.</i>";

    exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
  }else{
    exileBot.sendMessage(msg.chat.id, "Invalid level");
  }

}

exports.Optimal = getOptimalLevel;
