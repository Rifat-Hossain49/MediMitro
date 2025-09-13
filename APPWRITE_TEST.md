# Appwrite Upload Test Checklist

## ✅ Complete These Steps:

### 1. Verify Appwrite Console Setup
- [ ] Go to https://cloud.appwrite.io
- [ ] Project exists and is selected
- [ ] Storage section is accessible

### 2. Create/Check Bucket
- [ ] Bucket ID: `medimitra-files` (exactly this)
- [ ] Bucket exists and is visible in Storage
- [ ] Bucket name: "MediMitra Files" 

### 3. Configure Bucket Permissions
**CRITICAL: Choose ONE option:**

**Option A - Quick Fix (Testing):**
- [ ] Bucket Settings → File Security: **DISABLED**

**Option B - Proper Permissions:**
- [ ] Bucket Settings → Permissions → Add Permission
- [ ] Role: `users` 
- [ ] Permissions: `create`, `read`, `update`, `delete`

### 4. Verify Environment Variables
Check `frontend/.env.local`:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=medimitra-files
```

### 5. Test Upload
- [ ] Try uploading a small image file
- [ ] Check if file appears in Appwrite Storage
- [ ] Check if file metadata is saved to database
- [ ] Check if file appears in EHR Documents section

## 🚨 If Still Getting Authorization Error:

1. **Double-check Project ID** in `.env.local` matches Appwrite console
2. **Verify bucket ID** is exactly `medimitra-files`
3. **Try Option A** (disable file security) first for testing
4. **Clear browser cache** and try again

## ✅ Success Indicators:
- File uploads without error
- File appears in Appwrite Storage dashboard
- File URL is saved to database
- File shows in EHR Documents section with download button


