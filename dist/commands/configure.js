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
const permissionHelpers_1 = require("../helpers/permissionHelpers");
// Note:
// The important messages of these commands should not be configurable
// (prevents user made soft-locks where it's hard to figure out how to fix it)
exports.command = {
    name: "configure",
    shortHelpDescription: "Modify the configuration of Needle",
    async getSlashCommandBuilder() {
        return new builders_1.SlashCommandBuilder()
            .setName("configure")
            .setDescription("Modify the configuration of Needle")
            .addSubcommand(subcommand => {
            return subcommand
                .setName("message")
                .setDescription("Modify the content of a message that Needle replies with when a certain action happens")
                .addStringOption(option => {
                const opt = option
                    .setName("key")
                    .setDescription("The key of the message")
                    .setRequired(true);
                for (const messageKey of Object.keys((0, configHelpers_1.getConfig)().messages ?? [])) {
                    opt.addChoice(messageKey, messageKey);
                }
                return opt;
            })
                .addStringOption(option => {
                return option
                    .setName("value")
                    .setDescription("The new message for the selected key (shows the current value of this message key if left blank)")
                    .setRequired(false);
            });
        })
            .addSubcommand(subcommand => {
            return subcommand
                .setName("default")
                .setDescription("Reset the server's custom Needle configuration to the default");
        })
            .addSubcommand(subcommand => {
            return subcommand
                .setName("auto-threading")
                .setDescription("Enable or disable automatic creation of threads on every new message in a channel")
                .addChannelOption(option => {
                return option
                    .setName("channel")
                    .setDescription("The channel to enable/disable automatic threading in")
                    .addChannelType(0 /* GuildText */)
                    .addChannelType(5 /* GuildNews */)
                    .setRequired(true);
            })
                .addBooleanOption(option => {
                return option
                    .setName("enabled")
                    .setDescription("Whether or not threads should be automatically created from new messages in the selected channel")
                    .setRequired(true);
            })
                .addBooleanOption(option => {
                return option
                    .setName("include-bots")
                    .setDescription("Whether or not threads should be created on messages by bots. Default: False");
            })
                .addStringOption(option => {
                return option
                    .setName("archive-behavior")
                    .setDescription("What should happen when users close a thread?")
                    .addChoice("✅ Archive immediately (DEFAULT)", "immediately")
                    .addChoice("⌛ Archive after 1 hour of inactivity", "slow");
            })
                .addStringOption(option => {
                return option
                    .setName("custom-message")
                    .setDescription("The message to send when a thread is created (\"\\n\" for new line)");
            });
        })
            .addSubcommand(subcommand => {
            return subcommand
                .setName("emojis")
                .setDescription("Toggle thread name emojis on or off")
                .addBooleanOption(option => {
                return option
                    .setName("enabled")
                    .setDescription("Whether or not emojis should be enabled for titles in auto-threads");
            });
        })
            .toJSON();
    },
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_IN_SERVER"));
        }
        if (!(0, permissionHelpers_1.memberIsModerator)(interaction.member)) {
            return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_INSUFFICIENT_PERMS"));
        }
        if (interaction.options.getSubcommand() === "default") {
            const success = (0, configHelpers_1.resetConfigToDefault)(interaction.guild.id);
            return (0, messageHelpers_1.interactionReply)(interaction, success
                ? "Successfully reset the Needle configuration to the default."
                : (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"), !success);
        }
        if (interaction.options.getSubcommand() === "emojis") {
            return configureEmojis(interaction);
        }
        if (interaction.options.getSubcommand() === "message") {
            return configureMessage(interaction);
        }
        if (interaction.options.getSubcommand() === "auto-threading") {
            return configureAutothreading(interaction);
        }
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    },
};
function configureEmojis(interaction) {
    const enable = interaction.options.getBoolean("enabled");
    if (enable === null || interaction.guild === null) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_PARAMETER_MISSING"));
    }
    if (enable === (0, configHelpers_1.emojisEnabled)(interaction.guild)) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"));
    }
    const success = (0, configHelpers_1.setEmojisEnabled)(interaction.guild, enable);
    if (!success)
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    return (0, messageHelpers_1.interactionReply)(interaction, enable
        ? "Successfully enabled emojis."
        : "Successfully disabled emojis.");
}
function configureMessage(interaction) {
    const key = interaction.options.getString("key");
    const value = interaction.options.getString("value");
    if (!interaction.guild) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_IN_SERVER"));
    }
    if (!value || value.length === 0) {
        return (0, messageHelpers_1.interactionReply)(interaction, `**${key}** message:\n\n>>> ${(0, messageHelpers_1.getMessage)(key, false)}`);
    }
    const oldValue = (0, messageHelpers_1.getMessage)(key, false);
    return (0, configHelpers_1.setMessage)(interaction.guild, key, value)
        ? (0, messageHelpers_1.interactionReply)(interaction, `Changed **${key}**\n\nOld message:\n> ${oldValue?.replaceAll("\n", "\n> ")}\n\nNew message:\n>>> ${value}`, false)
        : (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
}
async function configureAutothreading(interaction) {
    const channel = interaction.options.getChannel("channel");
    const enabled = interaction.options.getBoolean("enabled");
    const customMessage = interaction.options.getString("custom-message") ?? "";
    const archiveImmediately = interaction.options.getString("archive-behavior") !== "slow";
    const includeBots = interaction.options.getBoolean("include-bots") ?? false;
    if (!interaction.guild || !interaction.guildId) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_ONLY_IN_SERVER"));
    }
    if (!channel || enabled == null) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_PARAMETER_MISSING"));
    }
    const clientUser = interaction.client.user;
    if (!clientUser)
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    const botMember = await interaction.guild.members.fetch(clientUser);
    if (!botMember.permissionsIn(channel.id).has(discord_js_1.Permissions.FLAGS.VIEW_CHANNEL)) {
        (0, messageHelpers_1.addMessageContext)({ channel: channel });
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_CHANNEL_VISIBILITY"));
    }
    if (enabled) {
        const success = (0, configHelpers_1.enableAutothreading)(interaction.guild, channel.id, includeBots, archiveImmediately, customMessage);
        return success
            ? (0, messageHelpers_1.interactionReply)(interaction, `Updated auto-threading settings for <#${channel.id}>`, false)
            : (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    }
    if (!(0, messageHelpers_1.isAutoThreadChannel)(channel.id, interaction.guildId)) {
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_NO_EFFECT"));
    }
    const success = (0, configHelpers_1.disableAutothreading)(interaction.guild, channel.id);
    return success
        ? (0, messageHelpers_1.interactionReply)(interaction, `Removed auto-threading in <#${channel.id}>`, false)
        : (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
}
