// utils/formatFieldName.js
export function formatFieldName(name = "") {
    if (!name || typeof name !== "string") return "";

    return name
        .replace(/_/g, " ") // replace underscores with spaces
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize each word
}

