/**
 * @fileoverview Caption domain type definitions (JSDoc only — no TypeScript).
 *
 * @typedef {Object} Caption
 * @property {number}   id
 * @property {number}   project_id
 * @property {number}   start        - Start time in seconds (float)
 * @property {number}   end          - End time in seconds (float)
 * @property {string}   text         - Caption text
 * @property {number}   order        - Display order index
 * @property {Word[]}   words        - Word-level timestamps (from Whisper)
 * @property {string}   created_at
 * @property {string}   updated_at
 *
 * @typedef {Object} Word
 * @property {string} word
 * @property {number} start  - Start time in seconds
 * @property {number} end    - End time in seconds
 */
