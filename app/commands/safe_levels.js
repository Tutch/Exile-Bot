'use strict';

// Variables from Configuration file
const config = require("../config.js");
const exileBot = config.exileBot;

// Returns experience range
// TODO: map tier calculation, maybe?
function getOptimalLevel(level, msg){
  if(level = parseInt(level)|| level > 0 || level < 101){

    let safeZone = 3 + Math.floor(parseInt(level)/16);
    let responseText = "";
    let minLevel = (level - safeZone < 2) ? 1 : level - safeZone;
    let maxLevel = (level + safeZone > 100) ? 100 : level + safeZone;
    
    responseText = `At level <b>${level}</b>, you receive no experience penalty from areas level ${minLevel} to ${maxLevel}.\n\n`;
    responseText += "<i>Reminder: maps go from Tier 1 (68) to Tier 16 (83). Shaper's Realm is area level 84.</i>";

    exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
  }else{
    exileBot.sendMessage(msg.chat.id, "Invalid level");
  }
}

exports.Optimal = getOptimalLevel;
