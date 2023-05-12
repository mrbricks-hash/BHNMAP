const TelegramBot = require('node-telegram-bot-api');
const Nmap = require('node-nmap');
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Telegram bot token
const bot = new TelegramBot('5871264620:AAHzJB0P1vEDue0NCEY8DwNbC335PQokoAE', { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = 'Push start to work magic.';
  const options = {
    reply_markup: {
      inline_keyboard: [[{ text: 'Start', callback_data: 'start' }]],
    },
  };

  bot.sendMessage(chatId, message, options);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (query.data === 'start') {
    bot.sendMessage(chatId, "Enter the target website you'd like to map:");
    bot.onReplyToMessage(chatId, messageId, (msg) => {
      const targetWebsite = msg.text;

      bot.sendMessage(chatId, 'Blackhat is working his magic... ⚡️');

      const nmap = new Nmap();

      nmap.scan(targetWebsite, '-p 80,443', (err, report) => {
        if (err) {
          bot.sendMessage(chatId, 'An error occurred while scanning the target.');
          console.error(err);
          return;
        }

        const scanResult = report[0];
        const openPorts = scanResult.openPorts;

        const url = `https://${targetWebsite}`;
        request(url, (error, response, body) => {
          if (error) {
            bot.sendMessage(chatId, 'An error occurred while scraping the target website.');
            console.error(error);
            return;
          }

          const dom = new JSDOM(body);
          const emails = dom.window.document.querySelectorAll('a[href^="mailto:"]');
          const emailList = Array.from(emails).map((email) => email.href.substring(7));

          if (emailList.length > 0) {
            const resultMessage = `Found ${emailList.length} emails:\n\n${emailList.join('\n')}`;
            bot.sendMessage(chatId, resultMessage);
          } else {
            bot.sendMessage(chatId, 'No emails found on the target website.');
          }
        });
      });
    });
  }
});
