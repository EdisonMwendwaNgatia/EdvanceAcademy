export interface Course {
  id: string;
  tutor_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  milestone_id: string;
  title: string;
  description: string;
  video_url: string | null;
  order: number;
  duration: number | null;
  attachments?: LessonAttachment[];
}

export interface LessonAttachment {
  id: string;
  lesson_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
}