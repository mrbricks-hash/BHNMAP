const { Telegraf, Markup } = require('telegraf');
const Nmap = require('node-nmap');
const JSSoup = require('jssoup').default;

const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');

bot.start((ctx) => {
  ctx.reply('Push start to work magic. 🧙‍♂️', Markup.inlineKeyboard([Markup.button.callback('Start', 'start')]));
});

bot.action('start', (ctx) => {
  ctx.reply("Enter the target website you'd like to map. 🌐");
});

bot.on('text', async (ctx) => {
  const targetWebsite = ctx.message.text;

  ctx.reply('Blackhat is working his magic... ⚡️');

  const nmap = new Nmap();
  nmap.scan(targetWebsite, '-p 80,443', (err, report) => {
    if (err) {
      console.error(err);
      ctx.reply('Oops! Something went wrong.');
      return;
    }

    const { ports } = report[0];
    const openPorts = ports.filter((port) => port.state === 'open');

    if (openPorts.length === 0) {
      ctx.reply('No open ports found.');
      return;
    }

    const webPage = openPorts.find((port) => port.port === 80 || port.port === 443);
    if (!webPage) {
      ctx.reply('No web page found on port 80 or 443.');
      return;
    }

    const { ip } = report[0];
    const webPageUrl = `http://${ip}:${webPage.port}`;

    const emails = await extractEmailsFromWebPage(webPageUrl);
    if (emails.length === 0) {
      ctx.reply('No emails found on the target website.');
      return;
    }

    const emailList = emails.join('\n');
    ctx.reply(`Emails found on ${targetWebsite}:\n\n${emailList}`);

    ctx.reply('Would you like to conduct another scrape?', Markup.inlineKeyboard([Markup.button.callback('Yes', 'start'), Markup.button.callback('No', 'end')]));
  });
});

bot.action('end', (ctx) => {
  ctx.reply('Thank you for using Blackhats Nmapper. Have a great day! 👋');
});

async function extractEmailsFromWebPage(url) {
  const response = await fetch(url);
  const html = await response.text();

  const soup = new JSSoup(html);
  const emailTags = soup.findAll('a[href^="mailto:"]');
  const emails = emailTags.map((tag) => tag.attrs.href
