'use client'

import dynamic from 'next/dynamic'

// زر الدعم العائم يُحمَّل بعد ظهور الصفحة (تحميل كسول) حتى لا يثقل
// الباقة الأولية — يظهر فور جاهزيته دون إبطاء فتح الموقع على أي جهاز.
const FloatingSupport = dynamic(
  () => import('./FloatingSupport').then((m) => ({ default: m.FloatingSupport })),
  { ssr: false, loading: () => null },
)

export default FloatingSupport
