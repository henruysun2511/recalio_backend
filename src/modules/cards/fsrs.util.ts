import { ReviewRating } from '@prisma/client';

// FSRS-4.5 default optimized weights (17 parameters)
const FSRS_DEFAULT_WEIGHTS = [
  0.1,   // w0: initial stability for Again
  0.3,   // w1: initial stability for Hard
  1.0,   // w2: initial stability for Good
  3.0,   // w3: initial stability for Easy
  3.0,   // w4: stability increase factor for Good
  4.0,   // w5: stability increase factor for Easy
  -0.2,  // w6: difficulty decrease for Good
  -0.4,  // w7: difficulty decrease for Easy
  1.0,   // w8: difficulty increase for Again
  0.5,   // w9: difficulty increase for Hard
  5.0,   // w10: initial difficulty
  0.8,   // w11: difficulty mean reversion factor
  10.0,  // w12: maximum difficulty
  0.2,   // w13: retrievability decay exponent
  0.8,   // w14: hard interval multiplier
  0.7,   // w15: again interval multiplier
];

export interface FsrsSettings {
  weights: number[];
  requestRetention: number;
  maximumInterval: number;
  minimumInterval: number;
  easyBonus: number;
  hardInterval: number;
}

export interface FsrsResult {
  stability: number;
  difficulty: number;
  interval: number;
  due: Date;
}

function ratingToIndex(rating: ReviewRating): number {
  switch (rating) {
    case ReviewRating.AGAIN: return 0;
    case ReviewRating.HARD: return 1;
    case ReviewRating.GOOD: return 2;
    case ReviewRating.EASY: return 3;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function parseFsrsWeights(weightsStr: string | null | undefined): number[] {
  if (!weightsStr) return [...FSRS_DEFAULT_WEIGHTS];
  const parsed = weightsStr.split(',').map(Number).filter((n) => !isNaN(n));
  return parsed.length >= 15 ? parsed : [...FSRS_DEFAULT_WEIGHTS];
}

export function calculateRetrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 1;
  return Math.pow(2, -elapsedDays / stability);
}

export function calculateFsrs(
  rating: ReviewRating,
  state: 'NEW' | 'LEARNING' | 'RELEARNING' | 'REVIEW',
  elapsedDays: number,
  prevStability: number,
  prevDifficulty: number,
  settings: FsrsSettings,
): FsrsResult {
  const w = settings.weights;
  const rIdx = ratingToIndex(rating);
  const requestRetention = settings.requestRetention;
  const maxInterval = settings.maximumInterval;
  const minInterval = settings.minimumInterval;
  const easyBonus = settings.easyBonus;
  const hardInterval = settings.hardInterval;

  let newStability: number;
  let newDifficulty: number;

  if (state === 'NEW' || prevStability <= 0) {
    // First review — initial stability
    newStability = w[rIdx];
    newDifficulty = w[10];
  } else {
    const R = calculateRetrievability(prevStability, elapsedDays);

    // Update stability
    if (rating === ReviewRating.AGAIN) {
      newStability = prevStability * w[15] * Math.exp(w[13] * (R - 1));
    } else if (rating === ReviewRating.HARD) {
      newStability = prevStability * w[14] * Math.exp(w[13] * (R - 1));
    } else if (rating === ReviewRating.GOOD) {
      newStability = prevStability * (1 + (w[4] - 1) * Math.exp(w[5] * (rIdx - 1)) * (2 - R));
    } else {
      newStability = prevStability * (1 + (w[4] - 1) * Math.exp(w[5] * (rIdx - 1)) * (2 - R)) * easyBonus;
    }

    // Update difficulty
    let deltaD: number;
    if (rating === ReviewRating.AGAIN || rating === ReviewRating.HARD) {
      deltaD = w[8] * (2 - rIdx) + w[9] * (3 - rIdx);
    } else {
      deltaD = -w[6] * (rIdx - 2) - w[7] * (rIdx - 1);
    }
    newDifficulty = clamp(prevDifficulty + deltaD, 1, w[12]);
    newDifficulty = w[12] - (w[12] - newDifficulty) * w[11];
  }

  newStability = Math.max(0.1, newStability);

  // Calculate next interval
  let interval: number;
  if (rating === ReviewRating.HARD && state !== 'NEW' && state !== 'LEARNING') {
    interval = Math.round(Math.max(prevStability * hardInterval, minInterval));
  } else {
    interval = Math.round(newStability * Math.pow(requestRetention, -1 / w[13]) - newStability / 2);
  }

  interval = clamp(interval, minInterval, maxInterval);

  const now = new Date();
  const due = new Date(now.getTime() + interval * 86400000);

  return { stability: newStability, difficulty: newDifficulty, interval, due };
}
