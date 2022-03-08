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
exports.handleInteractionCreate = void 0;
const messageHelpers_1 = require("../helpers/messageHelpers");
const commandHandler_1 = require("./commandHandler");
async function handleInteractionCreate(interaction) {
    (0, messageHelpers_1.addMessageContext)({
        user: interaction.user,
        interaction: interaction,
        channel: interaction.channel ?? undefined,
    });
    if (interaction.isCommand()) {
        await (0, commandHandler_1.handleCommandInteraction)(interaction);
    }
    else if (interaction.isButton()) {
        await (0, commandHandler_1.handleButtonClickedInteraction)(interaction);
    }
    (0, messageHelpers_1.resetMessageContext)();
}
exports.handleInteractionCreate = handleInteractionCreate;
