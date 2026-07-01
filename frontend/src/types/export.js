/**
 * @fileoverview Export domain type definitions (JSDoc only — no TypeScript).
 *
 * @typedef {'srt'|'vtt'|'mp4'} ExportFormat
 *
 * @typedef {Object} ExportRequest
 * @property {ExportFormat} format
 *
 * @typedef {Object} ExportResponse
 * @property {string}       download_url
 * @property {ExportFormat} format
 * @property {string}       filename
 */
