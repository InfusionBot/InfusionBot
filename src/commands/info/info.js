/**
 * Discord Welcome bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
module.exports = {
    name: "info",
    aliases: ["debug"],
    description: "Debug information",
    usage: "(--dm)",
    execute(message, args) {
        const { MessageEmbed } = require("discord.js");
        let msg = new MessageEmbed();
        msg.setTitle("Welcome-Bot");
        msg.setDescription("Information and Support for Welcome-Bot");
        msg.setThumbnail("https://i.imgur.com/bbSlsT7.png");
        msg.addField("Servers joined:", message.client.guilds.cache.size);
        msg.addField("Version:", `${message.client.botVersion}`);
        msg.addField(
            "Bot lists:",
            `[discordextremelist.xyz](https://discordextremelist.xyz/en-US/bots/welcome-bot)`
        );
        msg.addField(
            "Other links:",
            "[Support server](https://dsc.gg/welcome-bot-guild)\n" +
                "[GitHub](https://github.com/Welcome-Bot/welcome-bot/)\n" +
                "[Privacy policy](https://github.com/Welcome-Bot/welcome-bot/blob/main/docs/privacy-policy.md) and [Terms of service](https://github.com/Welcome-Bot/welcome-bot/blob/main/docs/terms.md)"
        );
        switch (args[0]) {
            case "--dm":
                message.author.send(msg);
                message.channel.send(`Check out your DMs ${message.author}`);
                break;
            default:
                message.channel.send(msg);
                break;
        }
    },
};
