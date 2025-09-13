import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import ClientScheduler from '@/components/meds/ClientScheduler'

export default async function MedicationScheduler() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return <ClientScheduler />
}


