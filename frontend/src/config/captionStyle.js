/** @type {import('@/types/caption').CaptionStyle} */
export const DEFAULT_CAPTION_STYLE = {
  fontFamily:        'Inter',
  fontSize:          24,
  fontWeight:        600,
  fontStyle:         'normal',
  textAlign:         'center',
  color:             '#ffffff',
  backgroundColor:   '#000000',
  backgroundOpacity: 0,
}

export const FONT_OPTIONS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact']
export const FONT_SIZES   = [14, 16, 18, 20, 24, 28, 32, 40, 48]

/** @type {Array<{label:string, style: Partial<import('@/types/caption').CaptionStyle>}>} */
export const STYLE_PRESETS = [
  {
    label: 'Bold',
    style: { fontWeight: 700, fontStyle: 'normal', color: '#ffffff', backgroundColor: '#000000', backgroundOpacity: 0 },
  },
  {
    label: 'Karaoke',
    style: { fontWeight: 700, fontStyle: 'normal', color: '#facc15', backgroundColor: '#000000', backgroundOpacity: 70 },
  },
  {
    label: 'Classic',
    style: { fontWeight: 400, fontStyle: 'normal', color: '#ffffff', backgroundColor: '#000000', backgroundOpacity: 55 },
  },
  {
    label: 'Italic',
    style: { fontWeight: 400, fontStyle: 'italic', color: '#e2e8f0', backgroundColor: '#000000', backgroundOpacity: 0 },
  },
]
