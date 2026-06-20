/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ActionableSupport {
  coping_strategy: string;
  mindfulness_exercise: string;
}

export interface SentimentAnalysis {
  detected_mood: string;
  intensity_score: number; // 1 to 10
  empathetic_validation: string;
  actionable_support: ActionableSupport;
}

export interface JournalEntryPayload {
  text: string;
  selected_mood: string; // The rapid 10-second emoji selected mood
  timestamp: string;
}

export interface JournalResponse {
  is_crisis: boolean;
  national_helpline?: {
    name: string;
    number: string;
    description: string;
    immediate_action: string;
  };
  analysis?: SentimentAnalysis;
}

export interface SavedJournalLog {
  id: string;
  text: string;
  selected_mood: string;
  detected_mood: string;
  intensity_score: number;
  empathetic_validation: string;
  coping_strategy: string;
  mindfulness_exercise: string;
  is_crisis: boolean;
  timestamp: string;
}
