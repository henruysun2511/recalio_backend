export const CLOUDINARY_CONSTANTS = {
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/webm',
  ],
  ALLOWED_RESOURCE_TYPES: ['image', 'video'],
  FOLDERS: {
    IMAGE: 'recalio/images',
    AUDIO: 'recalio/audio',
  },
} as const;
