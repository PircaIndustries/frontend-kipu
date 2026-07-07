/**
 * Cloudinary API Service
 * Handles uploading and deleting images directly from the frontend using signed requests.
 */

const CLOUD_NAME = 'wtggwopc';
const API_KEY = '112665291653698';
const API_SECRET = '4wDB_Fpq-72yojTRTWczmZsvnR8';
const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

async function generateSignature(paramsToSign) {
  // Sort params alphabetically by key
  const keys = Object.keys(paramsToSign).sort();
  let signString = '';
  keys.forEach((key, index) => {
    signString += `${key}=${paramsToSign[key]}`;
    if (index < keys.length - 1) {
      signString += '&';
    }
  });

  // Append secret
  signString += API_SECRET;

  // Hash using Web Crypto API
  const msgUint8 = new TextEncoder().encode(signString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const cloudinaryService = {
  /**
   * Upload an image to Cloudinary
   * @param {File|Blob|string} file - The file object or base64 string
   * @returns {Promise<{url: string, public_id: string}>}
   */
  async uploadImage(file) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature({ timestamp });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(`${BASE_URL}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error uploading image to Cloudinary');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id
    };
  },

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - The public ID of the image
   * @returns {Promise<boolean>}
   */
  async deleteImage(publicId) {
    if (!publicId) return false;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature({
      public_id: publicId,
      timestamp
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    try {
      const response = await fetch(`${BASE_URL}/image/destroy`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.result === 'ok';
    } catch (e) {
      console.error('Failed to delete image from Cloudinary', e);
      return false;
    }
  }
};
