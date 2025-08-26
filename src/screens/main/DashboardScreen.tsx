import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { enrollmentAPI, progressAPI, userAPI, guestCoursePurchaseAPI } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import ThemedText from '../../components/common/ThemedText';
import ThemedCard from '../../components/common/ThemedCard';
import ThemedButton from '../../components/common/ThemedButton';
import ThemeToggle from '../../components/common/ThemeToggle';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { courses } = useSelector((state: RootState) => state.course);
  const dispatch = useDispatch();
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
  });
  
  const [userProfile, setUserProfile] = useState<any>(null);
  

  


  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  // Fetch user enrolled courses and purchased courses, then calculate stats
   const fetchUserData = async () => {
     try {
       // Fetch both enrolled courses and purchased courses
       const [enrollmentsResponse, purchasedResponse] = await Promise.all([
         enrollmentAPI.getUserEnrolledCourses(),
         guestCoursePurchaseAPI.getMyPurchasedCourses().catch(() => ({ success: false, data: [] }))
       ]);
       
let allCourses: Array<{
  course_id: string;
  title: string;
  instructor_name?: string;
  duration_hours?: number;
  level?: string;
  rating?: number;
  students?: number;
}> = [];
       
       // Add enrolled courses
       if (enrollmentsResponse.success && enrollmentsResponse.data) {
         allCourses = [...enrollmentsResponse.data];
       }
       
       // Add purchased courses
       if (purchasedResponse.success && purchasedResponse.data) {
         allCourses = [...allCourses, ...(purchasedResponse.data as any[])];
       }
       
       // Fetch progress for each course and add it to course data
       const coursesWithProgress = await Promise.all(
         allCourses.map(async (course: any) => {
           try {
             const progressResponse = await progressAPI.getProgress(course.course_id);
             const progress = progressResponse.success && progressResponse.data 
               ? progressResponse.data.progress_percentage || 0 
               : 0;
             return { ...course, progress };
           } catch (error) {
             console.log('Error fetching progress for course:', course.course_id);
             return { ...course, progress: 0 };
           }
         })
       );
       
       setEnrolledCourses(coursesWithProgress);
       
       // Calculate stats
       const totalCourses = coursesWithProgress.length;
       let completedCourses = 0;
       let inProgressCourses = 0;
       let totalHours = 0;
       
       for (const course of coursesWithProgress) {
         // Add duration to total hours
         if (course.duration_hours) {
           totalHours += course.duration_hours;
         }
         
         // Count progress status
         if (course.progress >= 100) {
           completedCourses++;
         } else if (course.progress > 0) {
           inProgressCourses++;
         }
       }
       
       setUserStats({
         totalCourses,
         completedCourses,
         inProgressCourses,
         totalHours,
       });
       
       // Fetch user profile data
       await fetchUserProfile();
       
     } catch (error) {
       console.error('Error fetching user data:', error);
     }
   };
   
   const fetchUserProfile = async () => {
    try {
      const profileResponse = await userAPI.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data);
      } else {
        console.warn('Failed to fetch user profile:', profileResponse);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't crash the app, just log the error
      // The user profile will remain null and UI should handle this gracefully
    }
  };
   






  const renderProgressBar = (progress: number) => (
    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={[
          styles.progressFill,
          { width: `${progress}%` },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );

  const renderStatCard = (title: string, value: number, icon: string, color: string) => (
    <ThemedCard variant="glass" style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <ThemedText variant="h3" color="primary" weight="bold">
            {value}
          </ThemedText>
          <ThemedText variant="caption" color="secondary" align="center">
            {title}
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );



  const renderCourseCard = (course: any) => {
    // Get progress for this course (default to 0 if not available)
    const progress = course.progress || 0;
    const timeLeft = course.duration_hours ? `${course.duration_hours} hours` : 'N/A';
    const level = course.level ? course.level.charAt(0) + course.level.slice(1).toLowerCase() : 'Beginner';
    
    return (
      <ThemedCard key={course.course_id} variant="elevated" style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={styles.courseInfo}>
            <ThemedText variant="h5" color="primary" weight="semibold">
              {course.title}
            </ThemedText>
            <ThemedText variant="body2" color="secondary">
              by {course.instructor_name || 'Instructor'}
            </ThemedText>
          </View>
          <View style={styles.courseMeta}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={theme.colors.warning} />
              <ThemedText variant="caption" color="secondary">
                {course.rating || '4.5'}
              </ThemedText>
            </View>
            <ThemedText variant="caption" color="secondary">
              {course.students || 0} students
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.courseProgress}>
          <View style={styles.progressInfo}>
            <ThemedText variant="body2" color="primary" weight="semibold">
              {progress}% Complete
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              {timeLeft}
            </ThemedText>
          </View>
          {renderProgressBar(progress)}
        </View>
        
        <View style={styles.courseFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
            <ThemedText variant="caption" color="primary" weight="medium">
              {level}
            </ThemedText>
          </View>
          <ThemedButton
            title="Continue"
            onPress={() => {}}
            variant="primary"
            size="small"
          />
        </View>
      </ThemedCard>
    );
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateY: headerSlideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText variant="h4" color="primary" weight="bold">
              Welcome back,
            </ThemedText>
            <ThemedText variant="h3" color="primary" weight="bold">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName || user?.lastName || 'User'}
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications" size={24} color={theme.colors.primary} />
              <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]} />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >


          {/* User Profile & Stats Cards */}
          <View style={styles.statsSection}>
            <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
              Your Progress
            </ThemedText>
            
            {/* User Profile Info */}
            {userProfile && (
              <ThemedCard variant="elevated" style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.accent]}
                      style={styles.avatar}
                    >
                      <ThemedText variant="h3" color="inverse" weight="bold">
                        {userProfile.first_name?.charAt(0)}{userProfile.last_name?.charAt(0)}
                      </ThemedText>
                    </LinearGradient>
                  </View>
                  <View style={styles.profileInfo}>
                    <ThemedText variant="h5" color="primary" weight="bold">
                      {userProfile.first_name} {userProfile.last_name}
                    </ThemedText>
                    <ThemedText variant="body2" color="secondary">
                      {userProfile.email}
                    </ThemedText>
                    <View style={styles.roleContainer}>
                      <ThemedText variant="caption" color="primary" weight="semibold" style={styles.roleText}>
                        {userProfile.role}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption" color="secondary">
                      Member since {new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            )}
            
            {/* Course Statistics */}
            <View style={styles.statsGrid}>
              {renderStatCard('Total Courses', userStats.totalCourses, 'school', theme.colors.primary)}
            {renderStatCard('Completed', userStats.completedCourses, 'check-circle', theme.colors.success)}
            {renderStatCard('In Progress', userStats.inProgressCourses, 'trending-up', theme.colors.warning)}
            {renderStatCard('Total Hours', userStats.totalHours, 'access-time', theme.colors.info)}
            </View>
          </View>
          



          
          {/* Featured Courses */}
          <View style={styles.coursesSection}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="h4" color="primary" weight="bold">
                Continue Learning
              </ThemedText>
              <TouchableOpacity>
                <ThemedText variant="body2" color="primary" weight="semibold">
                  See all
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.coursesList}>
              {enrolledCourses
                .filter(course => course.progress > 0)
                .slice(0, 3)
                .map(renderCourseCard)}
            </View>
          </View>


        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    alignItems: 'center',
  },
  coursesSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    marginBottom: 0,
  },
  
  // Profile card styles
  profileCard: {
    marginBottom: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  roleContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  roleText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseProgress: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  


});

export default DashboardScreen;