const sharp = require('sharp');
const path = require('path');
const { AppError } = require('./errorHandler');

async function processImage(filePath) {
  try {
    const processedImagePath = path.join(
      path.dirname(filePath),
      `processed_${path.basename(filePath)}`
    );

    await sharp(filePath)
      // Resize to reasonable dimensions while maintaining aspect ratio
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      // Enhance image quality for better OCR
      .sharpen()
      // Increase contrast
      .normalize()
      // Convert to grayscale for better text detection
      .grayscale()
      // Save processed image
      .toFile(processedImagePath);

    return processedImagePath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new AppError('Failed to process image', 500);
  }
}

async function validateImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Check image dimensions
    if (metadata.width < 100 || metadata.height < 100) {
      throw new AppError('Image dimensions too small', 400);
    }
    
    // Check file size (max 10MB)
    if (metadata.size > 10 * 1024 * 1024) {
      throw new AppError('Image file size too large', 400);
    }
    
    // Check format
    const validFormats = ['jpeg', 'png', 'webp'];
    if (!validFormats.includes(metadata.format)) {
      throw new AppError('Invalid image format', 400);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid image file', 400);
  }
}

module.exports = {
  processImage,
  validateImage
};