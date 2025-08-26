import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  RefreshControl, 
  Dimensions,
  Animated,
  StatusBar,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchPodcasts } from '../../store/actions/courseActions';
import ThemedCard from '../../components/common/ThemedCard';
import ThemedText from '../../components/common/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Podcast, podcastAPI } from '../../services/api';

import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import { useCustomDialog } from '../../hooks/useCustomDialog';

const { width: screenWidth } = Dimensions.get('window');

const PodcastScreen: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { podcasts, podcastsLoading, podcastsError } = useSelector((state: RootState) => state.course);
  const { showDialog, DialogComponent } = useCustomDialog();
  const [refreshing, setRefreshing] = useState(false);
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);
  const [likedPodcasts, setLikedPodcasts] = useState<Set<string>>(new Set());
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [likingPodcast, setLikingPodcast] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPodcasts();
    loadLikedPodcasts();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadPodcasts = async () => {
    try {
      await dispatch(fetchPodcasts() as any);
    } catch (error) {
      console.error('Error loading podcasts:', error);
    }
  };

  const loadLikedPodcasts = async () => {
    try {
      const response = await podcastAPI.getLikedPodcasts();
      if (response.success && response.data) {
        setLikedPodcasts(new Set(response.data));
      }
    } catch (error) {
      console.error('Error loading liked podcasts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPodcasts(), loadLikedPodcasts()]);
    setRefreshing(false);
  };

  const handleVideoPress = (podcast: Podcast) => {
    if (podcast.video_url) {
      setSelectedPodcast(podcast);
      setVideoPlayerVisible(true);
    } else {
      showDialog({
        title: 'Error',
        message: 'Video not available',
        type: 'error'
      });
    }
  };

  const handleLikePress = async (podcastId: string) => {
    if (likingPodcast === podcastId) return; // Prevent multiple requests
    
    setLikingPodcast(podcastId);
    const wasLiked = likedPodcasts.has(podcastId);
    
    // Optimistic update
    setLikedPodcasts(prev => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(podcastId);
      } else {
        newSet.add(podcastId);
      }
      return newSet;
    });
    
    try {
      if (wasLiked) {
        await podcastAPI.unlikePodcast(podcastId);
      } else {
        await podcastAPI.likePodcast(podcastId);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLikedPodcasts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(podcastId);
        } else {
          newSet.delete(podcastId);
        }
        return newSet;
      });
      
      showDialog({
        title: 'Error',
        message: 'Failed to update like status. Please try again.',
        type: 'error'
      });
    } finally {
      setLikingPodcast(null);
    }
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'Unknown';
    return duration;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const renderVideoCard = (podcast: Podcast, index: number) => (
    <Animated.View 
      key={podcast.podcast_id} 
      style={[
        styles.videoCardContainer,
        { opacity: fadeAnim }
      ]}
    >
      <ThemedCard variant="elevated" style={styles.videoCard}>
        {/* Video Thumbnail Container */}
        <View style={styles.thumbnailContainer}>
          {podcast.thumbnail_url ? (
            <Image 
              source={{ uri: podcast.thumbnail_url }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: theme.colors.card }]}>
              <Icon name="video-library" size={40} color={theme.colors.primary} />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Play Button Overlay */}
          <TouchableOpacity 
            style={styles.playButtonOverlay}
            onPress={() => handleVideoPress(podcast)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.playButton,
              { backgroundColor: playingPodcast === podcast.podcast_id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)' }
            ]}>
              <Icon 
                name={playingPodcast === podcast.podcast_id ? "pause" : "play-arrow"} 
                size={28} 
                color={theme.colors.primary} 
              />
            </View>
          </TouchableOpacity>

          {/* Duration Badge */}
          {podcast.duration && (
            <View style={styles.durationBadge}>
              <ThemedText variant="caption" color="inverse" weight="bold">
                {formatDuration(podcast.duration)}
              </ThemedText>
            </View>
          )}

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <ThemedText variant="caption" color="inverse" weight="bold">
              {podcast.status?.charAt(0).toUpperCase() + podcast.status?.slice(1) || 'Published'}
            </ThemedText>
          </View>
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <View style={styles.titleContainer}>
            <ThemedText variant="h5" weight="bold" numberOfLines={2} style={styles.title}>
              {podcast.title}
            </ThemedText>
            <TouchableOpacity 
              style={[styles.likeButton, { opacity: likingPodcast === podcast.podcast_id ? 0.5 : 1 }]}
              onPress={() => handleLikePress(podcast.podcast_id)}
              disabled={likingPodcast === podcast.podcast_id}
            >
              <Icon 
                name={likedPodcasts.has(podcast.podcast_id) ? "favorite" : "favorite-border"} 
                size={20} 
                color={likedPodcasts.has(podcast.podcast_id) ? theme.colors.error : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {podcast.description && (
            <ThemedText variant="body2" color="secondary" numberOfLines={3} style={styles.description}>
              {podcast.description}
            </ThemedText>
          )}

          {/* Video Meta */}
          <View style={styles.videoMeta}>
            <View style={styles.metaItem}>
              <Icon name="access-time" size={14} color={theme.colors.textSecondary} />
              <ThemedText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                {new Date(podcast.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
            
            {podcast.views_count && (
              <View style={styles.metaItem}>
                <Icon name="visibility" size={14} color={theme.colors.textSecondary} />
                <ThemedText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                  {formatCount(podcast.views_count)} views
                </ThemedText>
              </View>
            )}

            {podcast.likes_count && (
              <View style={styles.metaItem}>
                <Icon name="favorite" size={14} color={theme.colors.textSecondary} />
                <ThemedText variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                  {formatCount(podcast.likes_count)} likes
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ThemedCard>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <ThemedCard variant="glass" style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="video-library" size={48} color={theme.colors.primary} />
          </View>
          <ThemedText variant="h5" weight="bold" align="center" style={{ marginTop: 20 }}>
            No Podcasts Available
          </ThemedText>
          <ThemedText variant="body1" color="secondary" align="center" style={{ marginTop: 8, lineHeight: 22 }}>
            Check back later for new educational content from our experts.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={20} color={theme.colors.background} />
            <ThemedText variant="button" color="inverse" style={{ marginLeft: 8 }}>
              Refresh
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>
    </Animated.View>
  );

  const renderErrorState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <ThemedCard variant="glass" style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Icon name="error-outline" size={48} color={theme.colors.error} />
          </View>
          <ThemedText variant="h5" weight="bold" align="center" style={{ marginTop: 20 }}>
            Error Loading Podcasts
          </ThemedText>
          <ThemedText variant="body1" color="secondary" align="center" style={{ marginTop: 8, lineHeight: 22 }}>
            {podcastsError || 'Something went wrong. Please try again.'}
          </ThemedText>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={20} color={theme.colors.background} />
            <ThemedText variant="button" color="inverse" style={{ marginLeft: 8 }}>
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>
    </Animated.View>
  );

  return (
    <View style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <ThemedText variant="h2" color="inverse" weight="bold" align="center">
            Podcast Studio
          </ThemedText>
          <ThemedText variant="body1" color="inverse" align="center" style={{ marginTop: 8, opacity: 0.9 }}>
            Educational content by our experts
          </ThemedText>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {podcastsLoading && !refreshing ? (
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <ThemedCard variant="glass" style={styles.loadingCard}>
              <View style={styles.loadingContent}>
                <View style={[styles.loadingIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="hourglass-empty" size={32} color={theme.colors.primary} />
                </View>
                <ThemedText variant="body1" color="secondary" style={{ marginTop: 16 }}>
                  Loading podcasts...
                </ThemedText>
              </View>
            </ThemedCard>
          </Animated.View>
        ) : podcastsError ? (
          renderErrorState()
        ) : podcasts.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Enhanced Stats Header */}
            <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
              <ThemedCard variant="glass" style={styles.statsCard}>
                <View style={styles.statsContent}>
                  <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Icon name="video-library" size={24} color={theme.colors.primary} />
                    </View>
                    <ThemedText variant="h4" weight="bold" color="primary" style={{ marginTop: 8 }}>
                      {podcasts.length}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Total Podcasts
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                      <Icon name="play-circle-outline" size={24} color={theme.colors.success} />
                    </View>
                    <ThemedText variant="h4" weight="bold" color="success" style={{ marginTop: 8 }}>
                      {podcasts.filter(p => p.video_url).length}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Available
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                      <Icon name="favorite" size={24} color={theme.colors.warning} />
                    </View>
                    <ThemedText variant="h4" weight="bold" color="warning" style={{ marginTop: 8 }}>
                      {podcasts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Total Likes
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </Animated.View>

            {/* Video List */}
            <View style={styles.videoList}>
              <ThemedText variant="h5" weight="bold" style={{ marginBottom: 20, marginLeft: 4 }}>
                Latest Podcasts
              </ThemedText>
              {podcasts.map(renderVideoCard)}
            </View>
          </>
        )}
      </ScrollView>

      {/* Enhanced Video Player Modal */}
      {selectedPodcast && (
        <EnhancedVideoPlayer
          visible={videoPlayerVisible}
          podcast={selectedPodcast}
          isLiked={likedPodcasts.has(selectedPodcast.podcast_id)}
          onClose={() => {
            setVideoPlayerVisible(false);
            setSelectedPodcast(null);
          }}
          onLike={handleLikePress}
        />
      )}
      <DialogComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  loadingContainer: {
    marginBottom: 20,
  },
  loadingCard: {
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    marginBottom: 20,
  },
  emptyCard: {
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsCard: {
    padding: 24,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoList: {
    marginBottom: 20,
  },
  videoCardContainer: {
    marginBottom: 20,
  },
  videoCard: {
    overflow: 'hidden',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoInfo: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  likeButton: {
    padding: 4,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default PodcastScreen;