"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const discord_js_1 = require("discord.js");
const commandHandler_1 = require("./handlers/commandHandler");
const interactionHandler_1 = require("./handlers/interactionHandler");
const messageHandler_1 = require("./handlers/messageHandler");
const configHelpers_1 = require("./helpers/configHelpers");
console.log(`Needle, a Discord bot that declutters your server by creating threads
Copyright (C) 2022  Marcus Otterström

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
`);
(async () => {
    // Initial load of all commands
    await (0, commandHandler_1.getOrLoadAllCommands)(false);
    const CLIENT = new discord_js_1.Client({
        intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES],
        presence: {
            activities: [
                {
                    type: "LISTENING",
                    name: "/help",
                },
            ],
        },
    });
    CLIENT.once("ready", () => {
        console.log("Ready!");
        (0, configHelpers_1.deleteConfigsFromUnknownServers)(CLIENT);
    });
    CLIENT.on("interactionCreate", async (interaction) => await (0, interactionHandler_1.handleInteractionCreate)(interaction).catch(console.error));
    CLIENT.on("messageCreate", async (message) => await (0, messageHandler_1.handleMessageCreate)(message).catch(console.error));
    CLIENT.on("guildDelete", (guild) => {
        (0, configHelpers_1.resetConfigToDefault)(guild.id);
    });
    CLIENT.login((0, configHelpers_1.getApiToken)());
    process.on("SIGINT", () => {
        CLIENT.destroy();
        console.log("Destroyed client");
        process.exit(0);
    });
})();
