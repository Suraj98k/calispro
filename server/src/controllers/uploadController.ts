import { Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary.js';
import { AuthRequest } from '../middleware/auth.js';

const applyCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false as const, missing: { cloudName: !cloudName, apiKey: !apiKey, apiSecret: !apiSecret } };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return { ok: true as const };
};

const uploadFromBuffer = (buffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed'));
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

export const uploadAdminImage = async (req: AuthRequest, res: Response) => {
  try {
    const configState = applyCloudinaryConfig();
    if (!configState.ok) {
      return res.status(500).json({
        message: 'Cloudinary env missing',
        missing: configState.missing,
      });
    }

    const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const folder = typeof req.body.folder === 'string' && req.body.folder.trim().length
      ? req.body.folder.trim()
      : 'calispro/skills';

    const uploaded = await uploadFromBuffer(file.buffer, folder);

    res.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
    });
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    const message = err instanceof Error ? err.message : 'Image upload failed';
    res.status(500).json({ message });
  }
};
