// GSM 03.38 basic set and the extension set (extension characters cost two septets).
const GSM_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
const GSM_EXTENDED = '^{}\\[~]|€\f'

export interface SmsInfo {
  encoding: 'GSM-7' | 'UCS-2'
  /** Characters counted in the encoding's units. */
  length: number
  segments: number
  /** Units left in the current segment. */
  remaining: number
}

/** Segment count the carrier will bill. Multipart messages lose room to the UDH header. */
export function smsInfo(text: string): SmsInfo {
  const chars = [...text]
  const gsm = chars.every((ch) => GSM_BASIC.includes(ch) || GSM_EXTENDED.includes(ch))
  if (gsm) {
    const length = chars.reduce((n, ch) => n + (GSM_EXTENDED.includes(ch) ? 2 : 1), 0)
    const segments = length <= 160 ? 1 : Math.ceil(length / 153)
    return { encoding: 'GSM-7', length, segments: Math.max(1, segments), remaining: (segments <= 1 ? 160 : segments * 153) - length }
  }
  // UCS-2 counts UTF-16 code units; emoji take two.
  const length = text.length
  const segments = length <= 70 ? 1 : Math.ceil(length / 67)
  return { encoding: 'UCS-2', length, segments: Math.max(1, segments), remaining: (segments <= 1 ? 70 : segments * 67) - length }
}
