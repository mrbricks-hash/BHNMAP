const TelegramBot = require('node-telegram-bot-api');
const JSSoup = require('jssoup').default;
const nmap = require('node-nmap');

// Telegram Bot Token
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Handler for /start command and initial message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const startMessage = 'Push start to work magic.';

  // Inline markup keyboard
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Start', callback_data: 'start' }]
      ]
    }
  };

  bot.sendMessage(chatId, startMessage, options);
});

// Callback query handler
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  if (callbackQuery.data === 'start') {
    bot.sendMessage(chatId, "Enter the target website you'd like to map:");
  }

  // User input handler
  bot.onText(/.+/, (msg) => {
    const targetWebsite = msg.text;
    const options = {
      target: targetWebsite,
      flags: '-p 80,443' // Scan HTTP and HTTPS ports
    };

    bot.sendMessage(chatId, 'Blackhat\'s working his magic.');

    nmap.scan(options, (err, report) => {
      if (err) {
        bot.sendMessage(chatId, 'An error occurred while scanning the website.');
        console.error(err);
        return;
      }

      const extractedEmails = extractEmails(report);

      if (extractedEmails.length === 0) {
        bot.sendMessage(chatId, 'No emails found.');
      } else {
        const resultMessage = `Found emails:\n${extractedEmails.join('\n')}`;
        bot.sendMessage(chatId, resultMessage);
      }

      // Ask if the user wants to conduct another scrape
      const anotherScrapeMessage = 'Would you like to conduct another scrape?';
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Yes', callback_data: 'start' }],
            [{ text: 'No', callback_data: 'end' }]
          ]
        }
      };

      bot.sendMessage(chatId, anotherScrapeMessage, options);
    });
  });

  // Extract emails from the HTML using JSSoup
  function extractEmails(report) {
    const soup = new JSSoup(report[0].data);
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|
