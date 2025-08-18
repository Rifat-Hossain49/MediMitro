
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Search,
  Filter,
  Calendar,
  Activity
} from 'lucide-react'

export default function HealthRecordsPage() {
  const medicalHistory = [
    {
      id: 1,
      date: 'Dec 5, 2024',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Endocrinology',
      diagnosis: 'Type 2 Diabetes',
      treatment: 'Prescribed Metformin 500mg twice daily',
      status: 'Active',
      type: 'Consultation'
    },
    {
      id: 2,
      date: 'Nov 28, 2024',
      doctor: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      diagnosis: 'Eczema',
      treatment: 'Topical corticosteroid cream',
      status: 'Resolved',
      type: 'Follow-up'
    },
    {
      id: 3,
      date: 'Nov 15, 2024',
      doctor: 'Dr. Emily Davis',
      specialty: 'General Medicine',
      diagnosis: 'Annual Checkup',
      treatment: 'Routine blood work, all normal',
      status: 'Completed',
      type: 'Checkup'
    }
  ]

  const testResults = [
    {
      id: 1,
      testName: 'Complete Blood Count (CBC)',
      date: 'Dec 5, 2024',
      status: 'Normal',
      value: 'All parameters within normal range',
      lab: 'City Medical Lab'
    },
    {
      id: 2,
      testName: 'Lipid Profile',
      date: 'Dec 5, 2024',
      status: 'High Cholesterol',
      value: 'Total Cholesterol: 240 mg/dL',
      lab: 'City Medical Lab'
    },
    {
      id: 3,
      testName: 'HbA1c (Diabetes Screening)',
      date: 'Nov 30, 2024',
      status: 'Normal',
      value: '5.4% (Good glycemic control)',
      lab: 'City Medical Lab'
    }
  ]

  const medications = [
    {
      id: 1,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: 'Dec 5, 2024',
      endDate: 'Ongoing',
      status: 'Active',
      purpose: 'Diabetes management'
    },
    {
      id: 2,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      startDate: 'Nov 15, 2024',
      endDate: 'Ongoing',
      status: 'Active',
      purpose: 'Vitamin supplement'
    }
  ]

  const vitalSigns = [
    { name: 'Weight (Last Visit)', value: '68', unit: 'kg', status: 'Normal', trend: 'down' },
    { name: 'Height', value: '170', unit: 'cm', status: 'Normal', trend: 'stable' },
    { name: 'BMI', value: '23.5', unit: '', status: 'Normal', trend: 'stable' },
    { name: 'Blood Type', value: 'O+', unit: '', status: 'Known', trend: 'stable' }
  ]

  return (
    <div className="min-h-screen">
      <main className="py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Records</h1>
          <p className="text-gray-600">Your complete medical history and health information</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search records, tests, medications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vital Signs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vital Signs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vitalSigns.map((vital) => (
                  <div key={vital.name} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <span className="text-2xl font-bold text-gray-900">{vital.value}</span>
                      <span className="text-sm text-gray-500">{vital.unit}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{vital.name}</p>
                    <div className="flex items-center justify-center space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vital.status === 'Normal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vital.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical History</h2>
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{record.doctor}</h3>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{record.specialty}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{record.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Treatment:</span> {record.treatment}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'Active' 
                              ? 'bg-red-100 text-red-800' 
                              : record.status === 'Resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {record.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Results</h2>
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{test.testName}</h3>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm text-gray-600">{test.date}</span>
                          <span className="text-sm text-gray-600">{test.lab}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{test.value}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.status === 'Normal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Medications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Medications</h2>
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{med.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        med.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {med.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{med.dosage} - {med.frequency}</p>
                    <p className="text-sm text-gray-600 mb-2">{med.purpose}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Started: {med.startDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Download All Records</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Add New Record</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">View Trends</span>
                </button>
              </div>
            </div>

            {/* Health Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Health Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Last Checkup</span>
                  <span className="font-medium">Nov 15, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Active Medications</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Recent Tests</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Next Appointment</span>
                  <span className="font-medium">Dec 10, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
