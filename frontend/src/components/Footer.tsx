import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold">M</span>
            <span className="text-sm">© {new Date().getFullYear()} MediMitro. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-gray-600 hover:text-gray-900">Privacy</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Terms</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Contact</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Docs</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}


