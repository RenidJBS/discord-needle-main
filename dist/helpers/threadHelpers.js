"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEmojiForNewThread = exports.getEmojiStatus = exports.setEmojiStatus = exports.setThreadName = void 0;
const configHelpers_1 = require("./configHelpers");
// If that rate limit is hit, it will wait here until it is able to rename the thread.
function setThreadName(thread, name) {
    const emoji = getEmojiStatus(thread);
    const newName = emoji
        ? `${emoji} ${name}`
        : name;
    return thread.setName(newName);
}
exports.setThreadName = setThreadName;
// Preserves the prepended unicode emoji!
// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).
async function setEmojiStatus(thread, unicodeEmoji) {
    if (!isOneUnicodeEmoji(unicodeEmoji))
        return false;
    const currentEmoji = thread.name.split(" ")[0];
    // TODO: Check if there actually is a current emoji, if not just prepend the new emoji
    await thread.setName(thread.name.replace(currentEmoji, unicodeEmoji));
    return true;
}
exports.setEmojiStatus = setEmojiStatus;
function getEmojiStatus(thread) {
    const emoji = thread.name.split(" ")[0];
    return isOneUnicodeEmoji(emoji) ? emoji : undefined;
}
exports.getEmojiStatus = getEmojiStatus;
function setEmojiForNewThread(thread, shouldBeNew) {
    const hasNewEmoji = thread.name.includes("🆕");
    if (shouldBeNew === hasNewEmoji)
        return Promise.resolve(thread);
    if (shouldBeNew && !(0, configHelpers_1.emojisEnabled)(thread.guild))
        return Promise.resolve(thread);
    return shouldBeNew
        ? thread.setName(`🆕 ${thread.name}`)
        : thread.setName(thread.name.replaceAll("🆕", ""));
}
exports.setEmojiForNewThread = setEmojiForNewThread;
// Derived from https://stackoverflow.com/a/64007175/10615308
function isOneUnicodeEmoji(text) {
    return /^\p{Extended_Pictographic}$/u.test(text);
}
