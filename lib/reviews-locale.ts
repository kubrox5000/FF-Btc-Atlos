import { t, type TKey } from './i18n'
import type { Lang } from './currencies'

// Maps a reviewer name (stable seed data) to the localized title/comment keys.
const REVIEW_KEY: Record<string, { title: TKey; comment: TKey }> = {
  'Yasmin Bilal': { title: 'r1_title', comment: 'r1_comment' },
  'Ahmed Reza': { title: 'r2_title', comment: 'r2_comment' },
  'Lina Hassan': { title: 'r3_title', comment: 'r3_comment' },
  'Miguel Santos': { title: 'r4_title', comment: 'r4_comment' },
  'Priya Nair': { title: 'r5_title', comment: 'r5_comment' },
  'Carlos Mendez': { title: 'r6_title', comment: 'r6_comment' },
  'Tomas Rivera': { title: 'r7_title', comment: 'r7_comment' },
  'Sara Khalil': { title: 'r8_title', comment: 'r8_comment' },
  'Diego Alvarez': { title: 'r9_title', comment: 'r9_comment' },
  'Omar Bennis': { title: 'r10_title', comment: 'r10_comment' },
  'Fatima Zohra': { title: 'r11_title', comment: 'r11_comment' },
  'James Carter': { title: 'r12_title', comment: 'r12_comment' },
  'Minh Nguyen': { title: 'r13_title', comment: 'r13_comment' },
  'Aisha Karim': { title: 'r14_title', comment: 'r14_comment' },
  'Kenji Sato': { title: 'r15_title', comment: 'r15_comment' },
  'Salma Hussein': { title: 'r16_title', comment: 'r16_comment' },
  'Youssef Amrani': { title: 'r17_title', comment: 'r17_comment' },
  'Hikmat Ali': { title: 'r18_title', comment: 'r18_comment' },
  'Nour Karim': { title: 'r19_title', comment: 'r19_comment' },
  'Omar Diallo': { title: 'r20_title', comment: 'r20_comment' },
  'Zara Mansour': { title: 'r21_title', comment: 'r21_comment' },
  'Rania Fares': { title: 'r22_title', comment: 'r22_comment' },
  'Hala Nasser': { title: 'r23_title', comment: 'r23_comment' },
  'Karim Haddad': { title: 'r24_title', comment: 'r24_comment' },
  'Mohammed Alhazmi': { title: 'r25_title', comment: 'r25_comment' },
  'Yara Osman': { title: 'r26_title', comment: 'r26_comment' },
  'Bilal Ahmed': { title: 'r27_title', comment: 'r27_comment' },
  'Layla Benali': { title: 'r28_title', comment: 'r28_comment' },
  'Adam Williams': { title: 'r29_title', comment: 'r29_comment' },
  'Chloe Martin': { title: 'r30_title', comment: 'r30_comment' },
}

/**
 * Returns the review title/comment localized for the active language, falling
 * back to the database values when the reviewer is unknown.
 */
export function localizedReview(
  lang: Lang,
  name: string,
  fallbackTitle: string | null,
  fallbackComment: string,
): { title: string | null; comment: string } {
  const keys = REVIEW_KEY[name]
  if (!keys) return { title: fallbackTitle, comment: fallbackComment }
  return { title: t(lang, keys.title), comment: t(lang, keys.comment) }
}
