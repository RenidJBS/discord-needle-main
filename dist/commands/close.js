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
const configHelpers_1 = require("../helpers/configHelpers");
const messageHelpers_1 = require("../helpers/messageHelpers");
const threadHelpers_1 = require("../helpers/threadHelpers");
exports.command = {
    name: "close",
    shortHelpDescription: "Closes a thread by setting the auto-archive duration to 1 hour",
    longHelpDescription: "The close command sets the auto-archive duration to 1 hour in a thread.\n\nWhen using auto-archive, the thread will automatically be archived when there have been no new messages in the thread for one hour. This can be undone by a server moderator by manually changing the auto-archive duration back to what it was previously, using Discord's own interface.",
    async getSlashCommandBuilder() {
        return new builders_1.SlashCommandBuilder()
            .setName("close")
            .setDescription("Closes a thread by setting the auto-archive duration to 1 hour")
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
        // Invoking slash commands seem to unarchive the threads for now so ironically, this has no effect
        // Leaving this in if Discord decides to change their API around this
        if (channel.archived) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"));
        }
        const hasManageThreadsPermissions = member.permissionsIn(channel).has(discord_js_1.Permissions.FLAGS.MANAGE_THREADS, true);
        if (hasManageThreadsPermissions) {
            await archiveThread(channel);
            return;
        }
        const threadAuthor = await (0, messageHelpers_1.getThreadAuthor)(channel);
        if (!threadAuthor) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_AMBIGUOUS_THREAD_AUTHOR"));
        }
        if (threadAuthor !== interaction.user) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_THREAD_OWNER"));
        }
        await archiveThread(channel);
        async function archiveThread(thread) {
            if ((0, configHelpers_1.shouldArchiveImmediately)(thread)) {
                if (interaction.isButton()) {
                    await (0, messageHelpers_1.interactionReply)(interaction, "Success!");
                    const message = (0, messageHelpers_1.getMessage)("SUCCESS_THREAD_ARCHIVE_IMMEDIATE");
                    if (message) {
                        await thread.send(message);
                    }
                }
                else if (interaction.isCommand()) {
                    await (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("SUCCESS_THREAD_ARCHIVE_IMMEDIATE"), false);
                }
                await (0, threadHelpers_1.setEmojiForNewThread)(thread, false);
                await thread.setArchived(true);
                return;
            }
            if (thread.autoArchiveDuration === 60) {
                return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"));
            }
            await (0, threadHelpers_1.setEmojiForNewThread)(thread, false);
            await thread.setAutoArchiveDuration(60);
            if (interaction.isButton()) {
                await (0, messageHelpers_1.interactionReply)(interaction, "Success!");
                const message = (0, messageHelpers_1.getMessage)("SUCCESS_THREAD_ARCHIVE_SLOW");
                if (message) {
                    await thread.send(message);
                }
            }
            else if (interaction.isCommand()) {
                await (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("SUCCESS_THREAD_ARCHIVE_SLOW"), false);
            }
        }
    },
};
