// Mapeo de SF Symbol names (iOS) → emoji (web)
const SF_TO_EMOJI: Record<string, string> = {
  // Income
  'briefcase.fill':              '💼',
  'laptopcomputer':              '💻',
  'chart.line.uptrend.xyaxis':   '📈',
  'house.fill':                  '🏠',
  'star.fill':                   '⭐',
  'plus.circle.fill':            '➕',
  // Expense
  'fork.knife':                  '🍽️',
  'car.fill':                    '🚗',
  'tv.fill':                     '📺',
  'heart.fill':                  '❤️',
  'book.fill':                   '📚',
  'lightbulb.fill':              '💡',
  'bag.fill':                    '🛍️',
  'fork.knife.circle.fill':      '🍴',
  'bolt.fill':                   '⚡',
  'pawprint.fill':               '🐾',
  'iphone':                      '📱',
  'ellipsis.circle.fill':        '•••',
  // Savings
  'airplane':                    '✈️',
  'graduationcap.fill':          '🎓',
  'gift.fill':                   '🎁',
  'gamecontroller.fill':         '🎮',
  'camera.fill':                 '📷',
  'music.note':                  '🎵',
  'dumbbell.fill':               '🏋️',
  'globe.americas.fill':         '🌎',
  'target':                      '🎯',
}

export function sfToEmoji(icon: string): string {
  return SF_TO_EMOJI[icon] ?? icon
}

// Categorías por defecto para billeteras nuevas
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Sueldo',      icon: '💰', color_hex: '#00C57A', type: 'income' as const },
  { name: 'Freelance',   icon: '💻', color_hex: '#5856D6', type: 'income' as const },
  { name: 'Inversiones', icon: '📈', color_hex: '#FF9500', type: 'income' as const },
  { name: 'Otros',       icon: '➕', color_hex: '#8E8E93', type: 'income' as const },
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Comida',           icon: '🍜', color_hex: '#FF3B30', type: 'expense' as const },
  { name: 'Salidas',          icon: '🍻', color_hex: '#FF6B6B', type: 'expense' as const },
  { name: 'Bencina',          icon: '⛽', color_hex: '#FF9500', type: 'expense' as const },
  { name: 'Bip',              icon: '🪪', color_hex: '#007AFF', type: 'expense' as const },
  { name: 'Estacionamiento',  icon: '🅿️', color_hex: '#636366', type: 'expense' as const },
  { name: 'Casa',             icon: '🏠', color_hex: '#34C759', type: 'expense' as const },
  { name: 'Aseo hogar',       icon: '🚽', color_hex: '#5AC8FA', type: 'expense' as const },
  { name: 'Ropa',             icon: '🧥', color_hex: '#5856D6', type: 'expense' as const },
  { name: 'Salud',            icon: '💉', color_hex: '#FF2D55', type: 'expense' as const },
  { name: 'Mascotas',         icon: '🐶', color_hex: '#A0522D', type: 'expense' as const },
  { name: 'Seguro',           icon: '🧷', color_hex: '#FFCC00', type: 'expense' as const },
  { name: 'Cuentas básicas',  icon: '🧾', color_hex: '#AF52DE', type: 'expense' as const },
  { name: 'Deuda',            icon: '🏦', color_hex: '#FF3B30', type: 'expense' as const },
  { name: 'Diezmo',           icon: '⛪', color_hex: '#8E8E93', type: 'expense' as const },
  { name: 'Ofrenda',          icon: '✝️', color_hex: '#A0522D', type: 'expense' as const },
  { name: 'Regalos',          icon: '🎁', color_hex: '#5AC8FA', type: 'expense' as const },
  { name: 'Ahorro',           icon: '💸', color_hex: '#00C57A', type: 'expense' as const },
  { name: 'Otros',            icon: '•••', color_hex: '#8E8E93', type: 'expense' as const },
]

export const PRESET_GOAL_ICONS = ['✈️','🏠','🚗','🎓','🎁','❤️','🎮','📷','🎵','🏋️','🐾','🌎']
export const PRESET_COLORS = [
  '#00C57A','#007AFF','#FF9500','#FF3B30',
  '#AF52DE','#5856D6','#FF2D55','#34C759',
  '#5AC8FA','#FFCC00','#FF6B6B','#A0522D',
]

export const CATEGORY_ICONS = [
  '💼','💻','📈','🏠','⭐','🍽️','🚗','📺','❤️','📚',
  '💡','🛍️','🍴','⚡','🐾','📱','✈️','🎓','🎁','🎮',
  '📷','🎵','🏋️','🌎','🎯','🏥','⚽','🎨','🧴','🛒',
]
