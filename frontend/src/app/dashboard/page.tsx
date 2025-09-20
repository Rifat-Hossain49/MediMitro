import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import DashboardAppointments from '@/components/DashboardAppointments'
import {
  Calendar,
  Heart,
  Pill,
  AlertCircle,
  Plus,
  FileText,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Bell,
  Star,
  BarChart3,
  Zap
} from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  // Redirect admin users to admin dashboard
  if (session?.user?.role === 'admin') {
    redirect('/admin/dashboard')
  }

  const displayName = session.user.name?.split(' ')[0] || 'there'

  const healthMetrics = [
    {
      title: 'Total Appointments',
      value: '0',
      unit: 'this year',
      icon: Calendar,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      change: '--',
      trend: 'up'
    },
    {
      title: 'Active Prescriptions',
      value: '0',
      unit: 'medications',
      icon: Pill,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      change: '--',
      trend: 'up'
    },
    {
      title: 'Health Records',
      value: '0',
      unit: 'documents',
      icon: FileText,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      change: '--',
      trend: 'up'
    },
    {
      title: 'Health Score',
      value: '--',
      unit: 'out of 100',
      icon: Activity,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      change: '--',
      trend: 'up'
    },
  ]

  // Appointments will be fetched by DashboardAppointments component

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule with specialists',
      icon: Calendar,
      href: '/appointments',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Health Records',
      description: 'View your EHR data',
      icon: FileText,
      href: '/ehr',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Medications',
      description: 'Track prescriptions',
      icon: Pill,
      href: '/meds',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Emergency',
      description: '24/7 urgent care',
      icon: AlertCircle,
      href: '/ambulance',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-600 to-red-700'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-500 rounded-xl shadow-lg border-2 border-white border-opacity-30">
                    <Heart className="w-8 h-8 text-white filter drop-shadow-lg" strokeWidth={2} fill="currentColor" />
                  </div>
                  <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Welcome back, {displayName}!</h1>
                </div>
                <p className="text-xl text-white mb-6 font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Your personalized health dashboard - track, manage, and improve your wellbeing</p>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-white font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>All systems healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-white filter drop-shadow-md" strokeWidth={2} />
                    <span className="text-white font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Last updated: Today</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{/* Rest of content will go here */}

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <div key={metric.title} className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-gray-300 p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 h-full flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 bg-gradient-to-br ${metric.bgGradient} rounded-xl group-hover:scale-110 transition-transform shadow-lg border border-white border-opacity-20`}>
                    <metric.icon className="w-8 h-8 text-white filter drop-shadow-lg" strokeWidth={2} fill="currentColor" />
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 text-sm font-bold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                      <span>{metric.change}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">{metric.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-sm text-gray-600 font-semibold">{metric.unit}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar simulation */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${metric.bgGradient} h-3 rounded-full transition-all duration-1000 shadow-sm`}
                    style={{ width: `${Math.min(parseInt(metric.value) || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Access your most used features instantly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <a
                key={action.title}
                href={action.href}
                className="group block h-full"
              >
                <div className={`bg-gradient-to-br ${action.gradient} hover:bg-gradient-to-br hover:${action.hoverGradient} rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between min-h-[200px]`}>
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl group-hover:bg-opacity-90 transition-all shadow-lg border-2 border-white border-opacity-30">
                        <action.icon className="w-8 h-8 text-white filter drop-shadow-lg" strokeWidth={2} fill="currentColor" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-white opacity-60 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all filter drop-shadow-lg" strokeWidth={2.5} />
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{action.title}</h3>
                      <p className="text-white text-sm leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{action.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-bold text-white">
                    <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <DashboardAppointments />
          </div>

          {/* Enhanced Activity & Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center py-6 md:py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Activity className="w-8 h-8 text-green-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-sm text-gray-700 font-medium">Your activity will appear here as you use MediMitra.</p>
                </div>
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Health Insights</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">Overall Health Score</span>
                    <span className="text-lg font-bold text-gray-900">Not available</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 font-medium">Complete your profile to see your health score.</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" strokeWidth={2} />
                    <span className="text-sm font-bold text-gray-900">Next Checkup</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">No upcoming checkup scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Health Tips */}
        <div className="mt-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-yellow-500 rounded-2xl shadow-lg border-2 border-white border-opacity-30">
                <Sparkles className="w-8 h-8 text-white filter drop-shadow-lg" strokeWidth={2} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Daily Wellness Tip</h3>
                <p className="text-white font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Personalized health advice for you</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-3 bg-pink-500 rounded-xl shadow-lg border-2 border-white border-opacity-30">
                <Heart className="w-8 h-8 text-white animate-pulse filter drop-shadow-lg" strokeWidth={2} fill="currentColor" />
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0 shadow-lg">
                <Shield className="w-6 h-6 text-white filter drop-shadow-sm" strokeWidth={2} fill="currentColor" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-3 text-gray-900">Stay Hydrated for Optimal Health</h4>
                <p className="text-gray-700 text-base leading-relaxed font-medium">
                  Drinking 8-10 glasses of water daily helps maintain your body&apos;s vital functions, keeps your skin healthy,
                  and boosts your immune system. Try setting hourly reminders to stay on track!
                </p>
                <div className="mt-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" strokeWidth={2} />
                    <span className="text-sm text-gray-700 font-semibold">Health Score Impact: +5 points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    <span className="text-sm text-gray-700 font-semibold">Daily Goal: 8 glasses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

