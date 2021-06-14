/**
 * Discord Welcome bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const fs = require("fs");
const Discord = require("discord.js");
const dotenv = require("dotenv").config();
const package = require("../package.json");

const client = new Discord.Client();

client.commands = new Discord.Collection();
client.disabled = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.defaultPrefix = "w/";
client.categories = [
    "Setup commands",
    "General",
    "Information",
    "Moderation",
    "Miscellaneous",
    "Fun",
    "Owner Only",
];
client.botVersion = package.version;
client.changelog = package.changelog;
process.env.userAgent = "Discord Welcome-Bot " + client.botVersion;
process.env.ownerIDs = [
    "815204465937481749" /*PuneetGopinath#6398*/,
    "693754859014324295" /*abhijoshi2k#6842*/,
];
process.on("exit", (code) => {
    client.destroy();
});

const commandFolder = __dirname + "/commands";
const commandFolders = fs.readdirSync(commandFolder);
let defaultOpts = {
    bot_perms: [
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "READ_MESSAGE_HISTORY",
        "MANAGE_MESSAGES",
    ],
    args: false,
    catchError: true,
    disabled: false,
    cooldown: 3,
    ownerOnly: false,
    category: "General",
};

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`${commandFolder}/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        let module = file.replace(".js", "");
        let command = require(`${commandFolder}/${folder}/${module}`);
        if (command.bot_perms) {
            command.bot_perms = [
                ...defaultOpts.bot_perms,
                ...command.bot_perms,
            ];
        }
        command = {
            ...defaultOpts,
            ...command,
        };
        if (!command.disabled) {
            client.commands.set(command.name, command);
        } else {
            client.disabled.set(command.name, command);
        }
    }
}

const presence = require("./functions/presence");
const greetUser = require("./functions/greetUser");
const sayGoodBye = require("./functions/sayGoodBye");
const serverCount = require("./functions/serverCount");
const execute = require("./functions/execute");

require("./db/connection");
const addGuild = require("./db/functions/guild/addGuild");
const removeGuild = require("./db/functions/guild/removeGuild");
const getGuild = require("./db/functions/guild/getGuild");
const dbAuditor = require("./db/functions/dbAuditor");

client.on("ready", () => {
    // We logged in
    console.log(`Logged in as ${client.user.tag}!`);
    process.env.BOT_ID = client.user.id;
    presence(client);
    if (process.env.NODE_ENV === "production") serverCount(client);
    // 15 * 60 * (1 second)
    // Update presence every 15 minutes
    setInterval(() => presence(client), 15 * 60 * 1000);
    // Update server count every 25 minutes if environment is in PRODUCTION
    if (process.env.NODE_ENV === "production")
        setInterval(() => serverCount(client), 25 * 60 * 1000);
    //Run dbAuditor every 3 hours
    setInterval(() => {
        dbAuditor(client);
    }, 3 * 60 * 60 * 1000);
    require("./functions/versionSender")(client);
});

//https://discord.js.org/#/docs/main/v12/class/Client?scrollTo=e-guildMemberAdd
client.on("guildMemberAdd", (member) => {
    // When a new member joins
    greetUser(member);
});

//https://discord.js.org/#/docs/main/v12/class/Client?scrollTo=e-guildMemberRemove
client.on("guildMemberRemove", (member) => {
    // When a member leaves or is kicked or is banned
    sayGoodBye(member);
});

//https://discord.js.org/#/docs/main/v12/class/Client?scrollTo=e-guildCreate
client.on("guildCreate", (guild) => {
    //Bot has been invited to a new guild
    addGuild(guild.id);
});

//https://discord.js.org/#/docs/main/v12/class/Client?scrollTo=e-guildDelete
client.on("guildDelete", (guild) => {
    //Bot has been kicked or banned in a guild
    removeGuild(guild.id);
});

client.on("message", async function (message) {
    if (message.author.bot) return;
    let guildDB;
    if (message.guild && message.channel.type !== "dm") {
        guildDB = await getGuild(message.guild.id);
    } else {
        guildDB = { prefix: client.defaultPrefix };
    }

    if (message.mentions.has(client.user)) {
        const server = message.guild ? " in this server." : "";
        let reply =
            `Hi there, ${message.author}\nI am Welcome-Bot\nMy prefix is "${guildDB.prefix}"` +
            server +
            `\nSend \`${guildDB.prefix}help\` to get help`;
        if (!message.reference) {
            message.channel.startTyping();
            message.channel.send(reply);
            message.channel.stopTyping();
        } else {
            message.channel.messages
                .fetch(message.reference.messageID)
                .then((msg) => {
                    if (msg.author.id != client.user.id) {
                        message.channel.startTyping();
                        message.channel.send(reply);
                        message.channel.stopTyping();
                    }
                })
                .catch(console.error);
        }
    }
    //Whatever happens, if the message starts with prefix, the bot should execute it.
    execute(message, guildDB);
});

// Login
client.login(process.env.BOT_TOKEN);
