export interface NationalPark {
  id: string;
  name_th: string;
  name_en: string;
  region: string;
  province: string;
  entrance_fee_adult: number | null;
  open_hours: string | null;
  website_url: string | null;
  activities: string[] | null;
  best_season: string | null;
  facilities: string[] | null;
  established_year: number | null;
  highlights: string | null;
  description: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  tel_number: string | null;
}

export interface Attraction {
  id: string;
  park_id: string;
  attraction_name: string;
  type: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
}

export type TrailDifficulty = "easy" | "moderate" | "hard";

export interface Trail {
  id: string;
  park_id: string;
  trail_name: string;
  description: string | null;
  difficulty: string | null;
  distance_km: number | null;
  duration: string | null;
}
