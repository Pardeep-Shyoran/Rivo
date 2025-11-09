import ImageKit from 'imagekit';
import config from '../config/config.js';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload file to ImageKit
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} folder - Folder path in ImageKit
 * @returns {Promise<Object>} Upload response
 */
export async function uploadToImageKit(fileBuffer, fileName, folder = 'rivo-profile-pictures') {
  try {
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['profile', 'user'],
    });

    return {
      url: response.url,
      fileId: response.fileId,
      thumbnailUrl: response.thumbnailUrl,
      name: response.name,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete file from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<void>}
 */
export async function deleteFromImageKit(fileId) {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get ImageKit authentication parameters for client-side upload
 * @returns {Object} Authentication parameters
 */
export function getImageKitAuthParams() {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  return {
    signature: authenticationParameters.signature,
    expire: authenticationParameters.expire,
    token: authenticationParameters.token,
  };
}

export default imagekit;
