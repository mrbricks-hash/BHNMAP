const Telegraf = require('telegraf');
const { JSSoup } = require('jssoup');
const { Nmap } = require('node-nmap');

const bot = new Telegraf('5871264620:AAHzJB0P1vEDue0NCEY8DwNbC335PQokoAE');

// Start command handler
bot.command('start', (ctx) => {
  ctx.replyWithMarkdownV2('Push start to work magic. \n\n💻🎩');
});

// Text message handler
bot.on('text', (ctx) => {
  if (ctx.message.text.startsWith('http://') || ctx.message.text.startsWith('https://')) {
    const targetWebsite = ctx.message.text;
    
    ctx.reply('Blackhat\'s working his magic. ⚡️');

    // Perform Nmap scan
    const nmap = new Nmap();
    nmap.scan(targetWebsite, ['-p', '80,443'], (err, report) => {
      if (err) {
        ctx.reply('Oops! Something went wrong while scanning the target website. Please try again later. ❌');
        console.error(err);
        return;
      }

      const emailSet = new Set();

      // Extract emails using JSSoup
      const soup = new JSSoup(report[0].data);
      const emailElements = soup.findAll('a[href^="mailto:"]');
      
      emailElements.forEach((element) => {
        const email = element.attrs.href.replace('mailto:', '');
        emailSet.add(email);
      });

      if (emailSet.size === 0) {
        ctx.reply('No emails found on the target website. 😕');
      } else {
        const emailList = Array.from(emailSet);
        ctx.reply(`Emails found on the target website:\n\n${emailList.join('\n')}`);
      }

      // Ask if user wants to conduct another scrape
      ctx.replyWithMarkdownV2('Would you like to conduct another scrape? \n\n✨ Yes, please /start another scrape.\n\n🚫 No, thanks.');
    });
  } else {
    ctx.reply('Please enter a valid URL starting with http:// or https://. 🌐');
  }
});

// Handle 'Yes, please' response
bot.command('start', (ctx) => {
  ctx.replyWithMarkdownV2('Sure! Enter the target website URL you\'d like to map.');
});

// Handle 'No, thanks' response
bot.command('stop', (ctx) => {
  ctx.reply('Thank you for using Blackhats Nmapper! If you have any other questions, feel free to ask. 👋');
});

// Start the bot
bot.launch();
