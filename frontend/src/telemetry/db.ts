interface QuestionTelemetry {
  questionId: string;
  selectedOption: string;
  timeSpentMs: number;
  hoverSwitches: number;
  answerChanges: number;
  misclicks: number;
  uiTweaksMidQuestion: number;
  isStruggling: boolean;
  struggleReason: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  candidatePrefs: {
    theme: string;
    fontScale: number;
  };
  metrics: QuestionTelemetry[];
  aggregates: {
    avgDwellTimeMs: number;
    totalMisclicks: number;
    struggleCount: number;
  };
}

const STORAGE_KEY = 'lions_telemetry_database';

// 1. Core Seed Data Array to load table records immediately
const SEED_DATA: TelemetryRecord[] = [
  {
    id: "SESSION_091",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    candidatePrefs: { theme: 'yellow-on-black', fontScale: 28 },
    metrics: [
      { questionId: 'workstation_pref', selectedOption: 'digital', timeSpentMs: 12000, hoverSwitches: 2, answerChanges: 0, misclicks: 3, uiTweaksMidQuestion: 2, isStruggling: true, struggleReason: 'visual_motor' },
      { questionId: 'reading_processing', selectedOption: 'magnifier', timeSpentMs: 16400, hoverSwitches: 1, answerChanges: 0, misclicks: 1, uiTweaksMidQuestion: 0, isStruggling: false, struggleReason: 'none' }
    ],
    aggregates: { avgDwellTimeMs: 14200, totalMisclicks: 4, struggleCount: 1 }
  },
  {
    id: "SESSION_104",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    candidatePrefs: { theme: 'standard', fontScale: 20 },
    metrics: [
      { questionId: 'workstation_pref', selectedOption: 'clerical', timeSpentMs: 22000, hoverSwitches: 6, answerChanges: 2, misclicks: 0, uiTweaksMidQuestion: 0, isStruggling: true, struggleReason: 'cognitive_indecision' },
      { questionId: 'reading_processing', selectedOption: 'tts', timeSpentMs: 15000, hoverSwitches: 5, answerChanges: 1, misclicks: 0, uiTweaksMidQuestion: 0, isStruggling: true, struggleReason: 'cognitive_indecision' }
    ],
    aggregates: { avgDwellTimeMs: 18500, totalMisclicks: 0, struggleCount: 2 }
  }
];

// 2. Simulated Database Engine Operations APIs
export const mockDb = {
  // Query all items from cache
  getAll: (): TelemetryRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(data);
  },

  // Ingest transaction write (replaces express POST '/api/telemetry')
  insert: (payload: { timestamp: string; candidatePrefs: any; metrics: QuestionTelemetry[] }): Promise<void> => {
    return new Promise((resolve) => {
      const records = mockDb.getAll();
      
      // Calculate runtime analytics pre-save pipelines
      const totalDwell = payload.metrics.reduce((sum, q) => sum + q.timeSpentMs, 0);
      const avgDwellTimeMs = payload.metrics.length > 0 ? totalDwell / payload.metrics.length : 0;
      const totalMisclicks = payload.metrics.reduce((sum, q) => sum + q.misclicks, 0);
      const struggleCount = payload.metrics.filter(q => q.isStruggling).length;

      const newRecord: TelemetryRecord = {
        id: `SESSION_${Math.floor(100 + Math.random() * 900)}`,
        timestamp: payload.timestamp,
        candidatePrefs: payload.candidatePrefs,
        metrics: payload.metrics,
        aggregates: { avgDwellTimeMs, totalMisclicks, struggleCount }
      };

      records.unshift(newRecord); // Push new record to the top
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      setTimeout(resolve, 500); // Simulate network latency delay
    });
  },

  // Calculate live summary vectors (replaces express GET '/api/analytics/dashboard-summary')
  getDashboardAnalytics: () => {
    const records = mockDb.getAll();
    if (records.length === 0) {
      return { summary: { totalAssessments: 0, globalAvgDwellTimeSec: 0, globalTotalMisclicks: 0, totalStrugglesFlagged: 0 }, barriers: [] };
    }

    const totalAssessments = records.length;
    const globalTotalMisclicks = records.reduce((sum, r) => sum + r.aggregates.totalMisclicks, 0);
    const totalStrugglesFlagged = records.reduce((sum, r) => sum + r.aggregates.struggleCount, 0);
    const globalAvgDwellTimeSec = (records.reduce((sum, r) => sum + r.aggregates.avgDwellTimeMs, 0) / totalAssessments) / 1000;

    const barrierCounts: Record<string, number> = { visual_motor: 0, cognitive_indecision: 0, slow_reading: 0 };
    records.forEach(r => {
      r.metrics.forEach(m => {
        if (m.isStruggling && barrierCounts[m.struggleReason] !== undefined) {
          barrierCounts[m.struggleReason]++;
        }
      });
    });

    const barriers = Object.keys(barrierCounts).map(key => ({
      _id: key,
      count: barrierCounts[key]
    }));

    return {
      summary: { totalAssessments, globalAvgDwellTimeSec, globalTotalMisclicks, totalStrugglesFlagged },
      barriers
    };
  },

  // Reset database table completely
  clearDb: () => {
    localStorage.removeItem(STORAGE_KEY);
    return mockDb.getAll();
  }
};
