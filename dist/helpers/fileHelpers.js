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
exports.createJsonMessageAttachment = void 0;
const discord_js_1 = require("discord.js");
const stream_1 = require("stream");
function createJsonMessageAttachment(obj, fileName, indentation = 2) {
    const stream = stream_1.Readable.from(JSON.stringify(obj, undefined, indentation), { encoding: "utf-8" });
    return new discord_js_1.MessageAttachment(stream, fileName);
}
exports.createJsonMessageAttachment = createJsonMessageAttachment;
