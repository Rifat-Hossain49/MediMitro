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
  Users
} from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const displayName = session.user.name?.split(' ')[0] || 'there'

  const healthMetrics = [
    { title: 'Appointments', value: '12', unit: 'this year', icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { title: 'Prescriptions', value: '3', unit: 'active', icon: Pill, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { title: 'Health Records', value: '8', unit: 'documents', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50' },
    { title: 'Specialists', value: '4', unit: 'consulted', icon: Users, color: 'text-orange-500', bgColor: 'bg-orange-50' },
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
    { title: 'Book Appointment', icon: Calendar, href: '/appointments', color: 'bg-blue-500 hover:bg-blue-600' },
    { title: 'View Records', icon: FileText, href: '/records', color: 'bg-green-500 hover:bg-green-600' },
    { title: 'Find Doctors', icon: Users, href: '/doctors', color: 'bg-purple-500 hover:bg-purple-600' },
    { title: 'Emergency', icon: AlertCircle, href: '/emergency', color: 'bg-red-500 hover:bg-red-600' },
  ]

  return (
    <div className="min-h-screen">
      <main className="py-2">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {displayName}!</h1>
          <p className="text-gray-600">Here&apos;s your health overview for today</p>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric) => (
            <div key={metric.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <span className="ml-1 text-sm text-gray-600">{metric.unit}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Book New</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={appointment.image}
                          alt={appointment.doctor}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.doctor}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">{appointment.date}</span>
                          <span className="text-sm text-gray-500">{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Appointment confirmed with Dr. Johnson</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Health records updated</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New medication prescribed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Daily Health Tip</h3>
              <p className="text-blue-100">
                Stay hydrated! Drinking 8 glasses of water daily helps maintain your body&apos;s vital functions and keeps your skin healthy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

