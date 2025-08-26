import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Course, courseAPI, Quiz, Assignment, quizAPI, assignmentAPI } from '../../services/api';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import GlassCard from '../../components/common/GlassCard';
import { useCustomDialog } from '../../hooks/useCustomDialog';
import QuizCard from '../../components/QuizCard';
import AssignmentCard from '../../components/AssignmentCard';
// Certificate modal removed per UI update

const { width: screenWidth } = Dimensions.get('window');

type CoursePlayerScreenRouteProp = RouteProp<RootStackParamList, 'CoursePlayer'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SeriesPart {
  course_id: string;
  title: string;
  video_part: number;
  intro_video_url?: string;
  duration_hours?: number;
  description?: string;
  created_at: string;
  quizzes?: Quiz[];
  assignments?: Assignment[];
}

const CoursePlayerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CoursePlayerScreenRouteProp>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { showDialog, DialogComponent } = useCustomDialog();
  
  const { course } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [seriesParts, setSeriesParts] = useState<SeriesPart[]>([]);
  const [currentPart, setCurrentPart] = useState<SeriesPart | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  // Certificate state removed
  
  const user = useSelector((state: RootState) => state.user.profile);

  // Debug: Track seriesParts state changes
  useEffect(() => {
  }, [seriesParts]);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  useEffect(() => {
    loadSeriesParts();
  }, [course]);

  // Certificate handlers removed

  const loadSeriesParts = async () => {
    try {
      setIsLoading(true);
      
      // If the course has a video_series, fetch all parts of that series
      if (course.video_series) {
        
        
        const response = await courseAPI.getCoursesBySeries(course.video_series);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('DEBUG: All courses in series:', response.data.map(c => ({ id: c.course_id, title: c.title, video_part: c.video_part, series: c.video_series })));
        }
        if (response.success && response.data && response.data.length > 0) {
          console.log('DEBUG: Raw courses data:', response.data);
          const filteredCourses = response.data;
          
          const parts = await Promise.all(
            filteredCourses
              .sort((a, b) => (a.video_part || 0) - (b.video_part || 0))
              .map(async (c) => {
                // Fetch quizzes and assignments for each course part
                 const [assignmentsResponse, quizzesResponse] = await Promise.all([
                   assignmentAPI.getAssignmentsByCourse(c.course_id).catch(() => ({ success: false, data: [] })),
                   quizAPI.getQuizzesByCourse(c.course_id).catch(() => ({ success: false, data: [] }))
                 ]);
                 
                 return {
                   course_id: c.course_id,
                   title: c.title,
                   video_part: c.video_part || 1,
                   intro_video_url: c.intro_video_url,
                   duration_hours: c.duration_hours,
                   description: c.description,
                   created_at: c.created_at,
                   quizzes: quizzesResponse.success ? quizzesResponse.data : [],
                   assignments: assignmentsResponse.success ? assignmentsResponse.data : [],
                 };
              })
          );
          
          
          setSeriesParts(parts);
         
          
          // Find the current part index based on the course that was passed in
          const currentPartIndex = parts.findIndex(part => part.course_id === course.course_id);
          const partIndex = currentPartIndex >= 0 ? currentPartIndex : 0;
          
          setSelectedPartIndex(partIndex);
          setCurrentPart(parts[partIndex]);
          
          // Auto-play the selected part
          if (parts[partIndex]?.intro_video_url) {
            setShowVideoPlayer(true);
          }
        } else {
          console.log('DEBUG: API response failed or no data - falling back to single course');
          console.log('DEBUG: Failure reason - success:', response.success, 'data exists:', !!response.data, 'is array:', Array.isArray(response.data), 'length:', response.data ? response.data.length : 'N/A');
        }
      } else {
        console.log('=== SINGLE COURSE DEBUG ===');
        console.log('DEBUG: Course has no video_series, treating as single course');
        console.log('DEBUG: Course details:', JSON.stringify(course, null, 2));
        console.log('=== SINGLE COURSE DEBUG END ===');
        // Single course, not part of a series
        // Fetch assignments and quizzes for the single course
        const [assignmentsResponse, quizzesResponse] = await Promise.all([
          assignmentAPI.getAssignmentsByCourse(course.course_id).catch(() => ({ success: false, data: [] })),
          quizAPI.getQuizzesByCourse(course.course_id).catch(() => ({ success: false, data: [] }))
        ]);
        
        const singlePart: SeriesPart = {
          course_id: course.course_id,
          title: course.title,
          video_part: 1,
          intro_video_url: course.intro_video_url,
          duration_hours: course.duration_hours,
          description: course.description,
          created_at: course.created_at,
          quizzes: quizzesResponse.success ? quizzesResponse.data : [],
          assignments: assignmentsResponse.success ? assignmentsResponse.data : [],
        };
        
        setSeriesParts([singlePart]);
        setCurrentPart(singlePart);
        setSelectedPartIndex(0);
        
        if (singlePart.intro_video_url) {
          setShowVideoPlayer(true);
        }
      }
    } catch (error) {
      console.error('Error loading series parts:', error);
      showDialog({
        type: 'error',
        title: 'Error',
        message: 'Failed to load course content. Please try again.',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartSelect = (part: SeriesPart, index: number) => {
    setCurrentPart(part);
    setSelectedPartIndex(index);
    if (part.intro_video_url) {
      setShowVideoPlayer(true);
    } else {
      showDialog({
        type: 'info',
        title: 'No Video Available',
        message: 'This part does not have a video available yet.',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleNextPart = () => {
    if (selectedPartIndex < seriesParts.length - 1) {
      const nextIndex = selectedPartIndex + 1;
      handlePartSelect(seriesParts[nextIndex], nextIndex);
    }
  };

  const handlePreviousPart = () => {
    if (selectedPartIndex > 0) {
      const prevIndex = selectedPartIndex - 1;
      handlePartSelect(seriesParts[prevIndex], prevIndex);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {course.video_series || course.title}
        </Text>
        {course.video_series && (
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {seriesParts.length} part{seriesParts.length !== 1 ? 's' : ''}
          </Text>
        )}

      </View>
      
    </View>
  );

  const renderSeriesPart = (part: SeriesPart, index: number) => {
    const isSelected = index === selectedPartIndex;
    const isCompleted = false; // TODO: Add completion tracking
    
    return (
      <TouchableOpacity
        key={part.course_id}
        style={[
          styles.partCard,
          {
            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : 'transparent',
          }
        ]}
        onPress={() => handlePartSelect(part, index)}
      >
        <View style={styles.partNumber}>
          <View style={[
            styles.partNumberCircle,
            {
              backgroundColor: isCompleted 
                ? theme.colors.success 
                : isSelected 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary + '30'
            }
          ]}>
            {isCompleted ? (
              <Icon name="check" size={16} color={theme.colors.background} />
            ) : (
              <Text style={[
                styles.partNumberText,
                {
                  color: isSelected || isCompleted 
                    ? theme.colors.background 
                    : theme.colors.textSecondary
                }
              ]}>
                {part.video_part}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.partContent}>
          <Text style={[
            styles.partTitle,
            {
              color: isSelected ? theme.colors.primary : theme.colors.text,
              fontWeight: isSelected ? '600' : '500'
            }
          ]} numberOfLines={2}>
            {part.title}
          </Text>
          
          {part.description && (
            <Text style={[
              styles.partDescription,
              { color: theme.colors.textSecondary }
            ]} numberOfLines={2}>
              {part.description}
            </Text>
          )}
          
          <View style={styles.partMeta}>
            {part.duration_hours && (
              <View style={styles.metaItem}>
                <Icon name="access-time" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {part.duration_hours}h
                </Text>
              </View>
            )}
            
            {part.intro_video_url && (
              <View style={styles.metaItem}>
                <Icon name="play-circle-outline" size={14} color={theme.colors.primary} />
                <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                  Video Available
                </Text>
              </View>
            )}
            
            {/* Display quiz and assignment counts */}
            {part.quizzes && part.quizzes.length > 0 && (
              <View style={styles.metaItem}>
                <Icon name="quiz" size={14} color={theme.colors.secondary} />
                <Text style={[styles.metaText, { color: theme.colors.secondary }]}>
                  {part.quizzes.length} Quiz{part.quizzes.length !== 1 ? 'zes' : ''}
                </Text>
              </View>
            )}
            
            {part.assignments && part.assignments.length > 0 && (
              <View style={styles.metaItem}>
                <Icon name="assignment" size={14} color={theme.colors.warning} />
                <Text style={[styles.metaText, { color: theme.colors.warning }]}>
                  {part.assignments.length} Assignment{part.assignments.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          

        </View>
        
        {isSelected && (
          <Icon name="play-arrow" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderNavigationControls = () => {
    if (seriesParts.length <= 1) return null;
    
    return (
      <View style={[styles.navigationControls, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: selectedPartIndex > 0 ? theme.colors.primary : theme.colors.textSecondary + '30',
            }
          ]}
          onPress={handlePreviousPart}
          disabled={selectedPartIndex === 0}
        >
          <Icon 
            name="skip-previous" 
            size={20} 
            color={selectedPartIndex > 0 ? theme.colors.background : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.navButtonText,
            {
              color: selectedPartIndex > 0 ? theme.colors.background : theme.colors.textSecondary
            }
          ]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: selectedPartIndex < seriesParts.length - 1 
                ? theme.colors.primary 
                : theme.colors.textSecondary + '30',
            }
          ]}
          onPress={handleNextPart}
          disabled={selectedPartIndex === seriesParts.length - 1}
        >
          <Text style={[
            styles.navButtonText,
            {
              color: selectedPartIndex < seriesParts.length - 1 
                ? theme.colors.background 
                : theme.colors.textSecondary
            }
          ]}>
            Next
          </Text>
          <Icon 
            name="skip-next" 
            size={20} 
            color={selectedPartIndex < seriesParts.length - 1 
              ? theme.colors.background 
              : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading course content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.seriesList}>
         
          {seriesParts.map((part, index) => renderSeriesPart(part, index))}
        </View>
      </ScrollView>
      
      {renderNavigationControls()}
      
      {/* Video Player Modal */}
      {showVideoPlayer && currentPart?.intro_video_url && (
        <EnhancedVideoPlayer
          visible={showVideoPlayer}
          podcast={{
            podcast_id: currentPart.course_id,
            title: currentPart.title,
            description: currentPart.description || '',
            video_url: currentPart.intro_video_url,
            thumbnail_url: '',
            duration: currentPart.duration_hours ? `${currentPart.duration_hours}h` : '',
            created_at: currentPart.created_at || course.created_at,
            updated_at: currentPart.created_at || course.created_at, // Add required updated_at field
            status: 'published', // Add required status field
            course_id: currentPart.course_id,
            chapter_id: `${currentPart.course_id}_part_${currentPart.video_part}`,
          }}
          assignments={currentPart.assignments || []}
          quizzes={currentPart.quizzes || []}
          isLiked={false}
          onClose={() => setShowVideoPlayer(false)}
          onLike={() => {}}
        />
      )}
      
      <DialogComponent />
      
      {/* Certificate modal removed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  seriesList: {
    padding: 16,
  },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'space-between',
  },
  partNumber: {
    marginRight: 16,
  },
  partNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  partContent: {
    flex: 1,
  },
  partTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  partDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  partMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },

  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  certificateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CoursePlayerScreen;