export const ALL_REGIONS_KEY = 'all'

const ACTIVITY_ICONS: Record<string, string> = {
  น้ำตก: '💧',
  waterfall: '💧',
  ดูสัตว์: '🦌',
  wildlife: '🦌',
  เดินป่า: '🥾',
  hiking: '🥾',
  ตั้งแคมป์: '⛺',
  camping: '⛺',
  ดำน้ำ: '🤿',
  diving: '🤿',
  ชายหาด: '🏖️',
  beach: '🏖️',
  ล่องแพ: '🛶',
  rafting: '🛶',
  ดูนก: '🦜',
  birding: '🦜',
  จุดชมวิว: '🌄',
  viewpoint: '🌄',
}

export function activityIcon(activity: string): string {
  return ACTIVITY_ICONS[activity.trim()] ?? ACTIVITY_ICONS[activity.trim().toLowerCase()] ?? '🌿'
}

const ATTRACTION_TYPE_ICONS: Record<string, string> = {
  น้ำตก: '💧',
  waterfall: '💧',
  หาด: '🏖️',
  beach: '🏖️',
  จุดชมวิว: '🌄',
  viewpoint: '🌄',
  ถ้ำ: '🕳️',
  cave: '🕳️',
  ยอดเขา: '⛰️',
  summit: '⛰️',
  น้ำพุร้อน: '♨️',
  hotspring: '♨️',
}

export function attractionTypeIcon(type: string | null): string {
  if (!type) return '📍'
  return ATTRACTION_TYPE_ICONS[type.trim()] ?? ATTRACTION_TYPE_ICONS[type.trim().toLowerCase()] ?? '📍'
}

const DIFFICULTY_LABELS: Record<string, { label: string; className: string }> = {
  easy: { label: 'ง่าย', className: 'bg-forest-light text-forest' },
  ง่าย: { label: 'ง่าย', className: 'bg-forest-light text-forest' },
  moderate: { label: 'ปานกลาง', className: 'bg-amber-100 text-amber-800' },
  ปานกลาง: { label: 'ปานกลาง', className: 'bg-amber-100 text-amber-800' },
  hard: { label: 'ยาก', className: 'bg-orange-100 text-clay' },
  ยาก: { label: 'ยาก', className: 'bg-orange-100 text-clay' },
}

export function difficultyInfo(difficulty: string | null) {
  if (!difficulty) return { label: difficulty ?? '-', className: 'bg-forest-light text-ink-soft' }
  const key = difficulty.trim().toLowerCase()
  return (
    DIFFICULTY_LABELS[difficulty.trim()] ??
    DIFFICULTY_LABELS[key] ?? { label: difficulty, className: 'bg-forest-light text-ink-soft' }
  )
}

const FACILITY_ICONS: Record<string, string> = {
  ที่จอดรถ: '🅿️',
  parking: '🅿️',
  ร้านค้า: '🛒',
  shop: '🛒',
  ห้องน้ำ: '🚿',
  restroom: '🚿',
  toilet: '🚿',
  ที่พัก: '🏕️',
  accommodation: '🏕️',
  ลานกางเต็นท์: '⛺',
  camping: '⛺',
  ร้านอาหาร: '🍽️',
  restaurant: '🍽️',
  ศูนย์บริการนักท่องเที่ยว: 'ℹ️',
  'visitor center': 'ℹ️',
}

export function facilityIcon(facility: string): string {
  return FACILITY_ICONS[facility.trim()] ?? FACILITY_ICONS[facility.trim().toLowerCase()] ?? '📌'
}

export type SortKey = 'popularity' | 'alpha' | 'distance'

export const SORT_OPTIONS: { key: SortKey; icon: string; label: string }[] = [
  { key: 'popularity', icon: '★', label: 'เรียงตามความนิยม' },
  { key: 'alpha', icon: '🔤', label: 'เรียงตามตัวอักษร' },
  { key: 'distance', icon: '📍', label: 'ใกล้ฉัน' },
]
