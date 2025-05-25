
import { MAX_IMAGE_SIZE_BYTES, IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION } from '../constants';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const resizeAndCompressImage = async (
  imageBase64: string,
  maxDimension: number,
  quality: number = IMAGE_COMPRESSION_QUALITY
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determine the MIME type from the base64 string (e.g., image/jpeg, image/png)
      const mimeTypeMatch = imageBase64.match(/^data:(image\/(jpeg|png|gif|webp));base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      resolve(canvas.toDataURL(mimeType, quality));
    };
    img.onerror = (error) => reject(error);
  });
};

export const processImageForUpload = async (file: File): Promise<{ original: string, forApi: string, thumbnail: string, mimeType: string }> => {
  if (file.size > MAX_IMAGE_SIZE_BYTES * 5) { // Allow a bit larger before compression
    throw new Error(`File is too large. Max size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }
  const originalBase64 = await fileToBase64(file);
  const mimeType = file.type;

  const forApiBase64 = await resizeAndCompressImage(originalBase64, IMAGE_MAX_DIMENSION, IMAGE_COMPRESSION_QUALITY);
  const thumbnailBase64 = await resizeAndCompressImage(originalBase64, THUMBNAIL_MAX_DIMENSION, 0.6); // Lower quality for thumbnail

  return { original: originalBase64, forApi: forApiBase64, thumbnail: thumbnailBase64, mimeType };
};
