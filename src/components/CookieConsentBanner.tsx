import { useCookieConsentContext } from '../context/CookieConsentContext'

export function CookieConsentBanner() {
  const { status, accept, decline } = useCookieConsentContext()

  if (status) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-cream-light/97 px-[30px] py-4 backdrop-blur-md shadow-[0_-6px_20px_rgba(31,61,43,.12)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          เว็บไซต์นี้ใช้ <strong className="text-forest">Google Analytics</strong> เพื่อเก็บข้อมูลการใช้งานแบบไม่ระบุตัวตน
          (เช่น หน้าที่เข้าชม อุปกรณ์ที่ใช้ ตำแหน่งโดยประมาณ) โดยนำไปวิเคราะห์เพื่อปรับปรุงเว็บไซต์เท่านั้น
          คุณสามารถเลือกปฏิเสธได้โดยไม่กระทบการใช้งาน
        </p>
        <div className="flex flex-shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={decline}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-cream"
          >
            ปฏิเสธ
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-gold transition-opacity hover:opacity-90"
          >
            ยอมรับ
          </button>
        </div>
      </div>
    </div>
  )
}
