/**
 * @typedef {Object} CaptionStyle
 * @property {string}  fontFamily
 * @property {number}  fontSize           - pixels
 * @property {number}  fontWeight         - 400 | 600 | 700
 * @property {string}  fontStyle          - 'normal' | 'italic'
 * @property {string}  textAlign          - 'left' | 'center' | 'right'
 * @property {string}  color              - hex, e.g. '#ffffff'
 * @property {string}  backgroundColor    - hex, e.g. '#000000'
 * @property {number}  backgroundOpacity  - 0–100
 */

/**
 * @typedef {Object} Caption
 * @property {number}        id
 * @property {number}        project_id
 * @property {number}        start          - seconds (float)
 * @property {number}        end            - seconds (float)
 * @property {string}        text
 * @property {number}        order
 * @property {Word[]}        words
 * @property {CaptionStyle}  [style]        - optional per-caption style overrides
 * @property {string}        created_at
 * @property {string}        updated_at
 *
 * @typedef {Object} Word
 * @property {string} word
 * @property {number} start
 * @property {number} end
 */
