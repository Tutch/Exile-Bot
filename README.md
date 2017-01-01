# Exile Bot
This is a Telegram bot to help Path of Exile players. It's written in Node.js and uses https://github.com/yagop/node-telegram-bot-api as API for the bot. You can check it out here: https://telegram.me/PathOfExileBot

If you feel like contributing to the projecting by reviewing or adding to the code or want to make your own version of the bot feel free to do it. This bot is an ongoing project and is up on @Heroku.

If you have any requests or features you want to see implemented, please feel free to send me a message, open up an issue or contact me at lucasmapurunga@gmail.com.

# Commands

| Command     | Function                                         
|:------------|:-------------------------------------------------|
| /about     | Information about the bot   |
| /greetings | Replies with one of the masters's greetings
| /help      | Shows a list of commands
| /lab       | Retrieves last lab layout for given difficulty from Poelab
| /onsale    | Shows a list of items on sale
| /resources | Shows a list of helpful links
| /safelevels| Level range with no penalty
| /unique    | Retrieves information and wiki link of unique item name
| /wisdom    | One of Izaro's many, many quotes
| /wiki      | Returns closest matching wiki link for given term




# Setup for Devs
1. Create your own bot with Botfather: https://telegram.me/botfather
2. Replace the contents of the variable botToken on app/bot_main.js for your own token
3. While on app/bot_main.js, you have to change exileBot.webhook(...) contents for you own domain if you want to use webhooks. For tests, you might want to delete that line to use polling. You can read more about it here: https://core.telegram.org/bots/api#getupdates
4. Run npm install on the main folder to obtain dependencies
5. That's it! You can node index.js to start the bot and server or just use node app/bot_main.js to start the bot only.
