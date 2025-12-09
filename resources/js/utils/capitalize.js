/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The string with each word capitalized
 */
export function capitalizeWords(str) {
    if (!str || typeof str !== 'string') return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
}

export default capitalize;
