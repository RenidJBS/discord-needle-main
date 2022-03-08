"use strict";
// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const messageHelpers_1 = require("../helpers/messageHelpers");
const threadHelpers_1 = require("../helpers/threadHelpers");
exports.command = {
    name: "title",
    shortHelpDescription: "Sets the title of a thread to `value`",
    longHelpDescription: "The title command changes the title of a thread.",
    async getSlashCommandBuilder() {
        return new builders_1.SlashCommandBuilder()
            .setName("title")
            .setDescription("Sets the title of a thread")
            .addStringOption(option => {
            return option
                .setName("value")
                .setDescription("The new title of the thread")
                .setRequired(true);
        })
            .toJSON();
    },
    async execute(interaction) {
        const member = interaction.member;
        if (!(member instanceof discord_js_1.GuildMember)) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
        }
        const channel = interaction.channel;
        if (!channel?.isThread()) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_IN_THREAD"));
        }
        const newThreadName = interaction.options.getString("value");
        if (!newThreadName) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_PARAMETER_MISSING"));
        }
        const oldThreadName = channel.name;
        if (oldThreadName === newThreadName) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"));
        }
        const hasChangeTitlePermissions = member
            .permissionsIn(channel)
            .has(discord_js_1.Permissions.FLAGS.MANAGE_THREADS, true);
        if (hasChangeTitlePermissions) {
            await (0, threadHelpers_1.setThreadName)(channel, newThreadName);
            await (0, messageHelpers_1.interactionReply)(interaction, "Success!");
            return;
        }
        const threadAuthor = await (0, messageHelpers_1.getThreadAuthor)(channel);
        if (!threadAuthor) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_AMBIGUOUS_THREAD_AUTHOR"));
        }
        if (threadAuthor !== interaction.user) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_THREAD_OWNER"));
        }
        await (0, threadHelpers_1.setThreadName)(channel, newThreadName);
        await (0, messageHelpers_1.interactionReply)(interaction, "Success!");
    },
};
