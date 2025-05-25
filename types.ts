export interface FoodComponent {
  name: string;
  calories: number;
}

export interface NutritionData {
  foodName: string;
  calories: number; // Total calories
  fat: number;      // Total fat
  sugar: number;    // Total sugar
  components: FoodComponent[]; // Breakdown of components
}

export interface FoodEntry extends NutritionData {
  id: string;
  timestamp: number; // Unix timestamp
  imageBase64: string; // Compressed image
}

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface ChartDataPoint {
  name: string;
  calories: number;
  fat: number;
  sugar: number;
}