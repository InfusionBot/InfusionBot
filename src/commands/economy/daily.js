/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const updateUser = require("../../db/functions/user/updateUser");
const getUser = require("../../db/functions/user/getUser");
const moment = require("moment");
require("moment-duration-format");
const { Embed, Command } = require("../../classes");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "daily",
                //aliases: ["day-coin"],
                memberPerms: [],
                botPerms: [],
                requirements: {
                    guildOnly: false,
                },
                disabled: false,
                cooldown: 10,
                category: "Economy",
            },
            client
        );
    }

    async execute({ message, args, guildDB, userDB }, t) {
        const dailyCoins = 100;
        moment.locale(guildDB.lang ? guildDB.lang.toLowerCase() : "en-US");

        const diff =
            24 * 60 * 60 * 1000 - (new Date().getTime() - userDB.dailyClaimed);

        if (diff > 0) {
            let duration = Math.round(diff / (1000 * 60 * 60));
            if (duration == 24) {
                duration = "1 day";
            } else if (duration == 0) {
                duration = Math.ceil(diff / (1000 * 60));
                let unit = "minutes";
                if (duration == 1) {
                    unit = "minute";
                }
                duration = `${duration} ${unit}`;
            } else {
                let unit = "hours";
                if (duration == 1) {
                    unit = "hour";
                }
                duration = `${duration} ${unit}`;
            }
            return message.reply(t("cmds:daily.dailyClaimed", { duration }));
        }

        try {
            await updateUser(
                message.author.id,
                "wallet",
                parseInt(userDB.wallet) + dailyCoins
            );
            await updateUser(
                message.author.id,
                "dailyClaimed",
                new Date().getTime()
            );
        } catch (e) {
            throw e;
        }
        const embed = new Embed({ color: "green" })
            .setTitle(t("cmds:daily.cmdDesc"))
            .setDesc(t("cmds:daily.success", { wcoins: `${dailyCoins}` }));
        message.reply({ embeds: [embed] });
    }
};
