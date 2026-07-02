import { google } from 'googleapis';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

let driveClient = null;

const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (clientEmail && privateKey) {
  try {
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      formattedKey,
      ['https://www.googleapis.com/auth/drive']
    );
    
    driveClient = google.drive({ version: 'v3', auth });
    console.log("[DRIVE] Google Drive API client initialized successfully.");
  } catch (err) {
    console.error("!!! Error initializing Google Drive API Client !!!", err);
  }
} else {
  console.log("[DRIVE] Google Drive credentials not found in .env. Running on local storage mode.");
}

/**
 * Uploads a base64 image to Google Drive and makes it public.
 * @param {string} filename The name of the file to save
 * @param {string} base64Data The full base64 data string (e.g. data:image/png;base64,...)
 * @returns {Promise<string|null>} The direct shareable link, or null if failed / disabled
 */
export async function uploadImageToDrive(filename, base64Data) {
  if (!driveClient) return null;
  
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/png';
    let base64Body = base64Data;
    
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Body = matches[2];
    }
    
    const buffer = Buffer.from(base64Body, 'base64');
    
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    
    const fileMetadata = {
      name: filename,
      mimeType: mimeType
    };
    
    if (folderId) {
      fileMetadata.parents = [folderId];
    }
    
    const media = {
      mimeType: mimeType,
      body: bufferStream
    };
    
    const response = await driveClient.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webContentLink, webViewLink'
    });
    
    const fileId = response.data.id;
    console.log(`[DRIVE] File uploaded successfully to Google Drive. ID: ${fileId}`);
    
    // Set permission to public so anyone can view/embed
    await driveClient.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  } catch (error) {
    console.error("!!! Google Drive Upload Error !!!", error);
    throw error;
  }
}
