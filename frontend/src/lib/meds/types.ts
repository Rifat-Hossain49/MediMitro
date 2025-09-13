export interface Medication {
  id: string
  name: string
  dose: string
  timesPerDay: number
  times: string[]
  startDate: string
  notes: string
  category?: 'prescription' | 'supplement' | 'vitamins' | 'other'
  color?: string
  icon?: string
  priority?: 'low' | 'medium' | 'high'
  sideEffects?: string[]
  instructions?: string
  endDate?: string
  doctorName?: string
  pharmacyName?: string
  refillDate?: string
  stockCount?: number
  notifications?: {
    browser: boolean
    email: boolean
    sms: boolean
    alarm: boolean
    reminderMinutes: number
  }
}

export interface DoseLog {
  [key: string]: boolean // format: "${medId}_${date}_${time}"
}

export interface MedicationStats {
  totalMedications: number
  activeMedications: number
  todaysDoses: number
  takenDoses: number
  adherencePercentage: number
  upcomingDoses: number
  missedDoses: number
  streakDays: number
}

export interface ReminderSettings {
  enabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  reminderMinutes: number // minutes before dose time
  snoozeMinutes: number
  persistentNotifications: boolean
}

export interface MedicationHistory {
  date: string
  medicationId: string
  medicationName: string
  dose: string
  time: string
  taken: boolean
  takenAt?: string
  notes?: string
  sideEffects?: string[]
}

