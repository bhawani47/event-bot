# Event Notification Telegram Bot

A Telegram bot that helps users find events based on their interests and sends notifications for upcoming events.

## Features
- Natural language interaction for event preferences
- Keyword-based event matching (simulated LLM)
- Event registration and notifications
- Daily reminder for upcoming events

## Setup
1. Create a new Telegram bot using BotFather and get the token
2. Replace `YOUR_TELEGRAM_BOT_TOKEN` in index.js with your bot token
3. Install dependencies:
```bash
npm install
```
4. Start the bot:
```bash
npm start
```

## Usage
1. Start chat with /start
2. Tell the bot what kinds of events you're interested in
3. Select an event number to register for notifications
4. Receive reminders before your registered events

## How it Works
- Uses keyword matching to simulate LLM understanding
- Checks event dates hourly and sends notifications
- Integrates with the event-scraper project for event data
