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
exports.deleteConfigsFromUnknownServers = exports.resetConfigToDefault = exports.disableAutothreading = exports.enableAutothreading = exports.setMessage = exports.emojisEnabled = exports.setEmojisEnabled = exports.includeBotsForAutothread = exports.shouldArchiveImmediately = exports.getGuildId = exports.getClientId = exports.getApiToken = exports.getConfig = void 0;
const defaultConfig = require("../config.json");
const path_1 = require("path");
const fs = require("fs");
const CONFIGS_PATH = (0, path_1.resolve)(__dirname, "../../", process.env.CONFIGS_PATH || "configs");
const guildConfigsCache = new Map();
function getConfig(guildId = "") {
    const guildConfig = guildConfigsCache.get(guildId) ?? readConfigFromFile(guildId);
    const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
    if (guildConfig) {
        guildConfig.messages = Object.assign({}, defaultConfigCopy.messages, guildConfig?.messages);
    }
    return Object.assign({}, defaultConfigCopy, guildConfig);
}
exports.getConfig = getConfig;
// Can probably remove the three methods below :)
// Used by deploy-commands.js (!)
function getApiToken() {
    return process.env.DISCORD_API_TOKEN;
}
exports.getApiToken = getApiToken;
// Used by deploy-commands.js (!)
function getClientId() {
    return process.env.CLIENT_ID;
}
exports.getClientId = getClientId;
// Used by deploy-commands.js (!)
function getGuildId() {
    return process.env.GUILD_ID;
}
exports.getGuildId = getGuildId;
function shouldArchiveImmediately(thread) {
    const config = getConfig(thread.guildId);
    return config?.threadChannels?.find(x => x.channelId === thread.parentId)?.archiveImmediately ?? true;
}
exports.shouldArchiveImmediately = shouldArchiveImmediately;
function includeBotsForAutothread(guildId, channelId) {
    const config = getConfig(guildId);
    return config?.threadChannels?.find(x => x.channelId === channelId)?.includeBots ?? false;
}
exports.includeBotsForAutothread = includeBotsForAutothread;
function setEmojisEnabled(guild, enabled) {
    const config = getConfig(guild.id);
    config.emojisEnabled = enabled;
    return setConfig(guild, config);
}
exports.setEmojisEnabled = setEmojisEnabled;
function emojisEnabled(guild) {
    const config = getConfig(guild.id);
    return config.emojisEnabled ?? true;
}
exports.emojisEnabled = emojisEnabled;
function setMessage(guild, messageKey, value) {
    const config = getConfig(guild.id);
    if (!config || !config.messages) {
        return false;
    }
    if (value.length > 2000) {
        return false;
    }
    config.messages[messageKey] = value;
    return setConfig(guild, config);
}
exports.setMessage = setMessage;
function enableAutothreading(guild, channelId, includeBots, archiveImmediately, messageContent) {
    const config = getConfig(guild.id);
    if (!config || !config.threadChannels) {
        return false;
    }
    if ((messageContent?.length ?? 0) > 2000) {
        return false;
    }
    const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
    if (index > -1) {
        if (includeBots !== undefined)
            config.threadChannels[index].includeBots = includeBots;
        if (archiveImmediately !== undefined)
            config.threadChannels[index].archiveImmediately = archiveImmediately;
        if (messageContent !== undefined)
            config.threadChannels[index].messageContent = messageContent;
    }
    else {
        config.threadChannels.push({ channelId, includeBots, archiveImmediately, messageContent });
    }
    return setConfig(guild, config);
}
exports.enableAutothreading = enableAutothreading;
function disableAutothreading(guild, channelId) {
    const config = getConfig(guild.id);
    if (!config || !config.threadChannels) {
        return false;
    }
    const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
    if (index > -1) {
        delete config.threadChannels[index];
    }
    return setConfig(guild, config);
}
exports.disableAutothreading = disableAutothreading;
function resetConfigToDefault(guildId) {
    const path = getGuildConfigPath(guildId);
    if (!fs.existsSync(path))
        return false;
    fs.rmSync(path);
    guildConfigsCache.delete(guildId);
    console.log(`Deleted data for guild ${guildId}`);
    return true;
}
exports.resetConfigToDefault = resetConfigToDefault;
function deleteConfigsFromUnknownServers(client) {
    if (!client.guilds.cache.size) {
        console.warn("No guilds available; skipping config deletion.");
        return;
    }
    if (!fs.existsSync(CONFIGS_PATH))
        return;
    const configFiles = fs.readdirSync(CONFIGS_PATH);
    configFiles.forEach(file => {
        const guildId = file.split(".")[0];
        if (!client.guilds.cache.has(guildId)) {
            resetConfigToDefault(guildId);
        }
    });
}
exports.deleteConfigsFromUnknownServers = deleteConfigsFromUnknownServers;
function readConfigFromFile(guildId) {
    const path = getGuildConfigPath(guildId);
    if (!fs.existsSync(path))
        return undefined;
    const jsonConfig = fs.readFileSync(path, { "encoding": "utf-8" });
    return JSON.parse(jsonConfig);
}
function getGuildConfigPath(guildId) {
    return `${CONFIGS_PATH}/${guildId}.json`;
}
function setConfig(guild, config) {
    if (!guild || !config)
        return false;
    const path = getGuildConfigPath(guild.id);
    if (!fs.existsSync(CONFIGS_PATH)) {
        fs.mkdirSync(CONFIGS_PATH);
    }
    config.threadChannels = config.threadChannels?.filter(val => val != null && val != undefined);
    // Only save messages that are different from the defaults
    const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
    if (defaultConfigCopy.messages && config.messages) {
        for (const [key, message] of Object.entries(config.messages)) {
            if (message !== defaultConfigCopy.messages[key])
                continue;
            delete config.messages[key];
        }
    }
    fs.writeFileSync(path, JSON.stringify(config), { encoding: "utf-8" });
    guildConfigsCache.set(guild.id, config);
    return true;
}
