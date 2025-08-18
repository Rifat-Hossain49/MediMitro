import { Bot, Send } from 'lucide-react'

export default function SymptomChecker() {
  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Symptom Checker</h1>
          <p className="text-gray-600 mt-1">Triage advice and care navigation.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 text-blue-700 mb-4"><Bot className="w-5 h-5"/> AI Assistant</div>
          <div className="h-72 overflow-y-auto rounded-lg border border-gray-100 p-4 bg-gray-50 mb-4 text-sm text-gray-700">
            <p>Hello! Describe your symptoms. I will ask a few questions to assess urgency.</p>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2" placeholder="Type your message..." />
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Send className="w-4 h-4"/> Send</button>
          </div>
        </div>
      </main>
    </div>
  )
}


