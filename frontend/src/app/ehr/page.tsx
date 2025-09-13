import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import ClientEhr from '@/components/ehr/ClientEhr'

export default async function EHRPage() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return <ClientEhr />
}


