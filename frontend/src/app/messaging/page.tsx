'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, User, Clock, CheckCircle, CheckCircle2, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react'

interface Message {
  id: string
  doctorId: string
  patientId: string
  appointmentId?: string
  senderType: 'doctor' | 'patient'
  message: string
  messageType: string
  attachmentUrl?: string
  isRead: boolean
  createdAt: string
}

interface Conversation {
  doctor_id: string
  doctor_name: string
  specialization: string
  patient_id: string
  patient_name: string
  appointment_id?: string
  appointment_status: string
  unread_count: number
  last_message?: string
  last_message_time?: string
}

export default function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchConversations()
    
    // Set up polling for real-time updates
    const interval = setInterval(async () => {
      setIsUpdating(true)
      await fetchConversations()
      if (selectedConversation) {
        await fetchMessages(selectedConversation.doctor_id, selectedConversation.patient_id)
      }
      setLastUpdate(new Date())
      setIsUpdating(false)
    }, 3000) // Poll every 3 seconds
    
    return () => clearInterval(interval)
  }, [selectedConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messaging/conversations')
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (doctorId: string, patientId: string) => {
    try {
      const response = await fetch(`/api/messaging/conversation/${doctorId}/${patientId}`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    const { uploadFile: appwriteUpload } = await import('@/lib/appwrite')
    
    const result = await appwriteUpload(file, (progress) => {
      console.log(`Upload progress: ${progress}%`)
    })
    
    return {
      fileUrl: result.fileUrl,
      messageType: getMessageType(file.name)
    }
  }

  const getMessageType = (fileName: string) => {
    const extension = fileName.toLowerCase()
    if (extension.endsWith('.jpg') || extension.endsWith('.jpeg') || 
        extension.endsWith('.png') || extension.endsWith('.gif') || 
        extension.endsWith('.webp')) {
      return 'image'
    } else if (extension.endsWith('.pdf')) {
      return 'prescription'
    } else {
      return 'file'
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || sending) return

    setSending(true)
    try {
      let attachmentUrl = null
      let messageType = 'text'

      // Upload file if selected
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await uploadFile(selectedFile)
        attachmentUrl = uploadResult.fileUrl
        messageType = uploadResult.messageType
        setUploading(false)
      }

      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedConversation.doctor_id,
          patientId: selectedConversation.patient_id,
          appointmentId: selectedConversation.appointment_id,
          message: newMessage || (selectedFile ? `Sent a ${messageType}` : ''),
          senderType: 'patient',
          attachmentUrl: attachmentUrl,
          messageType: messageType
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Refresh messages
        await fetchMessages(selectedConversation.doctor_id, selectedConversation.patient_id)
        // Refresh conversations to update last message
        await fetchConversations()
      } else {
        alert('Failed to send message: ' + data.message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.doctor_id, conversation.patient_id)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Doctor Messages</h1>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <p className="text-sm text-gray-500">
                      {isUpdating ? 'Updating...' : `Last updated: ${lastUpdate.toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {conversations.length} Active
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Communicate with your doctors after confirmed appointments</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-gray-900">Doctor Conversations</h2>
              <p className="text-sm text-gray-600 mt-1">{conversations.length} active conversations</p>
            </div>
            <div className="overflow-y-auto h-[580px]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageCircle className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
                  <p className="text-sm text-gray-500 mb-1">Book and confirm an appointment to start messaging</p>
                  <p className="text-xs text-gray-400">Complete an appointment to start messaging</p>
                </div>
              ) : (
                conversations.map((conversation, index) => (
                  <div
                    key={`${conversation.doctor_id}-${conversation.patient_id}-${conversation.appointment_id || index}`}
                    onClick={() => selectConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group ${
                      selectedConversation?.doctor_id === conversation.doctor_id && 
                      selectedConversation?.patient_id === conversation.patient_id 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            Dr. {conversation.doctor_name}
                          </h3>
                          {conversation.last_message_time && (
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(conversation.last_message_time)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full inline-block mt-1">
                          {conversation.specialization}
                        </p>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-700 truncate mt-2 group-hover:text-gray-900">
                            {conversation.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Dr. {selectedConversation.doctor_name}
                        </h3>
                        <p className="text-sm text-purple-600 font-semibold bg-purple-100 px-3 py-1 rounded-full inline-block">
                          {selectedConversation.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all duration-200">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all duration-200">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all duration-200">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                      <p className="text-sm text-gray-500">Start the conversation with your doctor</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'patient' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            message.senderType === 'patient'
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {message.attachmentUrl && (
                            <div className="mb-2">
                              {message.messageType === 'image' ? (
                                <img 
                                  src={message.attachmentUrl}
                                  alt="Attachment"
                                  className="max-w-full h-auto rounded-lg shadow-sm"
                                  style={{ maxHeight: '200px' }}
                                />
                              ) : (
                                <div className={`p-3 rounded-lg border ${
                                  message.senderType === 'patient' 
                                    ? 'bg-purple-400 border-purple-300' 
                                    : 'bg-gray-100 border-gray-300'
                                }`}>
                                  <div className="flex items-center space-x-2">
                                    <Paperclip className="w-4 h-4" />
                                    <a 
                                      href={message.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium hover:underline truncate"
                                    >
                                      {message.message || 'File attachment'}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {message.message && (
                            <p className="text-sm font-medium leading-relaxed">{message.message}</p>
                          )}
                          <div className="flex items-center justify-end mt-2 space-x-1">
                            <span className="text-xs opacity-70">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.senderType === 'patient' && (
                              <div className="flex items-center">
                                {message.isRead ? (
                                  <CheckCircle2 className="w-3 h-3 text-purple-200" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-purple-200" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  {/* Selected File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800 truncate">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-purple-600">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-3">
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all duration-200"
                        disabled={uploading}
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        disabled={sending || uploading}
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-purple-600 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {sending || uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {uploading ? 'Uploading...' : 'Send'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-8">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Select a conversation</h3>
                  <p className="text-lg text-gray-500 mb-2">Choose a doctor to start messaging</p>
                  <p className="text-sm text-gray-400">Messages will appear here once you select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

