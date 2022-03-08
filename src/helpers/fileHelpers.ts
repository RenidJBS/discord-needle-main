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

import { MessageAttachment } from "discord.js";
import { Readable } from "stream";

export function createJsonMessageAttachment(obj: unknown, fileName: string, indentation = 2): MessageAttachment {
	const stream = Readable.from(JSON.stringify(obj, undefined, indentation), { encoding: "utf-8" });
	return new MessageAttachment(stream, fileName);
}
