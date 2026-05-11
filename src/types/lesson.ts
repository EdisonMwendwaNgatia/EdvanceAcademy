export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content?: string;
  video_url?: string;
  meeting_link?: string;
  meeting_date?: string;
  meeting_platform?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseItem = {
  type: 'milestone' | 'lesson';
  id: string;
  data: Milestone | Lesson;
  display_order: number;
};