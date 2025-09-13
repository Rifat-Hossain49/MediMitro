# 🚀 Appwrite Setup Guide for MediMitra

## Current Issue
**Authorization Error**: "The current user is not authorized to perform the requested action"

## Solution: Create Storage Bucket with Proper Permissions

### 1. Go to Appwrite Console
- Visit: https://cloud.appwrite.io
- Open your MediMitra project

### 2. Create Storage Bucket
1. Click **"Storage"** in the left sidebar
2. Click **"Create Bucket"**
3. Configure:
   - **Bucket ID**: `medimitra-files` (EXACTLY this - must match your .env.local)
   - **Name**: `MediMitra Files`
   - **File Security**: **DISABLE** (for easier testing)
   - **Maximum File Size**: `50MB`
   - **Allowed File Extensions**: `pdf,jpg,jpeg,png,gif,doc,docx,txt,dcm,tiff,bmp`
   - **Encryption**: **Disabled** (for now)
   - **Antivirus**: **Disabled** (for now)

### 3. Set Bucket Permissions
**Option A: For Development (Easy)**
- **File Security**: Disabled
- **Permissions**: No permissions needed

**Option B: For Production (Secure)**
- **File Security**: Enabled  
- **Permissions**: Add these roles:
  - `users` (authenticated users): Create, Read, Update, Delete
  - `guests` (any user): Read (for viewing files)

### 4. Test the Setup
After creating the bucket:

1. **Update the code** in `frontend/src/lib/appwrite.ts`:
   ```typescript
   // Remove the simulation code and uncomment real Appwrite calls
   const response = await storage.createFile(
       APPWRITE_BUCKET_ID,
       fileId,
       file,
       undefined, // permissions
       onProgress
   );
   ```

2. **Test file upload** in the EHR interface

### 5. Verify Environment Variables
Make sure these match in both frontend and backend:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68c307fe002f136b2920
NEXT_PUBLIC_APPWRITE_BUCKET_ID=medimitra-files

# Backend (.env)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68c307fe002f136b2920
APPWRITE_BUCKET_ID=medimitra-files
```

## Current Status
- ✅ File upload UI working
- ✅ Form validation working  
- ✅ Progress simulation working
- ❌ **Appwrite bucket not created yet**
- ❌ **Real file upload disabled**

## Next Steps
1. Create the Appwrite bucket (5 minutes)
2. Enable real file uploads
3. Test with actual files
4. Files will be stored in Appwrite cloud
5. Database will store file URLs and metadata

**Once the bucket is created, file uploads will work perfectly!** 🎯
