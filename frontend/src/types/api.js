/**
 * @fileoverview Generic API response type definitions (JSDoc only).
 *
 * @typedef {Object} ApiSuccess
 * @property {*}       data
 * @property {string}  [message]
 *
 * @typedef {Object} ApiError
 * @property {string}             message
 * @property {Object.<string, string[]>} [errors]  - Validation errors (422)
 *
 * @typedef {Object} PaginatedResponse
 * @property {Array}   data
 * @property {number}  total
 * @property {number}  per_page
 * @property {number}  current_page
 * @property {number}  last_page
 */
