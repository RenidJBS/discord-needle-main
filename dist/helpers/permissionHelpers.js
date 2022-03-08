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
exports.getSafeDefaultAutoArchiveDuration = exports.memberIsAdmin = exports.memberIsModerator = exports.getRequiredPermissions = void 0;
const discord_js_1 = require("discord.js");
function getRequiredPermissions() {
    const output = [
        discord_js_1.Permissions.FLAGS.VIEW_CHANNEL,
        discord_js_1.Permissions.FLAGS.SEND_MESSAGES,
        discord_js_1.Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
        discord_js_1.Permissions.FLAGS.CREATE_PUBLIC_THREADS,
        discord_js_1.Permissions.FLAGS.READ_MESSAGE_HISTORY,
    ];
    return output;
}
exports.getRequiredPermissions = getRequiredPermissions;
function memberIsModerator(member) {
    return member.permissions.has(discord_js_1.Permissions.FLAGS.KICK_MEMBERS);
}
exports.memberIsModerator = memberIsModerator;
function memberIsAdmin(member) {
    return member.permissions.has(discord_js_1.Permissions.FLAGS.ADMINISTRATOR);
}
exports.memberIsAdmin = memberIsAdmin;
// Fixes https://github.com/MarcusOtter/discord-needle/issues/23
// Should not be required, but Discord for some reason allows the default duration to be higher than the allowed value
function getSafeDefaultAutoArchiveDuration(channel) {
    const archiveDuration = channel.defaultAutoArchiveDuration;
    if (!archiveDuration || archiveDuration === "MAX")
        return "MAX";
    const highest = getHighestAllowedArchiveDuration(channel);
    return archiveDuration > highest
        ? highest
        : archiveDuration;
}
exports.getSafeDefaultAutoArchiveDuration = getSafeDefaultAutoArchiveDuration;
function getHighestAllowedArchiveDuration(channel) {
    if (channel.guild.features.includes("SEVEN_DAY_THREAD_ARCHIVE"))
        return 10080;
    if (channel.guild.features.includes("THREE_DAY_THREAD_ARCHIVE"))
        return 4320;
    return 1440; // 1d
}
