export const PRODUCT_CATEGORIES = [
  { id: 'coloring-book', name: 'חוברות צביעה',  icon: '📕', color: 'bg-primary-soft border-primary' },
  { id: 'snack-wrap',    name: 'עטיפות שוקולד',  icon: '🍫', color: 'bg-cream border-twine' },
  { id: 'popcorn-box',   name: 'קופסאות פופקורן', icon: '🍿', color: 'bg-primary-soft border-accent' },
  { id: 'party-hat',     name: 'כובעי מסיבה',     icon: '🎉', color: 'bg-cream border-primary' },
  { id: 'gift-box',      name: 'קופסאות מתנה',    icon: '🎁', color: 'bg-primary-soft border-twine' },
  { id: 'bottle-label',  name: 'תוויות לבקבוקים', icon: '🍼', color: 'bg-cream border-accent' },
  { id: 'backdrop-sign', name: 'שלטים ותפאורה',      icon: '🪧', color: 'bg-primary-soft border-primary' },
] as const

export const EVENT_TYPES = [
  { id: 'birthday',  name: 'יום הולדת',          emoji: '🎂' },
  { id: 'baby',      name: 'ברית / חינה',         emoji: '👶' },
  { id: 'school',    name: 'בית ספר / תיכון',    emoji: '🎓' },
  { id: 'business',  name: 'אירוע חברה',         emoji: '💼' },
  { id: 'wedding',   name: 'חתונה / אירוסין',    emoji: '💕' },
  { id: 'holidays',  name: 'חגים',                emoji: '✨' },
] as const

export const CONTACT_INFO = {
  phone: '052-479-6726',
  whatsapp: '972524796726',
  email: 'info@tematgili.co.il',
  instagram: 'https://www.instagram.com/tematgili/',
  facebook: '',
  workingHours: 'א-ה 09:00-21:00 | ו 09:00-13:00',
}

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tematgili@gmail.com'
export const SITE_NAME = 'תמתגילי'
export const SITE_TAGLINE = 'מיתוג לאירועים ומתנות'

export const LEAD_STATUSES = [
  { value: 'new',                label: 'חדש' },
  { value: 'answered',           label: 'נענה' },
  { value: 'called_no_answer',   label: 'התקשרנו - לא ענו' },
  { value: 'not_relevant',       label: 'לא רלוונטי' },
  { value: 'closed_deal',        label: 'עסקה סגורה' },
] as const
