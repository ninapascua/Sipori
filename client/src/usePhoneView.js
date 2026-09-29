import { useEffect, useState } from 'react'

export default function usePhoneView() {
  const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 599px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 599px)')
    const update = () => setPhone(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return phone
}
