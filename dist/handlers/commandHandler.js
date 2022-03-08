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
exports.getCommand = exports.getAllLoadedCommands = exports.getOrLoadAllCommands = exports.handleButtonClickedInteraction = exports.handleCommandInteraction = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const messageHelpers_1 = require("../helpers/messageHelpers");
const COMMANDS_PATH = (0, path_1.resolve)(__dirname, "../commands");
let loadedCommands = [];
function handleCommandInteraction(interaction) {
    const command = getCommand(interaction.commandName);
    if (!command)
        return Promise.reject();
    try {
        return command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    }
}
exports.handleCommandInteraction = handleCommandInteraction;
async function handleButtonClickedInteraction(interaction) {
    const command = getCommand(interaction.customId);
    if (!command)
        return Promise.reject();
    try {
        return command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        return (0, messageHelpers_1.interactionReply)(interaction, (0, messageHelpers_1.getMessage)("ERR_UNKNOWN"));
    }
}
exports.handleButtonClickedInteraction = handleButtonClickedInteraction;
async function getOrLoadAllCommands(allowCache = true) {
    if (loadedCommands.length > 0 && allowCache) {
        return loadedCommands;
    }
    console.log("Started reloading commands from disk.");
    const commandFiles = await fs_1.promises.readdir(COMMANDS_PATH);
    commandFiles.filter(file => file.endsWith(".js"));
    const output = [];
    for (const file of commandFiles) {
        const { command } = await Promise.resolve().then(() => require(`${COMMANDS_PATH}/${file}`));
        output.push(command);
    }
    console.log("Successfully reloaded commands from disk.");
    loadedCommands = output;
    return output;
}
exports.getOrLoadAllCommands = getOrLoadAllCommands;
function getAllLoadedCommands() {
    if (loadedCommands.length === 0) {
        console.error("No commands found. Did you forget to invoke \"getOrLoadAllCommands()\"?");
    }
    return loadedCommands;
}
exports.getAllLoadedCommands = getAllLoadedCommands;
function getCommand(commandName) {
    if (loadedCommands.length === 0) {
        console.error("No commands found. Did you forget to invoke \"getOrLoadAllCommands()\"?");
    }
    return loadedCommands.find(command => command.name === commandName);
}
exports.getCommand = getCommand;
