// lib/calculations.ts
import { AttributesLogRecord, ExperienceLogRecord } from "@/lib/xata";
import { getXataClient } from "@/lib/xata";

export const CONSTANTS = {
  name: "Akshat Pande",
  weight: 77.15,
  height: 180,
  bmi: 25.1,
  bfat: 24.7,
  age: 29,
  XP_PER_LEVEL: 100, // Added for experience leveling
};

/**
 * Calculates total experience, current level, and progress percentage from experience_log records.
 * @returns {Promise<{ total_experience: number, current_level: number, progress_percentage: number }>}
 * @throws {Error} If fetching or calculating experience fails
 */
export async function calculateExperience(): Promise<{
  total_experience: number;
  current_level: number;
  progress_percentage: number;
}> {
  try {
    const client = getXataClient();
    const response = await client.db.experience_log.getAll();
    const data = response || [];

    // Sum the experience points from all records
    const total_experience = data.reduce((sum, row) => sum + (row.experience || 0), 0);

    // Define leveling system
    const XP_PER_LEVEL = CONSTANTS.XP_PER_LEVEL;
    const current_level = Math.floor(total_experience / XP_PER_LEVEL) + 1;
    const xp_for_current_level = (current_level - 1) * XP_PER_LEVEL;
    const xp_towards_next_level = total_experience - xp_for_current_level;
    const progress_percentage = (xp_towards_next_level / XP_PER_LEVEL) * 100;

    return {
      total_experience: parseFloat(total_experience.toFixed(2)),
      current_level,
      progress_percentage: parseFloat(progress_percentage.toFixed(2)),
    };
  } catch (error) {
    console.error("Error calculating experience:", error);
    throw new Error("Failed to calculate experience");
  }
}

/**
 * Calculates strength score for a given attributes_log record.
 * @param row - The attributes_log record
 * @param constants - User constants (weight, height, etc.)
 * @returns {number} Calculated strength score
 */
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

/**
 * Calculates intelligence score for a given attributes_log record.
 * @param row - The attributes_log record
 * @returns {number} Calculated intelligence score
 */
export function calculateIntelligence(row: AttributesLogRecord): number {
  const value = row.value || 0;
  const weightage = row.weightage || 1;
  return value * weightage;
}

/**
 * Calculates resilience score for a given attributes_log record.
 * @param row - The attributes_log record
 * @param constants - User constants (age)
 * @returns {number} Calculated resilience score
 */
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

/**
 * Calculates creativity score for a given attributes_log record.
 * @param row - The attributes_log record
 * @returns {number} Calculated creativity score
 */
export function calculateCreativity(row: AttributesLogRecord): number {
  const value = row.value || 0;
  const weightage = row.weightage || 1;
  return value * weightage;
}

/**
 * Calculates luck score for a given attributes_log record.
 * @param row - The attributes_log record
 * @returns {number} Calculated luck score
 */
export function calculateLuck(row: AttributesLogRecord): number {
  return row.value || 0;
}

/**
 * Calculates curiosity score for a given attributes_log record.
 * @param row - The attributes_log record
 * @returns {number} Calculated curiosity score
 */
export function calculateCuriosity(row: AttributesLogRecord): number {
  return row.value || 0;
}

/**
 * Calculates the total score for a given attribute.
 * For "experience", returns total_experience and { total_experience, current_level, progress_percentage }.
 * For other attributes, returns total score and a breakdown of metric scores.
 * @param attribute - The attribute to calculate (e.g., "strength", "experience")
 * @param constants - User constants (weight, height, etc.)
 * @returns {Promise<[number, { [key: string]: number | string }]>} Total score and breakdown
 */
export async function calculateTotalScore(
  attribute: string,
  constants: typeof CONSTANTS
): Promise<[number, { [key: string]: number | string }]> {
  if (!attribute || typeof attribute !== "string") {
    return [0, { error: "Invalid or missing attribute" }];
  }

  if (attribute.toLowerCase() === "experience") {
    try {
      const { total_experience, current_level, progress_percentage } = await calculateExperience();
      return [
        total_experience,
        {
          experience: total_experience, // Metric-like key for consistency
          current_level,
          progress_percentage,
        },
      ];
    } catch (error) {
      console.error("Error calculating experience:", error);
      return [0, { error: "Failed to calculate experience" }];
    }
  }

  try {
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
  } catch (error) {
    console.error(`Error calculating ${attribute} score:`, error);
    return [0, { error: `Failed to calculate ${attribute} score` }];
  }
}