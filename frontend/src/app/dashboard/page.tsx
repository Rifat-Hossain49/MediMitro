import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
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

  const displayName = session.user.name?.split(' ')[0] || 'there'

  const healthMetrics = [
    { 
      title: 'Total Appointments', 
      value: '12', 
      unit: 'this year', 
      icon: Calendar, 
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      change: '+15%',
      trend: 'up'
    },
    { 
      title: 'Active Prescriptions', 
      value: '3', 
      unit: 'medications', 
      icon: Pill, 
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      change: '+2',
      trend: 'up'
    },
    { 
      title: 'Health Records', 
      value: '8', 
      unit: 'documents', 
      icon: FileText, 
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      change: '+3',
      trend: 'up'
    },
    { 
      title: 'Health Score', 
      value: '92', 
      unit: 'out of 100', 
      icon: Activity, 
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      change: '+8%',
      trend: 'up'
    },
  ]

  const upcomingAppointments = [
    { 
      doctor: 'Dr. Sarah Johnson', 
      specialty: 'Cardiology', 
      date: 'Today', 
      time: '2:30 PM', 
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    },
    { 
      doctor: 'Dr. Michael Chen', 
      specialty: 'Dermatology', 
      date: 'Tomorrow', 
      time: '10:00 AM', 
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face'
    },
    { 
      doctor: 'Dr. Emily Davis', 
      specialty: 'General Checkup', 
      date: 'Dec 15', 
      time: '9:00 AM', 
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1594824475546-7da6ba09d5c4?w=100&h=100&fit=crop&crop=face'
    },
  ]

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
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold">Welcome back, {displayName}!</h1>
                </div>
                <p className="text-xl text-blue-100 mb-6">Your personalized health dashboard - track, manage, and improve your wellbeing</p>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-100 font-medium">All systems healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100">Last updated: Today</span>
                  </div>
                </div>
              </div>
              
              {/* User Avatar Section */}
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white font-semibold">{session.user.name}</p>
                  <p className="text-blue-200 text-sm">Patient ID: #12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{/* Rest of content will go here */}

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <div key={metric.title} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-gray-200 p-8 transition-all duration-300 hover:shadow-xl transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 bg-gradient-to-br ${metric.bgGradient} rounded-xl group-hover:scale-110 transition-transform shadow-lg`}>
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>{metric.change}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{metric.title}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-sm text-gray-500 font-medium">{metric.unit}</span>
                </div>
              </div>
              
              {/* Progress bar simulation */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${metric.bgGradient} h-2 rounded-full transition-all duration-1000`}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <a
                key={action.title}
                href={action.href}
                className="group block"
              >
                <div className={`bg-gradient-to-br ${action.gradient} hover:bg-gradient-to-br hover:${action.hoverGradient} rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-white bg-opacity-20 rounded-xl group-hover:bg-opacity-30 transition-all">
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white text-opacity-90 text-sm">{action.description}</p>
                  
                  <div className="mt-4 flex items-center text-sm font-medium">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Appointments</h2>
                  <p className="text-gray-600">Your scheduled medical consultations</p>
                </div>
                <a 
                  href="/appointments"
                  className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Book New</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all" />
                </a>
              </div>
              
              <div className="space-y-6">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:scale-102">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
                          <Image
                            src={appointment.image}
                            alt={appointment.doctor}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{appointment.doctor}</h3>
                          <p className="text-blue-600 font-semibold mb-2">{appointment.specialty}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          appointment.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'Confirmed' && (
                          <div className="flex items-center space-x-1 mt-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Activity & Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-green-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Appointment confirmed</p>
                    <p className="text-xs text-gray-600">Dr. Johnson • Cardiology</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Health records updated</p>
                    <p className="text-xs text-gray-600">3 new documents added</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-purple-100">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Pill className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">New prescription</p>
                    <p className="text-xs text-gray-600">Blood pressure medication</p>
                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Health Insights</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Overall Health Score</span>
                    <span className="text-lg font-bold text-purple-600">92/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Excellent! Keep up the good work.</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-900">Next Checkup</span>
                  </div>
                  <p className="text-xs text-gray-600">Annual physical exam due in 2 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Health Tips */}
        <div className="mt-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Daily Wellness Tip</h3>
                <p className="text-purple-100">Personalized health advice for you</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-3 bg-white bg-opacity-10 rounded-xl">
                <Heart className="w-8 h-8 text-pink-200 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-200 bg-opacity-30 rounded-lg">
                <Shield className="w-6 h-6 text-blue-100" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Stay Hydrated for Optimal Health</h4>
                <p className="text-purple-100 text-sm leading-relaxed">
                  Drinking 8-10 glasses of water daily helps maintain your body&apos;s vital functions, keeps your skin healthy, 
                  and boosts your immune system. Try setting hourly reminders to stay on track!
                </p>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs text-purple-100">Health Score Impact: +5 points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-200" />
                    <span className="text-xs text-purple-100">Daily Goal: 8 glasses</span>
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

