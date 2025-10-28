import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  Share,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView as SafeAreaEdges } from 'react-native-safe-area-context';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from './common/ThemedText';
import ThemedCard from './common/ThemedCard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useCustomDialog } from '../hooks/useCustomDialog';
// Video functionality implemented
import { Assignment, Quiz, videoProgressAPI } from '../services/api';
import AssignmentCard from './AssignmentCard';
import QuizCard from './QuizCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoContent {
  video_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  status: 'draft' | 'published' | 'archived';
  views_count?: number;
  likes_count?: number;
  created_at: string;
  updated_at: string;
  course_id?: string;
  chapter_id?: string;
}

interface EnhancedVideoPlayerProps {
  visible: boolean;
  video: VideoContent;
  assignments?: Assignment[];
  quizzes?: Quiz[];
  isLiked: boolean;
  onClose: () => void;
  onLike: (videoId: string) => void;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  visible,
  video,
  assignments = [],
  quizzes = [],
  isLiked,
  onClose,
  onLike,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const styles = createStyles(theme);
  const { showDialog, DialogComponent } = useCustomDialog();
  const videoRef = useRef<VideoRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Video progress tracking state
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [progressSaveInterval, setProgressSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (visible) {
      setIsPlaying(true); // Autoplay when modal becomes visible
      resetControlsTimeout();
    } else {
      setIsPlaying(false); // Pause when modal is hidden
    }
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        toggleFullscreen();
        return true; // Prevent default back button behavior
      }
      return false; // Allow default behavior if not in fullscreen
    });

    return () => backHandler.remove();
  }, [isFullscreen]);

  // Effect to handle video progress saving
  useEffect(() => {
    if (isPlaying) {
      // Start saving progress every 5 seconds
      const interval = setInterval(() => {
        if (currentTime > lastSavedTime + 5) { // Check if more than 5 seconds have passed
          // videoProgressAPI(video.video_id, currentTime);
          setLastSavedTime(currentTime);
        }
      }, 5000);
      setProgressSaveInterval(interval);
    } else {
      // Clear interval when not playing
      if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
        setProgressSaveInterval(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
      }
    };
  }, [isPlaying, currentTime, lastSavedTime, video.video_id]);

  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
    setIsPlaying(true); // Ensure playing state is true on load
    resetControlsTimeout();
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    if (isBuffering) {
      setIsBuffering(false);
    }
  };

  const handleEnd = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Save final progress
    // videoProgressAPI(video.video_id, duration);
  };

  const handleError = (error: any) => {
    console.error('Video Error:', error);
    setIsLoading(false);
    Alert.alert('Video Error', 'There was an error playing the video. Please try again later.');
  };

  const handleBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setIsBuffering(isBuffering);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const handleSeek = (value: number) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
    resetControlsTimeout();
  };

  const handleForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const handleBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowPlaybackSpeed(false);
    setShowSettings(false);
    resetControlsTimeout();
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowQuality(false);
    setShowSettings(false);
    resetControlsTimeout();
    // Here you would typically change the video source based on the selected quality
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (isMuted && value > 0) {
      setIsMuted(false);
    } else if (!isMuted && value === 0) {
      setIsMuted(true);
    }
    resetControlsTimeout();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this video: ${video.title}`,
        url: video.video_url, // Assuming video_url is a shareable link
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
      h > 0 ? h : null,
      m,
      s
    ]
    .filter(Boolean)
    .map(t => t! < 10 ? `0${t}` : t)
    .join(':');
  };

  const onTouchVideo = () => {
    if (showSettings) {
      setShowSettings(false);
      setShowPlaybackSpeed(false);
      setShowQuality(false);
      setShowVolumeSlider(false);
    } else {
      setShowControls(!showControls);
    }
    if (!showControls) {
      resetControlsTimeout();
    } else if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <TouchableOpacity
        style={styles.progressBar}
        onPress={(e) => {
          const newTime = (e.nativeEvent.locationX / (styles.progressBar.width || screenWidth)) * duration;
          handleSeek(newTime);
        }}
      >
        <View style={[styles.progressFill, { width: `${(currentTime / duration) * 100}%` }]} />
        <View style={[styles.progressThumb, { left: `${(currentTime / duration) * 100}%` }]} />
      </TouchableOpacity>
    </View>
  );

  const renderCenterControls = () => (
    <Animated.View style={[styles.centerControls, { opacity: showControls ? 1 : 0 }]}>
      <TouchableOpacity onPress={handleBackward} style={styles.seekButton}>
        <Icon name="replay-10" size={32} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={togglePlayPause} style={styles.centerPlayButton}>
        <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={48} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleForward} style={styles.seekButton}>
        <Icon name="forward-10" size={32} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBottomControls = () => (
    <Animated.View style={[styles.bottomControls, { opacity: showControls ? 1 : 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={styles.bottomLeftControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
            <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMute} style={styles.volumeButton}>
            <Icon name={isMuted ? 'volume-off' : 'volume-up'} size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>{formatTime(currentTime)} / {formatTime(duration)}</ThemedText>
          </View>
        </View>
        <View style={styles.bottomRightControls}>
          <TouchableOpacity onPress={() => { setShowSettings(true); setShowControls(true); }} style={styles.settingsButton}>
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
          {Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => { /* Handle PIP */ }} style={styles.pipButton}>
              <Icon name="picture-in-picture-alt" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
            <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {renderProgressBar()}
    </Animated.View>
  );

  const renderSettingsMenu = () => (
    showSettings && (
      <View style={styles.settingsMenu}>
        {showPlaybackSpeed ? (
          <ScrollView>
            <TouchableOpacity onPress={() => setShowPlaybackSpeed(false)} style={styles.settingsHeader}>
              <Icon name="arrow-back" size={24} color="#fff" />
              <ThemedText style={{ marginLeft: 16, fontSize: 16 }}>Playback Speed</ThemedText>
            </TouchableOpacity>
            {[0.5, 1.0, 1.5, 2.0].map(rate => (
              <TouchableOpacity key={rate} onPress={() => handlePlaybackRateChange(rate)} style={[styles.settingsItem, playbackRate === rate && styles.selectedItem]}>
                <ThemedText>{rate}x</ThemedText>
                {playbackRate === rate && <Icon name="check" size={20} color="#fff" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : showQuality ? (
          <ScrollView>
            <TouchableOpacity onPress={() => setShowQuality(false)} style={styles.settingsHeader}>
              <Icon name="arrow-back" size={24} color="#fff" />
              <ThemedText style={{ marginLeft: 16, fontSize: 16 }}>Quality</ThemedText>
            </TouchableOpacity>
            {['Auto', '1080p', '720p', '480p'].map(quality => (
              <TouchableOpacity key={quality} onPress={() => handleQualityChange(quality)} style={[styles.settingsItem, selectedQuality === quality && styles.selectedItem]}>
                <ThemedText>{quality}</ThemedText>
                {selectedQuality === quality && <Icon name="check" size={20} color="#fff" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowPlaybackSpeed(true)} style={styles.settingsItem}>
              <Icon name="slow-motion-video" size={24} color="#fff" />
              <ThemedText style={{ marginLeft: 16 }}>Playback Speed</ThemedText>
              <ThemedText style={{ marginLeft: 'auto', color: '#aaa' }}>{playbackRate}x</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQuality(true)} style={styles.settingsItem}>
              <Icon name="high-quality" size={24} color="#fff" />
              <ThemedText style={{ marginLeft: 16 }}>Quality</ThemedText>
              <ThemedText style={{ marginLeft: 'auto', color: '#aaa' }}>{selectedQuality}</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    )
  );

  const renderVideoPlayer = () => (
    <View style={isFullscreen ? styles.fullscreenVideoContainer : styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: video.video_url }}
        style={isFullscreen ? styles.fullscreenVideo : styles.video}
        controls={true}
        // controls={false}
        // resizeMode={isFullscreen ? 'contain' : 'cover'}
        // autoplay={true}
        // paused={!isPlaying}
        // onBuffer={handleBuffer}
        // onError={handleError}
        // onLoad={handleLoad}
        // onProgress={handleProgress}
        // onEnd={handleEnd}
        // fullscreen={isFullscreen}
        // onFullscreenPlayerWillPresent={() => setIsFullscreen(true)}
        // onFullscreenPlayerWillDismiss={() => setIsFullscreen(false)}
        // playbackRate={playbackRate}
        // muted={isMuted}
        // volume={volume}
      />
      {/* <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={onTouchVideo}
      >
        <>
          {isLoading || isBuffering ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            showControls && (
              <>
                {renderCenterControls()}
                {renderBottomControls()}
              </>
            )
          )}
        </>
      </TouchableOpacity>
      {renderSettingsMenu()}
      {isFullscreen && (
        <TouchableOpacity onPress={toggleFullscreen} style={styles.closeButtonFullscreen}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      )} */}
    </View>
  );

  const renderContent = () => (
    <ScrollView style={styles.scrollContainer}>
      {/* Content Section */}
    <View style={styles.contentSection}>
      {/* Title and Like Section */}
      <ThemedCard variant="elevated" style={styles.titleCard}>
        <View style={styles.titleContainer}>
          <View style={styles.titleTextContainer}>
            <ThemedText variant="h5" weight="bold" style={styles.title}>
              {video.title}
            </ThemedText>
            
          </View>
          <TouchableOpacity 
            style={[styles.likeButton, { backgroundColor: isLiked ? theme.colors.error : 'transparent' }]}
            onPress={handleLikePress}
          >
            <Icon 
              name={isLiked ? "favorite" : "favorite-border"} 
              size={24} 
              color={isLiked ? "#fff" : theme.colors.error} 
            />
            <ThemedText 
              variant="caption" 
              color={isLiked ? "inverse" : "error"} 
              style={{ marginTop: 2 }}
            >
              {video.likes_count || 0}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>

      {/* Description Section */}
      <ThemedCard variant="elevated" style={styles.descriptionCard}>
        <View style={styles.descriptionHeader}>
          <Icon name="description" size={20} color={theme.colors.primary} />
          <ThemedText variant="h5" weight="bold" style={{ marginLeft: 8 }}>
            Description
          </ThemedText>
        </View>
        <ThemedText variant="body1" style={styles.description}>
          {video.description || 'No description available.'}
        </ThemedText>
      </ThemedCard>

      {/* Video Information */}
      <ThemedCard variant="elevated" style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Icon name="info" size={20} color={theme.colors.primary} />
          <ThemedText variant="h5" weight="bold" style={{ marginLeft: 8 }}>
            Video Information
          </ThemedText>
        </View>
        <View style={styles.infoContent}>
          {video.duration && (
            <View style={styles.infoItem}>
              <Icon name="schedule" size={18} color={theme.colors.textSecondary} />
              <ThemedText variant="body2" color="secondary" style={{ marginLeft: 8 }}>
                Duration: {video.duration}
              </ThemedText>
            </View>
          )}
         
          <View style={styles.infoItem}>
            <Icon name="calendar-today" size={18} color={theme.colors.textSecondary} />
            <ThemedText variant="body2" color="secondary" style={{ marginLeft: 8 }}>
              Published: {new Date(video.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </ThemedText>
          </View>
        </View>
      </ThemedCard>

      {/* Quizzes Section */}
      {quizzes && quizzes.length > 0 && (
        <ThemedCard variant="elevated" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="quiz" size={20} color={theme.colors.secondary} />
            <ThemedText variant="h5" weight="bold" style={{ marginLeft: 8 }}>
              Quizzes ({quizzes.length})
            </ThemedText>
          </View>
          <View style={styles.quizAssignmentContent}>
            {quizzes.map((quiz) => (
              <View key={quiz.quiz_id} style={styles.quizAssignmentItem}>
                <QuizCard quiz={quiz} />
              </View>
            ))}
          </View>
        </ThemedCard>
      )}

      {/* Assignments Section */}
      {assignments && assignments.length > 0 && (
        <ThemedCard variant="elevated" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="assignment" size={20} color={theme.colors.warning} />
            <ThemedText variant="h5" weight="bold" style={{ marginLeft: 8 }}>
              Assignments ({assignments.length})
            </ThemedText>
          </View>
          <View style={styles.quizAssignmentContent}>
            {assignments.map((assignment) => (
              <View key={assignment.assignment_id} style={styles.quizAssignmentItem}>
                <AssignmentCard assignment={assignment} />
              </View>
            ))}
          </View>
        </ThemedCard>
      )}
    </View>
  </ScrollView>
  </>
)}
</SafeAreaView>
<DialogComponent />
</Modal>
);
};

const createStyles = (theme: any) => StyleSheet.create({
container: {
flex: 1,
backgroundColor: theme.colors.background,
},
scrollContainer: {
flex: 1,
},
header: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingTop: Platform.OS === 'ios' ? 0 : 10,
paddingBottom: 15,
paddingHorizontal: 20,
backgroundColor: theme.colors.primary,
},
backButton: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: 'rgba(255,255,255,0.2)',
justifyContent: 'center',
alignItems: 'center',
},
headerTitle: {
flex: 1,
textAlign: 'center',
marginHorizontal: 20,
},
shareHeaderButton: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: 'rgba(255,255,255,0.2)',
justifyContent: 'center',
alignItems: 'center',
},
videoSection: {
backgroundColor: '#000',
},
videoContainer: {
width: screenWidth,
height: screenWidth * 9 / 16, // 16:9 aspect ratio
position: 'relative',
justifyContent: 'center',
},
video: {
width: '100%',
height: '100%',
},
loadingOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(0,0,0,0.7)',
},
controlsOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
justifyContent: 'space-between',
alignItems: 'center',
},
centerControls: {
position: 'absolute',
top: '50%',
left: '50%',
transform: [{ translateX: -100 }, { translateY: -60 }],
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
width: 200,
},
centerPlayButton: {
backgroundColor: 'rgba(0, 0, 0, 0.7)',
borderRadius: 28,
padding: 12,
justifyContent: 'center',
alignItems: 'center',
},
seekButton: {
backgroundColor: 'rgba(0, 0, 0, 0.6)',
borderRadius: 22,
padding: 8,
justifyContent: 'center',
alignItems: 'center',
},
controlButton: {
shadowColor: '#000',
shadowOffset: {
width: 0,
height: 2,
},
shadowOpacity: 0.25,
shadowRadius: 3.84,
elevation: 5,
},
controlButtonBackground: {
backgroundColor: 'rgba(0, 0, 0, 0.8)',
borderRadius: 22,
padding: 6,
justifyContent: 'center',
alignItems: 'center',
},
playButtonBackground: {
backgroundColor: 'rgba(0, 0, 0, 0.8)',
borderRadius: 28,
padding: 10,
justifyContent: 'center',
alignItems: 'center',
},
touchFeedback: {
position: 'absolute',
width: 60,
height: 60,
backgroundColor: 'rgba(0, 0, 0, 0.8)',
borderRadius: 30,
justifyContent: 'center',
alignItems: 'center',
zIndex: 1000,
},
bottomControls: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
flexDirection: 'column',
backgroundColor: 'rgba(0, 0, 0, 0.8)',
paddingHorizontal: 16,
paddingVertical: 12,
},
fullscreenBottomControls: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
flexDirection: 'row',
alignItems: 'center',
backgroundColor: 'rgba(0, 0, 0, 0.8)',
paddingHorizontal: 16,
paddingVertical: 12,
},
bottomLeftControls: {
flexDirection: 'row',
alignItems: 'center',
},
bottomRightControls: {
flexDirection: 'row',
alignItems: 'center',
marginLeft: 'auto',
},
playPauseButton: {
marginRight: 16,
},
volumeButton: {
marginRight: 16,
},
timeContainer: {
marginRight: 16,
},
settingsButton: {
marginLeft: 12,
},
pipButton: {
marginLeft: 12,
},
fullscreenButton: {
marginLeft: 12,
},
progressContainer: {
flex: 1,
marginRight: 120,
},
timeText: {
fontSize: 12,
color: '#fff',
},
settingsMenu: {
position: 'absolute',
bottom: 80,
right: 20,
backgroundColor: 'rgba(0, 0, 0, 0.9)',
borderRadius: 8,
minWidth: 200,
maxHeight: 300,
},
settingsItem: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 16,
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: 'rgba(255, 255, 255, 0.1)',
},
settingsHeader: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 16,
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: 'rgba(255, 255, 255, 0.2)',
backgroundColor: 'rgba(255, 255, 255, 0.1)',
},
selectedItem: {
backgroundColor: 'rgba(255, 0, 0, 0.2)',
justifyContent: 'space-between',
},
closeButtonFullscreen: {
position: 'absolute',
top: 20,
right: 20,
backgroundColor: 'rgba(0, 0, 0, 0.7)',
borderRadius: 20,
padding: 8,
zIndex: 1000,
},
progressBarContainer: {
flex: 1,
},
progressBar: {
height: 6,
backgroundColor: 'rgba(255, 255, 255, 0.3)',
borderRadius: 3,
position: 'relative',
},
progressFill: {
height: '100%',
backgroundColor: '#FF0000',
borderRadius: 3,
},
progressThumb: {
position: 'absolute',
top: -4,
width: 14,
height: 14,
backgroundColor: '#FF0000',
borderRadius: 7,
marginLeft: -7,
},
contentSection: {
padding: 20,
backgroundColor: theme.colors.background,
},
titleCard: {
marginBottom: 16,
padding: 20,
},
titleContainer: {
flexDirection: 'row',
alignItems: 'flex-start',
justifyContent: 'space-between',
},
titleTextContainer: {
flex: 1,
marginRight: 16,
},
title: {
marginBottom: 8,
lineHeight: 28,
},
metaContainer: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: 16,
},
metaItem: {
flexDirection: 'row',
alignItems: 'center',
},
likeButton: {
alignItems: 'center',
justifyContent: 'center',
padding: 8,
borderRadius: 8,
minWidth: 60,
},
descriptionCard: {
marginBottom: 16,
padding: 20,
},
descriptionHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},
description: {
lineHeight: 24,
},
infoCard: {
marginBottom: 16,
padding: 20,
},
infoHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 16,
},
infoContent: {
gap: 12,
},
infoItem: {
flexDirection: 'row',
alignItems: 'center',
},
quizAssignmentContent: {
gap: 12,
},
quizAssignmentItem: {
marginBottom: 8,
},
// Fullscreen styles
fullscreenContainer: {
flex: 1,
backgroundColor: '#000',
},
fullscreenVideoContainer: {
width: screenWidth,
height: screenHeight,
position: 'relative',
justifyContent: 'center',
},
fullscreenVideo: {
width: '100%',
height: '100%',
},
fullscreenControlsOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
justifyContent: 'space-between',
alignItems: 'center',
},
});

export default EnhancedVideoPlayer;