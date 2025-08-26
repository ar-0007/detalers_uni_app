import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
  FlatList,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCourses, clearCourseErrors } from '../../store/actions/courseActions';
import { enrollmentAPI, Course, guestCoursePurchaseAPI } from '../../services/api';
import Button from '../../components/common/Button';
import LinearGradient from 'react-native-linear-gradient';
import GlassCard from '../../components/common/GlassCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCustomDialog } from '../../hooks/useCustomDialog';

const { width: screenWidth } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CoursesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { courses, isLoading, error } = useSelector((state: RootState) => state.course);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { showDialog, DialogComponent } = useCustomDialog();
  const [selectedTab, setSelectedTab] = useState<'my-courses' | 'all-courses'>('my-courses');
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [purchasedLoading, setPurchasedLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  // Email modal removed - courses are now automatically fetched using authenticated user's email
  const [searchQuery, setSearchQuery] = useState('');
  const [myCoursesSearchQuery, setMyCoursesSearchQuery] = useState('');
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [myCoursesLevelFilter, setMyCoursesLevelFilter] = useState<'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('ALL');
  const [exploreLevelFilter, setExploreLevelFilter] = useState<'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('ALL');
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        // Fetch all courses, enrolled courses, and purchased courses on component mount
        await Promise.all([
          dispatch(fetchCourses(true)),
          fetchEnrolledCourses(),
          fetchMyPurchasedCourses() // Automatically fetch user's purchased courses
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, [dispatch, isAuthenticated]);

  // Add focus effect to refresh purchased courses when returning from checkout
  useFocusEffect(
    React.useCallback(() => {
      console.log('CoursesScreen focused - isAuthenticated:', isAuthenticated, 'initialLoading:', initialLoading);
      // Only refresh if user is authenticated and not on initial load
      if (isAuthenticated && !initialLoading) {
        console.log('Refreshing purchased courses due to screen focus');
        fetchMyPurchasedCourses();
      }
    }, [isAuthenticated, initialLoading])
  );

  const fetchEnrolledCourses = async () => {
    try {
      setEnrolledLoading(true);
      const response = await enrollmentAPI.getUserEnrolledCourses();
      if (response.success) {
        setEnrolledCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setEnrolledLoading(false);
    }
  };

  // Secure function to fetch authenticated user's purchased courses
  const fetchMyPurchasedCourses = async () => {
    console.log('fetchMyPurchasedCourses called - isAuthenticated:', isAuthenticated, 'user:', user?.email);
    if (!isAuthenticated || !user) {
      console.log('Not authenticated or no user, clearing purchased courses');
      setPurchasedCourses([]);
      return [];
    }
    
    try {
      console.log('Fetching purchased courses for user:', user.email);
      setPurchasedLoading(true);
      const response = await guestCoursePurchaseAPI.getMyPurchasedCourses();
      console.log('Purchased courses API response:', response);
      if (response.success) {
        console.log('Successfully fetched', response.data?.length || 0, 'purchased courses');
        setPurchasedCourses(response.data || []);
        return response.data || [];
      }
      console.log('API response was not successful:', response);
      return [];
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      showDialog({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch your purchased courses. Please try again.',
        buttons: [{ text: 'OK' }]
      });
      return [];
    } finally {
      setPurchasedLoading(false);
    }
  };

  // DEPRECATED: Legacy function for manual email input (security risk)
  const fetchPurchasedCourses = async (email: string) => {
    try {
      setPurchasedLoading(true);
      const response = await guestCoursePurchaseAPI.getPurchasedCoursesByEmail(email);
      if (response.success) {
        setPurchasedCourses(response.data || []);
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      showDialog({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch purchased courses. Please check your email and try again.',
        buttons: [{ text: 'OK' }]
      });
      return [];
    } finally {
      setPurchasedLoading(false);
    }
  };

  // handleEmailSubmit function removed - courses are now automatically fetched using authenticated user's email

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCourses(true)),
      fetchEnrolledCourses(),
      fetchMyPurchasedCourses() // Use secure method to fetch user's purchased courses
    ]);
    setRefreshing(false);
  };

  // Handle course purchase
  const handleCoursePurchase = async (course: Course) => {
    if (!isAuthenticated || !user) {
      showDialog({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please log in to purchase courses.',
        buttons: [{ text: 'OK' }]
      });
      return;
    }

    setPurchaseLoading(course.course_id);
    
    try {
      const purchaseData = {
        courseId: course.course_id,
        customerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        customerEmail: user.email,
        customerPhone: undefined, // Phone property not available in User type
      };

      console.log('Creating purchase with data:', purchaseData);
      const response = await guestCoursePurchaseAPI.createGuestCoursePurchase(purchaseData);
      console.log('Purchase response:', response);
      
      if (response.success && response.data && response.data.purchase_id) {
        console.log('Navigating to checkout with purchaseId:', response.data.purchase_id);
        
        // Test dialog to confirm we reach this point
        showDialog({
          type: 'success',
          title: 'Purchase Created',
          message: `Purchase ID: ${response.data.purchase_id}. Proceeding to checkout...`,
          buttons: [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to checkout screen
                navigation.navigate('Checkout', { 
                  purchaseId: response.data.purchase_id 
                });
              }
            }
          ]
        });
      } else {
        console.error('Purchase failed or missing purchase_id:', response);
        throw new Error(response.message || 'Purchase failed or invalid response');
      }
    } catch (error: any) {
      console.error('Error purchasing course:', error);
      showDialog({
        title: 'Purchase Failed',
        message: error.message || 'Failed to initiate course purchase. Please try again.',
        type: 'error'
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  // Helper function to group series courses and show only the first part
  const groupSeriesCourses = (courseList: Course[]) => {
    const seriesMap = new Map<string, Course[]>();
    const standaloneCoursesMap = new Map<string, Course>();
    
    courseList.forEach(course => {
      // Check if course is part of a series by looking at title pattern or video_series field
      const isSeriesCourse = course.video_series || 
        (course.title.includes('Part ') && /Part \d+/.test(course.title));
      
      if (isSeriesCourse) {
        // Extract series name from title if video_series is not available
        let seriesName = course.video_series;
        if (!seriesName && course.title.includes('Part ')) {
          seriesName = course.title.replace(/Part \d+.*$/, '').trim();
        }
        
        if (seriesName) {
          if (!seriesMap.has(seriesName)) {
            seriesMap.set(seriesName, []);
          }
          seriesMap.get(seriesName)!.push(course);
        } else {
          standaloneCoursesMap.set(course.course_id, course);
        }
      } else {
        standaloneCoursesMap.set(course.course_id, course);
      }
    });
    
    const result: Course[] = [];
    
    // Add standalone courses
    result.push(...Array.from(standaloneCoursesMap.values()));
    
    // Add first part of each series (or the earliest part available)
    seriesMap.forEach((seriesCourses, seriesName) => {
      // Sort by video_part if available, otherwise by title part number
      const sortedParts = seriesCourses.sort((a, b) => {
        const partA = a.video_part || extractPartNumber(a.title) || 0;
        const partB = b.video_part || extractPartNumber(b.title) || 0;
        return partA - partB;
      });
      const firstPart = sortedParts[0];
      result.push(firstPart);
    });
    
    return result;
  };
  
  // Helper function to extract part number from title
  const extractPartNumber = (title: string): number => {
    const match = title.match(/Part (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Combine enrolled and purchased courses for "My Courses" tab
  const allMyCourses = [...enrolledCourses, ...purchasedCourses].filter((course, index, self) => 
    index === self.findIndex(c => c.course_id === course.course_id)
  );
  
  // Group series courses for "My Courses" tab
  const myCourses = groupSeriesCourses(allMyCourses);

  // Filter available courses (exclude enrolled and purchased ones)
  const allAvailableCourses = courses.filter(course => 
    !allMyCourses.some(myCourse => myCourse.course_id === course.course_id)
  );
  
  // Group series courses for "Explore" tab
  const availableCourses = groupSeriesCourses(allAvailableCourses);

  // Apply search and level filters based on selected tab
  const filteredMyCourses = myCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(myCoursesSearchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(myCoursesSearchQuery.toLowerCase()));
    const matchesLevel = myCoursesLevelFilter === 'ALL' || course.level === myCoursesLevelFilter;
    return matchesSearch && matchesLevel;
  });
  
  const filteredAvailableCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(exploreSearchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(exploreSearchQuery.toLowerCase()));
    const matchesLevel = exploreLevelFilter === 'ALL' || course.level === exploreLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const displayedCourses = selectedTab === 'my-courses' ? filteredMyCourses : filteredAvailableCourses;

  const renderCourseCard = ({ item: course }: { item: Course }) => {
    const isMyCourse = selectedTab === 'my-courses';
    const isPurchased = (course as any).is_purchased;
    
    // Use same logic as groupSeriesCourses to detect series courses
    const isSeriesCourse = course.video_series || 
      (course.title.includes('Part ') && /Part \d+/.test(course.title));
    
    // For series courses, show the series title and indicate it's part of a series
    let displayTitle = course.title;
    if (isSeriesCourse) {
      if (course.video_series && course.video_part) {
        displayTitle = `${course.video_series} - Part ${course.video_part}`;
      } else if (course.title.includes('Part ')) {
        // Title already contains part info, keep as is
        displayTitle = course.title;
      }
    }
    
    return (
      <GlassCard style={styles.courseCard}>
        <View style={styles.courseImageContainer}>
          {course.thumbnail_url ? (
            <Image 
              source={{ uri: course.thumbnail_url }} 
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.courseImage, styles.placeholderImage, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="play-circle-outline" size={40} color={theme.colors.primary} />
            </View>
          )}
          
          {/* Series indicator badge */}
          {isSeriesCourse && (
            <View style={[styles.seriesBadge, { backgroundColor: theme.colors.warning }]}>
              <Icon name="playlist-play" size={12} color={theme.colors.background} />
              <Text style={[styles.seriesText, { color: theme.colors.background }]}>
                Series
              </Text>
            </View>
          )}
          
          {isMyCourse && (
             <View style={[styles.statusBadge, { backgroundColor: isPurchased ? theme.colors.success : theme.colors.primary }]}>
               <Icon 
                 name={isPurchased ? 'shopping-cart' : 'school'} 
                 size={12} 
                 color={theme.colors.background} 
               />
               <Text style={[styles.statusText, { color: theme.colors.background }]}>
                 {isPurchased ? 'Purchased' : 'Enrolled'}
               </Text>
             </View>
           )}
        </View>
        
        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {displayTitle}
            </Text>
            
            <View style={styles.courseMeta}>
              {course.level && (
                <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.levelText, { color: theme.colors.primary }]}>
                    {course.level}
                  </Text>
                </View>
              )}
              
              {!isMyCourse && (
                 <Icon name="lock" size={18} color={theme.colors.textSecondary} />
               )}
            </View>
          </View>
          
          {course.description && (
            <Text style={[styles.courseDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {course.description}
            </Text>
          )}
          
          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Icon name="access-time" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {course.duration_hours ? `${course.duration_hours}h` : 'N/A'}
              </Text>
            </View>
            
            {course.instructor_id && (
              <View style={styles.statItem}>
                <Icon name="person" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  Instructor
                </Text>
              </View>
            )}
            
            {course.price && (
              <View style={styles.statItem}>
                <Icon name="attach-money" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  {course.price}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
               styles.actionButton,
               { 
                 backgroundColor: isMyCourse ? theme.colors.success : theme.colors.primary,
               }
             ]}
             disabled={purchaseLoading === course.course_id}
             onPress={() => {
               if (isMyCourse) {
                 // Navigate to CoursePlayerScreen for purchased/enrolled courses
                 navigation.navigate('CoursePlayer', { course });
               } else {
                 handleCoursePurchase(course);
               }
             }}
           >
             {purchaseLoading === course.course_id ? (
               <ActivityIndicator size="small" color={theme.colors.background} />
             ) : (
               <>
                 <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
                   {isMyCourse ? (isSeriesCourse ? 'Watch Series' : 'Continue Learning') : 'Buy Now'}
                 </Text>
                 <Icon 
                   name={isMyCourse ? (isSeriesCourse ? "playlist-play" : "play-arrow") : "shopping-cart"} 
                   size={18} 
                   color={theme.colors.background} 
                 />
               </>
             )}
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Learning</Text>
      <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
        {selectedTab === 'my-courses' 
          ? `${displayedCourses.length} course${displayedCourses.length !== 1 ? 's' : ''} available`
          : `${displayedCourses.length} course${displayedCourses.length !== 1 ? 's' : ''} to explore`
        }
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'my-courses' && [styles.activeTab, { backgroundColor: theme.colors.primary }]
        ]}
        onPress={() => setSelectedTab('my-courses')}
      >
        <Icon 
          name="school" 
          size={18} 
          color={selectedTab === 'my-courses' ? theme.colors.background : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'my-courses' ? theme.colors.background : theme.colors.textSecondary }
        ]}>
          My Courses
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'all-courses' && [styles.activeTab, { backgroundColor: theme.colors.primary }]
        ]}
        onPress={() => setSelectedTab('all-courses')}
      >
        <Icon 
          name="explore" 
          size={18} 
          color={selectedTab === 'all-courses' ? theme.colors.background : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'all-courses' ? theme.colors.background : theme.colors.textSecondary }
        ]}>
          Explore
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLevelFilter = () => {
    const currentLevelFilter = selectedTab === 'my-courses' ? myCoursesLevelFilter : exploreLevelFilter;
    const setCurrentLevelFilter = selectedTab === 'my-courses' ? setMyCoursesLevelFilter : setExploreLevelFilter;
    const levels = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
    
    return (
      <View style={styles.levelFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelFilterContent}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelFilterButton,
                {
                  backgroundColor: currentLevelFilter === level ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary,
                }
              ]}
              onPress={() => setCurrentLevelFilter(level)}
            >
              <Text style={[
                styles.levelFilterText,
                {
                  color: currentLevelFilter === level ? theme.colors.background : theme.colors.text,
                }
              ]}>
                {level === 'ALL' ? 'All Levels' : level.charAt(0) + level.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSearchAndActions = () => {
    const currentSearchQuery = selectedTab === 'my-courses' ? myCoursesSearchQuery : exploreSearchQuery;
    const setCurrentSearchQuery = selectedTab === 'my-courses' ? setMyCoursesSearchQuery : setExploreSearchQuery;
    
    return (
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={selectedTab === 'my-courses' ? 'Search my courses...' : 'Search courses...'}
            placeholderTextColor={theme.colors.textSecondary}
            value={currentSearchQuery}
            onChangeText={setCurrentSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {currentSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setCurrentSearchQuery('')}>
              <Icon name="clear" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {renderLevelFilter()}
      </View>
    );
  };

  const renderEmptyState = () => {
    const currentSearchQuery = selectedTab === 'my-courses' ? myCoursesSearchQuery : exploreSearchQuery;
    
    return (
      <View style={styles.emptyState}>
        <Icon 
          name={selectedTab === 'my-courses' ? 'school' : 'explore'} 
          size={64} 
          color={theme.colors.textSecondary} 
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          {selectedTab === 'my-courses' ? 'No Courses Yet' : 'No Courses Found'}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          {selectedTab === 'my-courses' 
            ? isAuthenticated 
              ? 'You haven\'t purchased any courses yet. Explore available courses to get started.'
              : 'Please log in to view your purchased courses.'
            : currentSearchQuery 
              ? 'Try adjusting your search terms.'
              : 'Check back later for new courses.'
          }
        </Text>
      </View>
    );
  };

  // Email modal removed - courses are now automatically fetched using authenticated user's email

  // Show initial loading screen
  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderHeader()}
        {renderTabs()}
        {renderSearchAndActions()}
        
        {displayedCourses.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={displayedCourses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.course_id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            numColumns={1}
          />
        )}
      </Animated.View>
      <DialogComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seriesBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seriesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseContent: {
    padding: 20,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  courseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelFilterContainer: {
    marginTop: 12,
  },
  levelFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  levelFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  levelFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  // Email modal styles removed - courses are now automatically fetched using authenticated user's email
});

export default CoursesScreen;