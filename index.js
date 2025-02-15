const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// bot token - remember to move to env file later!
const token = '7647155816:AAFaBKPz9sC6DOhKell6Vcdn9dUdnDQVygc'; // Enter Your TELEGRAM_BOT_TOKEN here i used my own 
const bot = new TelegramBot(token, { polling: true });

let events;

// temp solution - will implement proper DB later
const fetchEvents = () => {
    fetch('https://event-scrapper.onrender.com/events').then(res => res.json()).then(data => {
        events = data;
    }).catch(err => {});
}

// quick fix for storing user data - need to implement Redis/MongoDB
let userPrefs = new Map();
let registeredEvents = new Map();

// TODO: improve keyword matching algorithm
// maybe use natural language processing?
function matchEvents(searchText) {
    let keywords = searchText.toLowerCase().split(' ');
    // filter out common words? 
    return events.filter(evt => {
        let fullText = `${evt.name} ${evt.description} ${evt.location}`.toLowerCase();
        // console.log('Matching:', fullText); // for debugging
        return keywords.some(kw => fullText.includes(kw));
    });
}

// bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // welcome msg - maybe add more personality?
    bot.sendMessage(chatId, 
        'Hey there! 🎉\n\n' +
        'I\'m your Sydney events buddy!\n' +
        'Just tell me what you\'re into and I\'ll find some cool events.\n\n' +
        'Like: "indie music" or "food festivals" or whatever you\'re feeling!'
    );
});

// handle user msgs
bot.on('message', (msg) => {
    if (msg.text.startsWith('/')) return; // skip commands

    const chatId = msg.chat.id;
    const txt = msg.text;  // shortened for convenience

    userPrefs.set(chatId, txt);
    
    let matches = matchEvents(txt);
    // console.log('Found matches:', matches.length); // debug

    if (!matches.length) {
        bot.sendMessage(chatId, 'Hmm, not finding anything right now... Try something else?');
        return;
    }

    // build response - might need to limit number of results
    let resp = 'Check these out:\n\n';
    matches.forEach((e, i) => {
        resp += `${i + 1}. ${e.name}\n`;
        resp += `📅 ${new Date(e.date).toLocaleDateString()}\n`;
        resp += `📍 ${e.location}\n\n`;
    });
    resp += 'Want updates? Just send the number (like "1" or "2")';

    bot.sendMessage(chatId, resp);
});

// handle event signup
bot.onText(/^[0-9]+$/, (msg) => {
    let chatId = msg.chat.id;
    let idx = parseInt(msg.text) - 1;
    let prefs = userPrefs.get(chatId);
    
    if (!prefs) {
        bot.sendMessage(chatId, 'Hold up - tell me what you\'re interested in first!');
        return;
    }

    let matches = matchEvents(prefs);
    if (idx >= 0 && idx < matches.length) {
        let picked = matches[idx];
        registeredEvents.set(chatId, picked);
        
        bot.sendMessage(chatId, 
            `Sweet! I'll keep you posted about:\n` +
            `"${picked.name}"\n\n` +
            `You'll get a heads up before it starts! 🔔`
        );
    }
});

// check upcoming events hourly
// FIXME: might need to adjust timezone handling
cron.schedule('0 * * * *', () => {
    let now = new Date();
    let tmrw = new Date(now.setDate(now.getDate() + 1));

    registeredEvents.forEach((evt, chatId) => {
        let eventDate = new Date(evt.date);
        if (eventDate.toDateString() === tmrw.toDateString()) {
            bot.sendMessage(chatId,
                `Yo! Don't forget: "${evt.name}" is tomorrow!\n\n` +
                `📅 ${eventDate.toLocaleDateString()}\n` +
                `📍 ${evt.location}\n` +
                `🎫 ${evt.url}`
            );
        }
    });
});

// temp debug logs
console.log('Bot started - ctrl+c to exit');
fetchEvents();
// console.log('Debug mode:', process.env.DEBUG);
