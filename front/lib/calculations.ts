import { AttributesLogRecord } from "@/lib/xata";
import { getXataClient } from "@/lib/xata";

export const CONSTANTS = {
  name: "Akshat Pande",
  weight: 77.15,
  height: 180,
  bmi: 25.1,
  bfat: 24.7,
  age: 29,
};

export function calculateStrength(row: AttributesLogRecord, constants: typeof CONSTANTS): number {
  const baselines: { [key: string]: number } = {
    "Bench Press (Kg)": constants.weight,
    "BW PullUps (Rep)": 10,
    "BW PushUps (Rep)": 20,
    "Barbell Curl (Kg)": 0.5 * constants.weight,
    "Shoulder Press (Kg)": 0.6 * constants.weight,
    "BW Dips (Rep)": 10,
    "Squats (Kg)": 1.5 * constants.weight,
    "Grip Strength": 50,
    "Leg Press": 2 * constants.weight,
    "Dead Lift": 1.8 * constants.weight,
    "Resting Heart Rate": 60,
    "BW Plank": 120,
  };
  const metric = row.metric || "";
  const value = row.value || 0;
  const baseline = baselines[metric] || 0;
  const heightAdjustment = (constants.height - 175) * 0.001;
  const ageAdjustment = (constants.age - 25) * 0.01;
  const bfAdjustment = (1 - constants.bfat / 100) * 0.1;
  if (metric === "Resting Heart Rate") {
    return value > 0 ? (baseline / value) * (1 - bfAdjustment) : 0;
  }
  return baseline > 0
    ? (value / baseline) * (1 + heightAdjustment) * (1 - ageAdjustment) * (1 + bfAdjustment)
    : 0;
}

export function calculateIntelligence(row: AttributesLogRecord): number {
  const value = row.value || 0;
  const weightage = row.weightage || 1;
  return value * weightage;
}

export function calculateResilience(row: AttributesLogRecord, constants: typeof CONSTANTS): number {
  const value = row.value || 0;
  const baseline = row.baseline || 1;
  const ageAdjustment = (constants.age - 25) * 0.01;
  const metric = row.metric || "";
  if (metric === "Stress Recovery Time (Minutes)") {
    return value > 0 ? (baseline / value) * (1 - ageAdjustment) : 0;
  }
  return baseline > 0 ? (value / baseline) * (1 - ageAdjustment) : 0;
}

export function calculateCreativity(row: AttributesLogRecord): number {
  const value = row.value || 0;
  const weightage = row.weightage || 1;
  return value * weightage;
}

export function calculateLuck(row: AttributesLogRecord): number {
  return row.value || 0;
}

export function calculateCuriosity(row: AttributesLogRecord): number {
  return row.value || 0;
}

export async function calculateTotalScore(
  attribute: string,
  constants: typeof CONSTANTS
): Promise<[number, { [key: string]: number | string }]> {
  if (!attribute || typeof attribute !== "string") {
    return [0, { error: "Invalid or missing attribute" }];
  }

  const client = getXataClient();
  const response = await client.db.attributes_log
    .filter({ attribute: attribute.toLowerCase() })
    .getAll();
  const data = response || [];

  if (!data.length) {
    return [0, { error: "No data found" }];
  }

  let total = 0;
  const breakdown: { [key: string]: number } = {};
  for (const row of data) {
    let score: number;
    switch (attribute.toLowerCase()) {
      case "strength":
        score = calculateStrength(row, constants);
        break;
      case "intelligence":
        score = calculateIntelligence(row);
        break;
      case "resilience":
        score = calculateResilience(row, constants);
        break;
      case "creativity":
        score = calculateCreativity(row);
        break;
      case "luck":
        score = calculateLuck(row);
        break;
      case "curiosity":
        score = calculateCuriosity(row);
        break;
      default:
        return [0, { error: "Invalid attribute" }];
    }
    total += score;
    breakdown[row.metric || "unknown"] = score;
  }

  return [parseFloat(total.toFixed(2)), breakdown];
}