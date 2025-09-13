import { Client, Storage, ID } from 'appwrite';

export const client = new Client();

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68c307fe002f136b2920';
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'medimitra-files';

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const storage = new Storage(client);

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
    try {
        const fileId = ID.unique();
        
        // Perform actual Appwrite upload
        const response = await storage.createFile(
            APPWRITE_BUCKET_ID,
            fileId,
            file,
            undefined, // permissions
            onProgress
        );
        
        return {
            fileId: response.$id,
            fileName: response.name,
            fileSize: response.sizeOriginal,
            mimeType: response.mimeType,
            fileUrl: getFileUrl(response.$id),
            downloadUrl: getFileDownloadUrl(response.$id)
        };
    } catch (error: any) {
        console.error('File upload failed:', error);
        
        // Provide specific error messages for common issues
        if (error.code === 401) {
            throw new Error('Authorization failed. Please check Appwrite bucket permissions.');
        } else if (error.code === 404) {
            throw new Error('Bucket not found. Please create the "medimitra-files" bucket in Appwrite.');
        } else if (error.message?.includes('not authorized')) {
            throw new Error('Not authorized to upload. Please configure bucket permissions in Appwrite console.');
        } else if (error.message?.includes('project')) {
            throw new Error('Project ID incorrect. Please verify NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local');
        }
        
        throw new Error(`Upload failed: ${error.message || error}`);
    }
};

export const getFileUrl = (fileId: string) => {
    // Generate direct Appwrite URL for file viewing
    return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
};

export const getFileDownloadUrl = (fileId: string) => {
    // Generate direct Appwrite URL for file download
    return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
};

export const deleteFile = async (fileId: string) => {
    try {
        await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
        return true;
    } catch (error) {
        console.error('File deletion failed:', error);
        return false;
    }
};

export { APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT };
