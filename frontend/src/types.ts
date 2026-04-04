export interface ChildInfo {
  age_of_children: number;
}

export interface AdviceRequest {
  chk_in: string;
  chk_out: string;
  room_type?: string;
  use_live_feed?: boolean;
  hotel_key?: string;
  currency?: string;
  no_of_adults?: number;
  childrens?: ChildInfo[];
  live_blend_weight?: number;
}

export interface Booking {
  name: string;
  email: string;
  phone: string;
  advice: AdviceRequest;
}

export type AppStep = 'search' | 'results' | 'booking';
