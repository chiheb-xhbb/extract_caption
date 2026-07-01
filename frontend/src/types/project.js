/**
 * @fileoverview Project domain type definitions (JSDoc only — no TypeScript).
 *
 * @typedef {Object} Project
 * @property {number}       id
 * @property {string}       name
 * @property {string|null}  description
 * @property {string|null}  video_path       - Relative path stored in DB
 * @property {string|null}  video_url        - Absolute URL for playback
 * @property {string}       status           - 'pending' | 'uploading' | 'transcribing' | 'ready' | 'error'
 * @property {number|null}  duration         - Duration in seconds
 * @property {string|null}  thumbnail_url
 * @property {string}       created_at       - ISO 8601
 * @property {string}       updated_at       - ISO 8601
 */

/**
 * @typedef {'pending'|'uploading'|'transcribing'|'ready'|'error'} ProjectStatus
 */
