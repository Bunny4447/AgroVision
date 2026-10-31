export interface RegionInfo {
  name: string;
  score: number;
  percentage: number;
  peak: number;
  status: string;
  level: 'high' | 'medium' | 'low';
  color: 'red' | 'amber' | 'emerald';
}

export interface RegionsAnalysis {
  top: RegionInfo;
  middle: RegionInfo;
  bottom: RegionInfo;
}

export interface DiseaseInfo {
  name: string;
  pathogen: string;
  description: string;
  symptoms: string[];
  favorable_conditions: string;
  cultural_control: string[];
  chemical_control: string[];
  urgency: 'High' | 'Medium' | 'Low' | 'None';
  icon_color: string;
}

export interface ImageOutputs {
  original: string;
  heatmap: string;
  overlay: string;
}

export interface PredictionResult {
  prediction: string;
  display_name: string;
  confidence: number;
  confidence_raw: number;
  all_confidences: Record<string, number>;
  is_low_confidence: boolean;
  low_confidence_message: string | null;
  explanation: string;
  disclaimer: string;
  regions: RegionsAnalysis;
  disease_info: DiseaseInfo;
  images: ImageOutputs;
  timestamp?: string;
}

export interface SampleImage {
  key: string;
  display_name: string;
  image_data: string;
}

export interface PerClassMetric {
  display_name: string;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface ModelMetrics {
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  weighted_precision: number;
  weighted_recall: number;
  weighted_f1: number;
  per_class: Record<string, PerClassMetric>;
  confusion_matrix: number[][];
  classes: string[];
  class_keys: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'farmer';
  is_verified: boolean;
  is_admin?: boolean;
  created_at?: string;
  last_login?: string;
}

export interface SmtpSettings {
  is_configured: boolean;
  sender_email: string;
  smtp_host: string;
  smtp_port: number;
  sender_name: string;
  use_tls?: boolean;
  has_password?: boolean;
}

