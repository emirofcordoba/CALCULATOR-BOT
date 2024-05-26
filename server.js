var fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');
var mathjs = require('mathjs');
var express = require('express');
var app = express();
var PORT = 5000;
var bot = new TelegramBot(process.env.TOKEN, { polling: true });

var CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

var joinChannelButton = {
   text: 'JOIN CHANNEL👻',
   url: process.env.JOIN_CHANNEL_URL,
};

var joinedButton = {
   text: 'JOINED🥁',
   callback_data: 'check_joined'
};

async function sendJoinChannelMessage(chatId) {
    var options = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [joinChannelButton, joinedButton]
            ]
        }
    };
    var message = "You can use this Telegram bot as a calculator🤩, but you're not joined to our channel. Please join and click 'Joined🙂'";
    await bot.sendMessage(chatId, `<pre>${message}</pre>`, options);
}

bot.onText(/\/start/, async (msg) => {
    var chatId = msg.chat.id;
    var member = await bot.getChatMember(CHANNEL_USERNAME, chatId);

    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
        await startCommand(chatId);
    } else {
        await sendJoinChannelMessage(chatId);
    }
});

bot.on('callback_query', async (query) => {
    var chatId = query.message.chat.id;

    if (query.data === 'check_joined') {
        var member = await bot.getChatMember(CHANNEL_USERNAME, chatId);

        if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
            await startCommand(chatId);
        } else {
            var randomMessage = "You didn't join all our communities, please join them first to use me perfectly 🥹";

            await bot.answerCallbackQuery(query.id, {
                text: randomMessage,
                show_alert: true
            });

            await sendJoinChannelMessage(chatId);
        }
    }
});

async function startCommand(chatId) {
    var message = `<pre>Hello, I am a calculator bot. Use buttons or go inline in this chat or another chat. In inline mode, type numbers or signs like <b>1+1</b>, <b>3*3</b>, <b>3/2</b>, <b>4-2</b>, or combine multiple numbers or signs, e.g., <b>88+28-6</b>. Choose an option below:</pre>`;
    var inlineKeyboard = [
        [{ text: 'GO INLINE (HERE)🤖', switch_inline_query_current_chat: '' }],
        [{ text: 'GO INLINE (ABROAD)👾', switch_inline_query: '' }],
    ];
    var options = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };
    await bot.sendMessage(chatId, `<pre>${message}</pre>`, options);
}

bot.on('inline_query', async (query) => {
  var results = [];
  var expression = query.query;

  if (expression) {
    try {
      // Evaluate the expression using mathjs
      var resultValue = mathjs.evaluate(expression);

      // Create an inline query result
      var result = {
        type: 'article',
        id: '1', // Unique ID for the result
        title: `${expression} = ?`,
        input_message_content: {
          message_text: `${expression} = ?`, 
        },
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Show Result🧮', callback_data: `result_${expression}_${resultValue}` }
            ]
          ]
        }
      };

      results.push(result);
    } catch (error) {
      console.error('Error evaluating expression:', error);
      // Consider sending an error message to the user if needed
    }
  }

  await bot.answerInlineQuery(query.id, results); 
});

bot.on('callback_query', async (callbackQuery) => {
  var parts = callbackQuery.data.split('_');
  var expression = parts[1];
  var resultValue = parts[2];

  await bot.answerCallbackQuery(callbackQuery.id, { 
    text: `Result🧮: ${resultValue}`, 
    show_alert: true 
  });
});

app.get('/', async (req, res) => {
   res.send("Bot is up");
 });
 
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
