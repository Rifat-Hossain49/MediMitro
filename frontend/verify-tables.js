// Quick script to verify all tables are created in Neon database
const { PrismaClient } = require('@prisma/client')

async function verifyTables() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Verifying database tables...\n')
    
    // Test core authentication tables
    console.log('📋 Checking Authentication Tables:')
    const userCount = await prisma.user.count()
    console.log(`✅ Users table: ${userCount} records`)
    
    const accountCount = await prisma.account.count()
    console.log(`✅ Accounts table: ${accountCount} records`)
    
    const sessionCount = await prisma.session.count()
    console.log(`✅ Sessions table: ${sessionCount} records`)
    
    const tokenCount = await prisma.verificationToken.count()
    console.log(`✅ VerificationTokens table: ${tokenCount} records`)
    
    // Test healthcare tables
    console.log('\n🏥 Checking Healthcare Tables:')
    const doctorCount = await prisma.doctor.count()
    console.log(`✅ Doctors table: ${doctorCount} records`)
    
    const appointmentCount = await prisma.appointment.count()
    console.log(`✅ Appointments table: ${appointmentCount} records`)
    
    const prescriptionCount = await prisma.prescription.count()
    console.log(`✅ Prescriptions table: ${prescriptionCount} records`)
    
    const recordCount = await prisma.medicalRecord.count()
    console.log(`✅ MedicalRecords table: ${recordCount} records`)
    
    const pharmacyCount = await prisma.pharmacy.count()
    console.log(`✅ Pharmacies table: ${pharmacyCount} records`)
    
    const medicationCount = await prisma.medication.count()
    console.log(`✅ Medications table: ${medicationCount} records`)
    
    const emergencyCount = await prisma.emergencyContact.count()
    console.log(`✅ EmergencyContacts table: ${emergencyCount} records`)
    
    console.log('\n🎉 All tables verified successfully!')
    console.log('🚀 Your MediMitra database is ready for production!')
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTables()

