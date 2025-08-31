import { progressAPI } from '../services/api';

export interface CourseCompletionStatus {
  isCompleted: boolean;
  completionPercentage: number;
  completedChapters: number;
  totalChapters: number;
  completionDate?: string;
}

export const checkCourseCompletion = async (courseId: string): Promise<CourseCompletionStatus> => {
  try {
    const response = await progressAPI.getProgress(courseId);
    
    if (response.success && response.data) {
      const progressData = response.data;
      
      // Calculate completion based on chapter progress
      const completedChapters = progressData.filter((chapter: any) => chapter.is_completed).length;
      const totalChapters = progressData.length;
      const completionPercentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
      
      // Course is considered completed if all chapters are completed
      const isCompleted = completionPercentage === 100;
      
      // Get the latest completion date if course is completed
      let completionDate: string | undefined;
      if (isCompleted) {
        const completedChapterDates = progressData
          .filter((chapter: any) => chapter.is_completed && chapter.completed_at)
          .map((chapter: any) => new Date(chapter.completed_at))
          .sort((a: Date, b: Date) => b.getTime() - a.getTime()); // Sort by latest first
        
        if (completedChapterDates.length > 0) {
          completionDate = completedChapterDates[0].toISOString();
        }
      }
      
      return {
        isCompleted,
        completionPercentage,
        completedChapters,
        totalChapters,
        completionDate,
      };
    }
    
    return {
      isCompleted: false,
      completionPercentage: 0,
      completedChapters: 0,
      totalChapters: 0,
    };
  } catch (error) {
    console.error('Error checking course completion:', error);
    return {
      isCompleted: false,
      completionPercentage: 0,
      completedChapters: 0,
      totalChapters: 0,
    };
  }
};

export const formatCompletionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateCertificateData = (user: any, course: any, completionDate: string) => {
  const userName = `${user.first_name} ${user.last_name}`;
  const courseName = course.title;
  const instructorName = course.instructor_name || 'Course Instructor'; // Fallback if instructor name not available
  const formattedDate = formatCompletionDate(completionDate);
  
  return {
    userName,
    courseName,
    instructorName,
    completionDate: formattedDate,
  };
};