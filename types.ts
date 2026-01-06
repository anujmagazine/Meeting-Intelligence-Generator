
export interface ActionItem {
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SentimentData {
  time: string;
  sentiment: number; // -1 to 1
  label: string;
}

export interface DeepInsight {
  category: string;
  insight: string;
  evidence: string;
  significance: string;
}

export interface MeetingAnalysis {
  title: string;
  date: string;
  summary: string;
  keyTakeaways: string[];
  decisions: string[];
  actionItems: ActionItem[];
  sentimentTimeline: SentimentData[];
  deepInsights: DeepInsight[];
  unspokenDynamics: string;
  strategicAlignment: string;
}

export type InputMode = 'audio' | 'transcript';
