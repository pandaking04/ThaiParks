import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSavedParksContext } from '../context/SavedParksContext'
import { FEEDBACK_FORM_URL } from '../constants/links'

export function Navbar() {
  const { savedCount } = useSavedParksContext()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`sticky top-0 z-40 flex items-center justify-between px-[30px] py-3.5 bg-cream-light/92 backdrop-blur-md border-b transition-shadow ${
        scrolled ? 'shadow-[0_6px_20px_rgba(31,61,43,.1)] border-transparent' : 'shadow-none border-black/8'
      }`}
    >
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-[9px] bg-forest flex items-center justify-center text-gold font-semibold text-[15px] font-mono">
          ▲
        </div>
        <div className="font-semibold text-[17px] font-heading text-forest tracking-tight">
          อุทยาน<span className="text-clay">ไทย</span>
        </div>
      </Link>
      <div className="flex items-center gap-3 flex-shrink-0">
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/10 font-semibold text-[13px] text-forest whitespace-nowrap hover:border-clay/40 transition"
        >
          💬 <span>Feedback</span>
        </a>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/10 font-semibold text-[13px] text-forest whitespace-nowrap">
          ♥ <span>ที่บันทึก</span>
          <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-clay text-white text-[11px] font-mono font-semibold inline-flex items-center justify-center">
            {savedCount}
          </span>
        </div>
      </div>
    </div>
  )
}
