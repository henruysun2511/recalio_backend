export const CLOZE_MARKER_REGEX = /\{\{c(\d+)::(.*?)\}\}/g;

export const NOTE_CONSTANTS = {
  TAG_MAX: 20,
  TAG_MAX_LENGTH: 50,
  NOTES_PER_DECK_MAX: 50,
  SORT_FIELDS: ['createdAt', 'updatedAt', 'word'] as const,
} as const;

export const AudioStatus = {
  UNSUPPORTED: 'UNSUPPORTED',
  USER_PROVIDED: 'USER_PROVIDED',
  CACHE_HIT: 'CACHE_HIT',
  CACHE_MISS: 'CACHE_MISS',
} as const;
export type AudioStatus = (typeof AudioStatus)[keyof typeof AudioStatus];

export const AudioSource = {
  USER: 'USER',
  DICTIONARY: 'DICTIONARY',
  TTS: 'TTS',
} as const;
export type AudioSource = (typeof AudioSource)[keyof typeof AudioSource];

export interface WordPreviewItem {
  word: string;
  detectedLanguage: string;
  isSupported: boolean;
  audioStatus: AudioStatus;
  audioUrl: string | null;
  audioSource: AudioSource | null;
  userAudioUrl: string | null;
  willUseCachedAudio: boolean;
}

export interface PreviewSummary {
  total: number;
  cacheHit: number;
  cacheMiss: number;
  userAudioProvided: number;
  unsupportedLanguage: number;
}
