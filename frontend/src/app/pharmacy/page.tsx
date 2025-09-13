import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import PharmacyClient from './PharmacyClient'

export default async function Pharmacy() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return <PharmacyClient />
}


