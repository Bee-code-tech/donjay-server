import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dqw3zwnlo',
  api_key: '711376771111665',
  api_secret: 'OccR8jC2e_W4i2teJXWOql4wJR4',
});

// Configure Cloudinary Storage for Multer
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery/images',
    format: async (req, file) => 'png', 
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery/videos',
    resource_type: 'video',
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery/documents',
    resource_type: 'raw',
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

export { imageStorage, videoStorage, documentStorage };
