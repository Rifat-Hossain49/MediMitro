import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { auth } from '@/auth'
import Providers from '@/components/Providers'
import { UserProvider } from '@/contexts/UserContext'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import Navigation from '@/components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediMitro',
  description: 'Your comprehensive digital health platform for better healthcare management',
  keywords: 'health, medical, digital health, healthcare, telemedicine',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <UserProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
              <Navigation />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
                {session?.user && <Sidebar />}
                <main className={session?.user ? "flex-1" : "w-full"}>
                  {children}
                </main>
              </div>
            </div>
            <Footer />
          </UserProvider>
        </Providers>
      </body>
    </html>
  )
}
