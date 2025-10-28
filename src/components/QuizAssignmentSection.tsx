import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Quiz, Assignment, QuizAttempt, Submission, quizAPI, assignmentAPI } from '../services/api';
import QuizCard from './QuizCard';
import AssignmentCard from './AssignmentCard';
import GlassCard from './common/GlassCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QuizAssignmentSectionProps {
  courseId: string;
  chapterId?: string;
}

type TabType = 'all' | 'quizzes' | 'assignments';

const QuizAssignmentSection: React.FC<QuizAssignmentSectionProps> = ({ courseId, chapterId }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzesAndAssignments();
  }, [courseId, chapterId]);

  const loadQuizzesAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const [quizzesResponse, assignmentsResponse] = await Promise.all([
        chapterId 
          ? quizAPI.getQuizzesByChapter(chapterId)
          : Promise.resolve({ success: true, data: [] }),
        chapterId 
          ? assignmentAPI.getAssignmentsByChapter(chapterId)
          : assignmentAPI.getAssignmentsByCourse(courseId)
      ]);
      
      if (quizzesResponse.success && assignmentsResponse.success) {
        console.log('Raw quizzes response:', quizzesResponse.data);
        console.log('First quiz data structure:', quizzesResponse.data?.[0]);
        console.log('First quiz questions_data:', quizzesResponse.data?.[0]?.questions_data);
        setQuizzes(quizzesResponse.data || []);
        setAssignments(assignmentsResponse.data || []);
      } else {
        console.error('Failed to load quizzes:', quizzesResponse);
        console.error('Failed to load assignments:', assignmentsResponse);
        setError('Failed to load quizzes and assignments');
      }
    } catch (err) {
      console.error('Error loading quiz and assignment data:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAttemptComplete = (attempt: QuizAttempt) => {
    console.log('Quiz attempt completed:', attempt);
    // You can add additional logic here, like refreshing data or showing notifications
  };

  const handleAssignmentSubmissionComplete = (submission: Submission) => {
    console.log('Assignment submission completed:', submission);
    // You can add additional logic here, like refreshing data or showing notifications
  };

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'quizzes':
        return { quizzes, assignments: [] };
      case 'assignments':
        return { quizzes: [], assignments };
      default:
        return { quizzes, assignments };
    }
  };

  const { quizzes: filteredQuizzes, assignments: filteredAssignments } = getFilteredItems();
  const totalItems = quizzes.length + assignments.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <GlassCard style={StyleSheet.flatten([styles.errorContainer, { backgroundColor: theme.colors.cardBackground }]) as ViewStyle}>
          <Icon name="error" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadQuizzesAndAssignments}
          >
            <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    );
  }

  if ((!quizzes || quizzes.length === 0) && (!assignments || assignments.length === 0)) {
    return (
      <View style={styles.container}>
        <GlassCard style={StyleSheet.flatten([styles.emptyContainer, { backgroundColor: theme.colors.cardBackground }])}>
          <Icon name="school" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Content Available</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No quizzes or assignments have been added yet.
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Quizzes & Assignments</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Complete your coursework and track your progress
        </Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'all' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'all' ? '600' as const : 'normal' as const,
              }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'quizzes' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => setActiveTab('quizzes')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'quizzes' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'quizzes' ? '600' as const : 'normal' as const,
              }
            ]}
          >
            Quizzes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'assignments' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'assignments' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'assignments' ? '600' as const : 'normal' as const,
              }
            ]}
          >
            Assignments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Quizzes */}
        {filteredQuizzes.map((quiz) => (
          <QuizCard
            key={quiz.quiz_id}
            quiz={quiz}
            onAttemptComplete={handleQuizAttemptComplete}
          />
        ))}
        
        {/* Assignments */}
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.assignment_id}
            assignment={assignment}
            onSubmissionComplete={handleAssignmentSubmissionComplete}
          />
        ))}
        
        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    opacity: 0.7,
    lineHeight: 20,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
});

export default QuizAssignmentSection;