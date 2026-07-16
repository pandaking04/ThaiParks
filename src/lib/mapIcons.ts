import L from 'leaflet'

export function createEmojiPin(emoji: string, opts?: { size?: number; bg?: string }): L.DivIcon {
  const size = opts?.size ?? 34
  const bg = opts?.bg ?? '#1f3d2b'
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(31,61,43,.35);border:2px solid #fff">
      <span style="transform:rotate(45deg);font-size:${size * 0.5}px;line-height:1">${emoji}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export function createUserLocationPin(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:18px;height:18px">
      <div class="pulse-ring" style="position:absolute;inset:0;border-radius:50%;background:#c56a2a"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:#c56a2a;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.15)"></div>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  })
}
