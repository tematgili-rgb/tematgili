export interface HebrewFontOption {
  family: string
  url: string
  category: 'sans' | 'serif' | 'display' | 'script'
  description: string
  source?: 'google' | 'local'
}

function googleUrl(family: string): string {
  const encoded = family.trim().replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`
}

const RAW: Array<Omit<HebrewFontOption, 'url' | 'source'>> = [
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

const LOCAL: Array<Omit<HebrewFontOption, 'url' | 'source'>> = [
  { family: 'Drugulin CLM',  category: 'display', description: 'סריף מסורתי' },
  { family: 'Gladia CLM',    category: 'display', description: 'דקורטיבי מודרני' },
  { family: 'Hadasim CLM',   category: 'serif',   description: 'סריף קלאסי' },
  { family: 'Hillel CLM',    category: 'sans',    description: 'סנס מינימליסטי' },
  { family: 'Keter YG',      category: 'sans',    description: 'סנס מעוצב' },
  { family: 'Shofar',        category: 'display', description: 'דרמטי וחזק' },
  { family: 'Varela Extra',  category: 'sans',    description: 'סנס עגול קל' },
  { family: 'Haim Classic',  category: 'serif',   description: 'קלאסי חם' },
  { family: 'Abraham',       category: 'sans',    description: 'מודרני נקי' },
  { family: 'Moses Display', category: 'display', description: 'תצוגה מודרנית' },
  { family: 'FUP Galil',     category: 'sans',    description: 'סנס תעשייתי' },
  { family: 'Ogen',          category: 'sans',    description: 'מודרני רחב' },
  { family: 'Hayim',         category: 'display', description: 'סופרי דקורטיבי' },
  { family: 'Migdal',        category: 'display', description: 'מסורתי' },
  { family: 'OS Aran',       category: 'sans',    description: 'סנס עברי עכשווי' },
]

export const HEBREW_FONTS: HebrewFontOption[] = [
  ...RAW.map((f) => ({ ...f, url: googleUrl(f.family), source: 'google' as const })),
  ...LOCAL.map((f) => ({ ...f, url: '', source: 'local' as const })),
]

export const HEBREW_FONT_SAMPLE = 'עיצוב מתוק ואישי לאירועים שלך'
