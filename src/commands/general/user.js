/**
 * Discord Welcome bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const { userFromMention } = require("../../helpers/Util.js");
const { Embed, Command } = require("../../classes");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "user",
                aliases: ["whois", "ui", "uinfo"],
                memberPerms: [],
                botPerms: [],
                usage: "(@mention / user id) (--dm)",
                disabled: false,
                cooldown: 10,
                category: "General",
            },
            client
        );
    }

    async execute({ message, args }, t) {
        if (args[1]) {
            args[1] = args[1].toLowerCase();
        }
        let user;
        if (args[0]) {
            if (args[0].startsWith("<@")) {
                user = userFromMention(
                    args[0] || `${message.author}`,
                    message.client
                );
            }
            if (!isNaN(parseInt(args[0]))) {
                user = message.client.users.cache.get(args[0]);
                if (!user) user = await message.client.users.fetch(args[0]);
            }
        } else {
            user = message.author;
        }

        if (!user) {
            message.reply(t("errors:invalidUser"));
            return false;
        }
        let member;
        if (!member) {
            member = await message.guild.members.fetch(user.id);
            if (!member)
                return message.reply("That user was not found in this server");
        }

        /*let badges = [];
        await getUserFlags(user)
            .then((b) => {
                badges = b;
            })
            .catch((err) => {
                console.log(err);
            });

        //Covert badges to images markdown
        let badgesStr = [];
        for (var i = 0; i < badges.length; i++) {
            badgesStr[badgesStr.length] = `${message.client.emojis.cache.find(
                (emoji) => emoji.id === badges[i].emoji
            )}`;
        }*/
        const embed = new Embed({
            tag: message.author.tag,
            avatarURL: message.author.displayAvatarURL(),
            color: "success",
            timestamp: true,
        });
        embed.setTitle(`${user.tag}`);
        embed.setDescription(`Information about ${args[0] || message.author}`);
        embed.setThumbnail(`${user.displayAvatarURL()}`);
        embed.addField("ID:", `\`\`\`\n${user.id}\n\`\`\``);
        const avatarURL = user.displayAvatarURL().slice(0, 35) + "...";
        embed.addField(
            "Avatar URL:",
            `[${avatarURL}](${user.displayAvatarURL()})`
        );
        /*if (badgesStr.length > 0) {
            embed.addField("Badges:", badgesStr.join(" "));
        } else {
            embed.addField("Badges:", "None");
        }*/
        embed.addField(
            "Joined:",
            `Joined discord at *${user.createdAt}*` +
                (message.guild
                    ? `\n\nJoined **${message.guild.name}** server at *${message.member.joinedAt}*`
                    : "")
        );
        if (member && member.nickname)
            embed.addField("Nickname:", `${member.nickname}`);
        if (member?.presence)
            embed.addField(t("misc:presence"), `${member.presence.status}`);
        else embed.addField(t("misc:presence"), `Unknown`);
        condt content = user.id;
        switch (args[1]) {
            case "--dm":
                message.author.send({ content, embeds: [embed] });
                message.channel.send(`Check out your DMs, ${message.author}`);
                break;
            default:
                message.channel.send({ content, embeds: [embed] });
                break;
        }
    }
};
