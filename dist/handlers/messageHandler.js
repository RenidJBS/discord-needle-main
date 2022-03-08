"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageCreate = void 0;
const discord_js_1 = require("discord.js");
const configHelpers_1 = require("../helpers/configHelpers");
const messageHelpers_1 = require("../helpers/messageHelpers");
const permissionHelpers_1 = require("../helpers/permissionHelpers");
async function handleMessageCreate(message) {
    // Server outage
    if (!message.guild?.available)
        return;
    // Not logged in
    if (message.client.user === null)
        return;
    if (message.system)
        return;
    if (!message.channel.isText())
        return;
    if (!message.inGuild())
        return;
    if (message.author.id === message.client.user.id)
        return;
    const includeBots = (0, configHelpers_1.includeBotsForAutothread)(message.guild.id, message.channel.id);
    //if (!includeBots && message.author.bot) return;   #ignores bot messages
    if (!message.author.bot && message.channel.isThread()) {
        await updateTitle(message.channel, message);
        return;
    }
    await autoCreateThread(message);
    (0, messageHelpers_1.resetMessageContext)();
}
exports.handleMessageCreate = handleMessageCreate;
console.log("this too");
async function updateTitle(thread, message) {
    if (message.author.bot)
        return;
    const threadAuthor = await (0, messageHelpers_1.getThreadAuthor)(thread);
    if (message.author == threadAuthor)
        return;
    await thread.setName(thread.name.replace("🆕", ""));
}
async function autoCreateThread(message) {
    // Server outage
    if (!message.guild?.available)
        return;
    // Not logged in
    if (message.client.user === null)
        return;
    const authorUser = message.author;
    const authorMember = message.member;
    const guild = message.guild;
    const channel = message.channel;
    if (!(channel instanceof discord_js_1.TextChannel) && !(channel instanceof discord_js_1.NewsChannel))
        return;
    if (message.hasThread)
        return;
    if (!(0, messageHelpers_1.isAutoThreadChannel)(channel.id, guild.id))
        return;
    const botMember = await guild.members.fetch(message.client.user);
    const botPermissions = botMember.permissionsIn(message.channel.id);
    const requiredPermissions = (0, permissionHelpers_1.getRequiredPermissions)();
    if (!botPermissions.has(requiredPermissions)) {
        try {
            const missing = botPermissions.missing(requiredPermissions);
            const errorMessage = `Missing permission${missing.length > 1 ? "s" : ""}:`;
            await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
        }
        catch (e) {
            console.log(e);
        }
        return;
    }
    (0, messageHelpers_1.addMessageContext)({
        user: authorUser,
        channel: channel,
        message: message,
    });
    const creationDate = message.createdAt.toISOString().slice(0, 10);
    const authorName = authorMember === null || authorMember.nickname === null
        ? authorUser.username
        : authorMember.nickname;
    const name = (0, configHelpers_1.emojisEnabled)(guild)
        ? `🆕 ${authorName} (${creationDate})`
        : `${authorName} (${creationDate})`;
    if (message.author.id != "204255221017214977")
        return;
    if (message.embeds.length == 0)
        return;
    // console.log(message.embeds[0].title);
    if (!message.embeds[0].title?.includes("Eli#1271"))
        return; //#FIXME:
    const thread = await message.startThread({
        name,
        autoArchiveDuration: (0, permissionHelpers_1.getSafeDefaultAutoArchiveDuration)(channel),
    });
    const closeButton = new discord_js_1.MessageButton()
        .setCustomId("close")
        .setLabel("Archive thread")
        .setStyle("SUCCESS")
        .setEmoji("937932140014866492"); // :archive:
    const helpButton = (0, messageHelpers_1.getHelpButton)();
    const buttonRow = new discord_js_1.MessageActionRow().addComponents(closeButton, helpButton);
    const overrideMessageContent = (0, configHelpers_1.getConfig)(guild.id).threadChannels?.find((x) => x?.channelId === channel.id)?.messageContent;
    const msgContent = overrideMessageContent
        ? (0, messageHelpers_1.replaceMessageVariables)(overrideMessageContent)
        : (0, messageHelpers_1.getMessage)("SUCCESS_THREAD_CREATE");
    if (msgContent && msgContent.length > 0) {
        await thread.send({
            content: msgContent,
            components: [buttonRow],
        });
    }
    (0, messageHelpers_1.resetMessageContext)();
}
