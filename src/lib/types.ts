export type ReviewStatus = "pending" | "approved" | "rejected";

export type Library = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string | null;
  neighborhood: string | null;
  icon: string;
  status: ReviewStatus;
  added_by: string | null;
  created_at: string;
};

export type Photo = {
  id: string;
  library_id: string;
  image_url: string;
  original_path: string | null;
  uploaded_by: string | null;
  caption: string | null;
  status: ReviewStatus;
  created_at: string;
};

/** A photo with a short-lived signed URL ready for <img src>. */
export type PhotoWithUrl = Photo & { signedUrl: string | null };

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
};

export type BadgeType = "first_visit" | "five_libraries" | "full_tour" | "photographer";

export type Badge = {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
};
