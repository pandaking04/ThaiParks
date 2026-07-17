import { FEEDBACK_FORM_URL } from '../constants/links'
import { useCookieConsentContext } from '../context/CookieConsentContext'

export function FeedbackButton() {
  const { status } = useCookieConsentContext()

  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-clay text-white font-semibold text-sm shadow-[0_6px_20px_rgba(31,61,43,.25)] hover:brightness-105 transition-[bottom] ${
        status ? 'bottom-5' : 'bottom-28 sm:bottom-24'
      }`}
    >
      💬 <span>Feedback</span>
    </a>
  )
}
