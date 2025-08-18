import { Heart, Shield, Calendar, FileText, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

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

function LandingContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-12 h-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-bounce flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              Your Health,
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent block">
                Your Medical Companion
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              AI-powered healthcare management with 24/7 emergency support
            </p>
            
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2">
                  <span className="flex items-center gap-3">
                    Get Started Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link href="/auth/signin">
                <button className="group bg-white text-gray-900 px-12 py-6 rounded-2xl text-xl font-bold border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2">
                  <span className="flex items-center gap-3">
                    Sign In
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute right-10 top-20 hidden lg:block animate-float pointer-events-none opacity-20">
          <Image src="/globe.svg" alt="Decorative globe" width={300} height={300} />
        </div>
        <div className="absolute left-10 bottom-20 hidden lg:block animate-float pointer-events-none opacity-10" style={{animationDelay: '1s'}}>
          <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-xl"></div>
        </div>
        <div className="absolute right-1/4 bottom-10 hidden lg:block animate-float pointer-events-none opacity-15" style={{animationDelay: '2s'}}>
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-lg"></div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Better Health
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Appointments</h3>
              <p className="text-gray-600 text-lg">
                AI-powered scheduling with 5,000+ doctors and instant booking
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Care</h3>
              <p className="text-gray-600 text-lg">
                8-minute ambulance response with GPS tracking and hospital alerts
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Health Assistant</h3>
              <p className="text-gray-600 text-lg">
                96% accurate symptom checking and personalized health insights
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}


