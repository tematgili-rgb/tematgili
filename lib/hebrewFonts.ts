export interface HebrewFontOption {
  family: string
  url: string
  category: 'sans' | 'serif' | 'display' | 'script'
  description: string
}

function googleUrl(family: string): string {
  const encoded = family.trim().replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`
}

const RAW: Array<Omit<HebrewFontOption, 'url'>> = [
  { family: 'Heebo',             category: 'sans',    description: 'מודרני, ברירת מחדל' },
  { family: 'Rubik',             category: 'sans',    description: 'ידידותי, מעוגל' },
  { family: 'Assistant',         category: 'sans',    description: 'ניטרלי וקריא' },
  { family: 'Varela Round',      category: 'sans',    description: 'מעוגל, רך' },
  { family: 'Secular One',       category: 'display', description: 'דיספליי, בולט' },
  { family: 'Suez One',          category: 'display', description: 'סריף דיספליי' },
  { family: 'Frank Ruhl Libre',  category: 'serif',   description: 'סריף ערוך, ספרותי' },
  { family: 'David Libre',       category: 'serif',   description: 'סריף מסורתי' },
  { family: 'Alef',              category: 'sans',    description: 'גיאומטרי, נקי' },
  { family: 'Karantina',         category: 'display', description: 'דקורטיבי' },
  { family: 'Bellefair',         category: 'serif',   description: 'סריף אלגנטי' },
  { family: 'Miriam Libre',      category: 'sans',    description: 'קל, אוורירי' },
  { family: 'Noto Sans Hebrew',  category: 'sans',    description: 'סנס ניטרלי' },
  { family: 'Noto Serif Hebrew', category: 'serif',   description: 'סריף מודרני' },
  { family: 'Noto Rashi Hebrew', category: 'script',  description: 'סגנון רש"י' },
  { family: 'Tinos',             category: 'serif',   description: 'סריף קלאסי' },
  { family: 'Arimo',             category: 'sans',    description: 'סנס קריא' },
]

export const HEBREW_FONTS: HebrewFontOption[] = RAW.map((f) => ({
  ...f,
  url: googleUrl(f.family),
}))

export const HEBREW_FONT_SAMPLE = 'עיצוב מתוק ואישי לאירועים שלך'
