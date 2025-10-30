import { fsrs, generatorParameters, Rating, State, type Card as FSRSCard, type RecordLogItem } from 'ts-fsrs';
import type { Card } from '../db/schema';

export interface ScheduleResult {
  state: number;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
}

export interface ReviewOptions {
  again: { due: Date; interval: number };
  hard: { due: Date; interval: number };
  good: { due: Date; interval: number };
  easy: { due: Date; interval: number };
}

export class CardScheduler {
  private fsrsInstance;

  constructor() {
    const params = generatorParameters();
    this.fsrsInstance = fsrs(params);
  }

  /**
   * カードをレビューしてスケジュールを更新
   */
  schedule(card: Card, rating: number): ScheduleResult {
    const fsrsCard = this.toFSRSCard(card);
    const now = new Date();
    
    const preview = this.fsrsInstance.repeat(fsrsCard, now);
    let recordLog;
    
    switch (rating) {
      case 1:
        recordLog = preview[Rating.Again];
        break;
      case 2:
        recordLog = preview[Rating.Hard];
        break;
      case 3:
        recordLog = preview[Rating.Good];
        break;
      case 4:
        recordLog = preview[Rating.Easy];
        break;
      default:
        recordLog = preview[Rating.Good];
    }
    
    return this.fromRecordLogItem(recordLog, card);
  }

  /**
   * 次のレビューオプションを取得
   */
  getNextReviewOptions(card: Card): ReviewOptions {
    const fsrsCard = this.toFSRSCard(card);
    const now = new Date();
    
    const recordLogs = this.fsrsInstance.repeat(fsrsCard, now);
    
    return {
      again: {
        due: recordLogs[Rating.Again].card.due,
        interval: this.calculateInterval(now, recordLogs[Rating.Again].card.due),
      },
      hard: {
        due: recordLogs[Rating.Hard].card.due,
        interval: this.calculateInterval(now, recordLogs[Rating.Hard].card.due),
      },
      good: {
        due: recordLogs[Rating.Good].card.due,
        interval: this.calculateInterval(now, recordLogs[Rating.Good].card.due),
      },
      easy: {
        due: recordLogs[Rating.Easy].card.due,
        interval: this.calculateInterval(now, recordLogs[Rating.Easy].card.due),
      },
    };
  }

  private toFSRSCard(card: Card): FSRSCard {
    return {
      due: card.due ? new Date(card.due) : new Date(),
      stability: card.stability || 0,
      difficulty: card.difficulty || 0,
      elapsed_days: card.elapsedDays || 0,
      scheduled_days: card.scheduledDays || 0,
      reps: card.reps || 0,
      lapses: card.lapses || 0,
      state: card.state as State,
      last_review: card.lastReview ? new Date(card.lastReview) : undefined,
    } as FSRSCard;
  }

  private fromRecordLogItem(recordLog: RecordLogItem, originalCard: Card): ScheduleResult {
    const { card } = recordLog;
    
    return {
      state: card.state,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: card.elapsed_days,
      scheduledDays: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
    };
  }

  private calculateInterval(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  }
}
