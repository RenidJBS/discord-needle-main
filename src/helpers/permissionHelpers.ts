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

import { type GuildMember, type NewsChannel, Permissions, type TextChannel, type ThreadAutoArchiveDuration } from "discord.js";

export function getRequiredPermissions(): bigint[] {
	const output = [
		Permissions.FLAGS.VIEW_CHANNEL,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
		Permissions.FLAGS.CREATE_PUBLIC_THREADS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
	];

	return output;
}

export function memberIsModerator(member: GuildMember): boolean {
	return member.permissions.has(Permissions.FLAGS.KICK_MEMBERS);
}

export function memberIsAdmin(member: GuildMember): boolean {
	return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
}

// Fixes https://github.com/MarcusOtter/discord-needle/issues/23
// Should not be required, but Discord for some reason allows the default duration to be higher than the allowed value
export function getSafeDefaultAutoArchiveDuration(channel: TextChannel | NewsChannel): ThreadAutoArchiveDuration {
	const archiveDuration = channel.defaultAutoArchiveDuration;
	if (!archiveDuration || archiveDuration === "MAX") return "MAX";

	const highest = getHighestAllowedArchiveDuration(channel);
	return archiveDuration > highest
		? highest
		: archiveDuration;
}

function getHighestAllowedArchiveDuration(channel: TextChannel | NewsChannel) {
	if (channel.guild.features.includes("SEVEN_DAY_THREAD_ARCHIVE")) return 10080;
	if (channel.guild.features.includes("THREE_DAY_THREAD_ARCHIVE")) return 4320;

	return 1440; // 1d
}
