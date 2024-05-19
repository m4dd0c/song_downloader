import TgBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";
import { getMp3, search_songs } from "./scrapper.js";
dotenv.config();
const app = express();
//express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening on port", port));
app.get("/", (req, res) => {
  res.send("service is up...");
});

const token = process.env.BOT_TOKEN;
const bot = new TgBot(token, { polling: true });
let array = [];

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text.toLowerCase();

  // Process the incoming message here
  if (messageText === "/start") {
    bot.sendMessage("Welcome to @song_downloader_m4dd0x_bot");
  }
  if (messageText === "/main") {
    bot.sendMessage(chatId, "main channel @channel_m4dd0x");
  }
  if (messageText === "/about") {
    bot.sendMessage(
      chatId,
      "Created by @channel_m4dd0xFOLLOW:\nInstagram: www.instagram.com/m4dd0x_\nGithub: www.github.com/m4dd0c"
    );
  }

  if (!messageText.startsWith("/")) {
    try {
      bot.sendMessage(chatId, "Retriving list, please wait...");
      array = await search_songs(messageText);
      if (!array || array.length <= 0) {
        bot.sendMessage(
          chatId,
          "No Song Found!\nTry again with other query or check your internet connection."
        );
        throw new Error("couldn't retrive songs.");
      }

      const keyboard = [];
      for (let i = 0; i < array.length; i++) {
        keyboard.push([{ text: array[i].title, callback_data: i.toString() }]);
      }
      await bot.sendMessage(chatId, "Choose a song to download", {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (error) {
      console.error("Error sending document:", error.message);
    }
  }
});

bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
  try {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    if (action === "restart") {
      bot.answerCallbackQuery(callbackQuery.id);
    } else {
      const track_link = array[action].link;
      const documentUrl = await getMp3(track_link);
      await bot.deleteMessage(chatId, msg.message_id);

      await bot.sendMessage(chatId, "Streaming the audio, please wait...");
      await bot.sendAudio(chatId, documentUrl);
    }
  } catch (error) {
    console.error("Error sending document callback_query_err:", error.message);
  }
});
console.log("bot is running...");
