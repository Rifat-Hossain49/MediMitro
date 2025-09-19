import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import LandingContent from '@/components/LandingContent'

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <LandingContent />
    </div>
  )
}


