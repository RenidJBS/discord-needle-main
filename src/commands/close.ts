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

import { SlashCommandBuilder } from "@discordjs/builders";
import { type CommandInteraction, GuildMember, type MessageComponentInteraction, Permissions, type ThreadChannel } from "discord.js";
import { shouldArchiveImmediately } from "../helpers/configHelpers";
import { interactionReply, getMessage, getThreadAuthor } from "../helpers/messageHelpers";
import { setEmojiForNewThread } from "../helpers/threadHelpers";
import type { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "close",
	shortHelpDescription: "Closes a thread by setting the auto-archive duration to 1 hour",
	longHelpDescription: "The close command sets the auto-archive duration to 1 hour in a thread.\n\nWhen using auto-archive, the thread will automatically be archived when there have been no new messages in the thread for one hour. This can be undone by a server moderator by manually changing the auto-archive duration back to what it was previously, using Discord's own interface.",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("close")
			.setDescription("Closes a thread by setting the auto-archive duration to 1 hour")
			.toJSON();
	},

	async execute(interaction: CommandInteraction | MessageComponentInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
		}

		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_THREAD"));
		}

		// Invoking slash commands seem to unarchive the threads for now so ironically, this has no effect
		// Leaving this in if Discord decides to change their API around this
		if (channel.archived) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
		}

		const hasManageThreadsPermissions = member.permissionsIn(channel).has(Permissions.FLAGS.MANAGE_THREADS, true);
		if (hasManageThreadsPermissions) {
			await archiveThread(channel);
			return;
		}

		const threadAuthor = await getThreadAuthor(channel);
		if (!threadAuthor) {
			return interactionReply(interaction, getMessage("ERR_AMBIGUOUS_THREAD_AUTHOR"));
		}

		if (threadAuthor !== interaction.user) {
			return interactionReply(interaction, getMessage("ERR_ONLY_THREAD_OWNER"));
		}

		await archiveThread(channel);

		async function archiveThread(thread: ThreadChannel): Promise<void> {
			if (shouldArchiveImmediately(thread)) {
				if (interaction.isButton()) {
					await interactionReply(interaction, "Success!");
					const message = getMessage("SUCCESS_THREAD_ARCHIVE_IMMEDIATE");
					if (message) {
						await thread.send(message);
					}
				}
				else if (interaction.isCommand()) {
					await interactionReply(interaction, getMessage("SUCCESS_THREAD_ARCHIVE_IMMEDIATE"), false);
				}

				await setEmojiForNewThread(thread, false);
				await thread.setArchived(true);
				return;
			}

			if (thread.autoArchiveDuration === 60) {
				return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
			}

			await setEmojiForNewThread(thread, false);
			await thread.setAutoArchiveDuration(60);

			if (interaction.isButton()) {
				await interactionReply(interaction, "Success!");
				const message = getMessage("SUCCESS_THREAD_ARCHIVE_SLOW");
				if (message) {
					await thread.send(message);
				}
			}
			else if (interaction.isCommand()) {
				await interactionReply(interaction, getMessage("SUCCESS_THREAD_ARCHIVE_SLOW"), false);
			}
		}
	},
};
