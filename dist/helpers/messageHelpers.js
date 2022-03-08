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
exports.getHelpButton = exports.getFeatureRequestButton = exports.getBugReportButton = exports.getGithubRepoButton = exports.getDiscordInviteButton = exports.replaceMessageVariables = exports.getMessage = exports.interactionReply = exports.getFirstMessageInChannel = exports.getThreadAuthor = exports.isAutoThreadChannel = exports.resetMessageContext = exports.addMessageContext = void 0;
const discord_js_1 = require("discord.js");
const configHelpers_1 = require("./configHelpers");
let context = {};
function addMessageContext(additionalContext) {
    context = Object.assign(context, additionalContext);
}
exports.addMessageContext = addMessageContext;
function resetMessageContext() {
    context = {};
}
exports.resetMessageContext = resetMessageContext;
function isAutoThreadChannel(channelId, guildId) {
    const config = (0, configHelpers_1.getConfig)(guildId);
    return config?.threadChannels?.some(x => x?.channelId === channelId) ?? false;
}
exports.isAutoThreadChannel = isAutoThreadChannel;
async function getThreadAuthor(channel) {
    const parentMessage = await getThreadStartMessage(channel);
    if (parentMessage)
        return parentMessage.author;
    // https://github.com/MarcusOtter/discord-needle/issues/49
    const firstMessage = await getFirstMessageInChannel(channel);
    const author = firstMessage?.mentions.users.first();
    if (!author)
        console.log(`Could not determine author of thread "${channel.name}"`);
    return author;
}
exports.getThreadAuthor = getThreadAuthor;
async function getFirstMessageInChannel(channel) {
    const amount = channel.isThread() ? 2 : 1; // threads have an empty message as the first message
    const messages = await channel.messages.fetch({ after: "0", limit: amount });
    return messages.first();
}
exports.getFirstMessageInChannel = getFirstMessageInChannel;
function interactionReply(interaction, message, ephemeral = true) {
    if (!message || message.length == 0) {
        return interaction.reply({
            content: getMessage("ERR_UNKNOWN"),
            ephemeral: true,
        });
    }
    return interaction.reply({
        content: message,
        ephemeral: ephemeral,
    });
}
exports.interactionReply = interactionReply;
function getMessage(messageKey, replaceVariables = true) {
    const config = (0, configHelpers_1.getConfig)(context?.interaction?.guildId ?? undefined);
    if (!config.messages) {
        return "";
    }
    const message = config.messages[messageKey];
    if (!context || !message) {
        return message;
    }
    return replaceVariables
        ? replaceMessageVariables(message)
        : message;
}
exports.getMessage = getMessage;
function replaceMessageVariables(message) {
    const user = context.user ? `<@${context.user.id}>` : "";
    const channel = context.channel ? `<#${context.channel.id}>` : "";
    const timeAgo = context.timeAgo || (context.message
        ? `<t:${Math.round(context.message.createdTimestamp / 1000)}:R>`
        : "");
    return message
        .replaceAll("$USER", user)
        .replaceAll("$CHANNEL", channel)
        .replaceAll("$TIME_AGO", timeAgo)
        .replaceAll("\\n", "\n");
}
exports.replaceMessageVariables = replaceMessageVariables;
function getDiscordInviteButton(buttonText = "Join the support server") {
    return new discord_js_1.MessageButton()
        .setLabel(buttonText)
        .setStyle("LINK")
        .setURL("https://discord.gg/8BmnndXHp6")
        .setEmoji("930584823473516564"); // :discord_light:
}
exports.getDiscordInviteButton = getDiscordInviteButton;
function getGithubRepoButton(buttonText = "Source code") {
    return new discord_js_1.MessageButton()
        .setLabel(buttonText)
        .setStyle("LINK")
        .setURL("https://github.com/MarcusOtter/discord-needle/")
        .setEmoji("888980150077755412"); // :github_light:
}
exports.getGithubRepoButton = getGithubRepoButton;
function getBugReportButton(buttonText = "Report a bug") {
    return new discord_js_1.MessageButton()
        .setLabel(buttonText)
        .setStyle("LINK")
        .setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
        .setEmoji("🐛");
}
exports.getBugReportButton = getBugReportButton;
function getFeatureRequestButton(buttonText = "Suggest an improvement") {
    return new discord_js_1.MessageButton()
        .setLabel(buttonText)
        .setStyle("LINK")
        .setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
        .setEmoji("💡");
}
exports.getFeatureRequestButton = getFeatureRequestButton;
function getHelpButton() {
    return new discord_js_1.MessageButton()
        .setCustomId("help")
        .setLabel("Commands")
        .setStyle("SECONDARY")
        .setEmoji("937931337942306877"); // :slash_commands:
}
exports.getHelpButton = getHelpButton;
async function getThreadStartMessage(threadChannel) {
    if (!threadChannel?.isThread()) {
        return null;
    }
    if (!threadChannel.parentId) {
        return null;
    }
    const parentChannel = await threadChannel.guild?.channels.fetch(threadChannel.parentId);
    if (!parentChannel?.isText()) {
        return null;
    }
    // The thread's channel ID is the same as the start message's ID,
    // but if the start message has been deleted this will throw an exception
    return parentChannel.messages
        .fetch(threadChannel.id)
        .catch(() => null);
}
