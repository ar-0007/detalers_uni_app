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
// Podcast slice removed - functionality not implemented
import { Podcast, Assignment, Quiz, videoProgressAPI } from '../services/api';
import AssignmentCard from './AssignmentCard';
import QuizCard from './QuizCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EnhancedVideoPlayerProps {
  visible: boolean;
  podcast: Podcast & {
    course_id?: string;
    chapter_id?: string;
  };
  assignments?: Assignment[];
  quizzes?: Quiz[];
  isLiked: boolean;
  onClose: () => void;
  onLike: (podcastId: string) => void;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  visible,
  podcast,
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

  const handleVideoTouch = () => {
    if (showControls) {
      // If controls are visible, hide them immediately
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      // If controls are hidden, show them and start auto-hide timer
      resetControlsTimeout();
    }
  };

  // Double tap to play/pause with visual feedback
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [showTouchFeedback, setShowTouchFeedback] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  
  const handleDoubleTap = (event?: any) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    // Get touch position for visual feedback
    if (event && event.nativeEvent) {
      setTouchPosition({
        x: event.nativeEvent.locationX || screenWidth / 2,
        y: event.nativeEvent.locationY || screenHeight / 2,
      });
    }
    
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      handlePlayPause();
      // Show double-tap feedback
      setShowTouchFeedback(true);
      setTimeout(() => setShowTouchFeedback(false), 800);
    } else {
      setLastTap(now);
      setTimeout(() => {
        if (lastTap === now) {
          handleVideoTouch();
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  useEffect(() => {
    // Initialize controls based on playing state
    if (isPlaying) {
      // If video is playing, hide controls after 3 seconds
      resetControlsTimeout();
    } else {
      // If video is paused, show controls
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);



  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setShowControls(true);
      setIsFullscreen(false);
      setShowSettings(false);
      setShowPlaybackSpeed(false);
      setShowQuality(false);
      setShowVolumeSlider(false);
      setVolume(1);
      setPlaybackRate(1);
      setSelectedQuality('Auto');
      resetControlsTimeout();
      
      // Reset progress tracking state
      setLastSavedTime(0);
    } else {
      // Save progress when closing the player
      if (currentTime > 0 && duration > 0) {
        saveVideoProgress(currentTime);
      }
      
      // Clear progress save interval
      if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
        setProgressSaveInterval(null);
      }
    }
  }, [visible]);

  useEffect(() => {
    const backAction = () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFullscreen]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clear progress save interval on unmount
      if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
      }
      
      // Clear controls timeout on unmount
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    setShowPlaybackSpeed(false);
    resetControlsTimeout();
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowQuality(false);
    resetControlsTimeout();
  };

  const handleVideoLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
    
    // Load existing progress when video loads
    loadVideoProgress();
  };

  const handleVideoProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    
    // Save progress every 10 seconds
    if (Math.abs(data.currentTime - lastSavedTime) >= 10) {
      saveVideoProgress(data.currentTime);
      setLastSavedTime(data.currentTime);
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    setIsLoading(false);
    Alert.alert('Error', 'Failed to load video. Please try again.');
  };

  const handleVideoBuffer = (data: any) => {
    setIsBuffering(data.isBuffering);
  };

  const handleVideoSeek = (data: any) => {
    setCurrentTime(data.currentTime);
    setIsBuffering(false);
    
    // Save progress when user seeks
    saveVideoProgress(data.currentTime);
    setLastSavedTime(data.currentTime);
  };

  // Load existing video progress
  const loadVideoProgress = async () => {
    try {
      if (podcast.course_id && podcast.video_url) {
        const response = await videoProgressAPI.getVideoProgress(podcast.course_id, podcast.video_url);
        if (response.success && response.data) {
          const progress = response.data;
          // Resume from last watched position if more than 30 seconds watched
          if (progress.current_position > 30 && progress.watch_percentage < 90) {
          setCurrentTime(progress.current_position);
          setLastSavedTime(progress.current_position);
          // Seek to the saved position
          if (videoRef.current) {
            videoRef.current.seek(progress.current_position);
          }
          }
        }
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  };

  // Save video progress
  const saveVideoProgress = async (currentTime: number) => {
    try {
      if (podcast.course_id && podcast.video_url && duration > 0) {
        await videoProgressAPI.updateVideoProgress({
          courseId: podcast.course_id,
          videoUrl: podcast.video_url,
          currentTime: currentTime,
          totalDuration: duration,
          chapterId: podcast.chapter_id
        });
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    // Reset menus and timeout
    setShowSettings(false);
    setShowPlaybackSpeed(false);
    resetControlsTimeout();
    setShowQuality(false);
    setShowVolumeSlider(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowPlaybackSpeed(false);
    setShowQuality(false);
    resetControlsTimeout();
  };

  const togglePictureInPicture = () => {
    // Picture-in-picture functionality placeholder
    Alert.alert('Picture-in-Picture', 'Feature coming soon!');
  };

  const handleShareVideo = async () => {
    try {
      await Share.share({
        message: `Check out this video: ${podcast.title}`,
        url: podcast.video_url,
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleLikePress = () => {
    onLike(podcast.podcast_id);
  };

  const handleSeek = (percentage: number) => {
    const seekTime = (percentage / 100) * duration;
    videoRef.current?.seek(seekTime);
    setCurrentTime(seekTime);
    setIsBuffering(true);
    resetControlsTimeout();
  };

  const handleSeekForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const handleSeekBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    // Save current video state before toggling
    const currentVideoTime = currentTime;
    const currentPlayingState = isPlaying;
    
    setIsFullscreen(!isFullscreen);
    resetControlsTimeout();
    
    // Restore video state after a brief delay to ensure smooth transition
    setTimeout(() => {
      if (videoRef.current && currentVideoTime > 0) {
        videoRef.current.seek(currentVideoTime);
        setIsPlaying(currentPlayingState);
      }
    }, 100);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(true);
    setShowControls(true);
    setIsFullscreen(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={isFullscreen ? "light-content" : "dark-content"} 
          backgroundColor={isFullscreen ? "#000" : theme.colors.background}
          hidden={isFullscreen}
        />
        
        {/* Fullscreen Video Component */}
        {isFullscreen && (
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity
                style={styles.fullscreenVideoContainer}
                activeOpacity={1}
                onPress={handleDoubleTap}
              >
              <Video
                  ref={videoRef}
                  source={{ uri: podcast.video_url }}
                  style={styles.fullscreenVideo}
                  resizeMode="contain"
                  paused={!isPlaying}
                  rate={playbackRate}
                  volume={isMuted ? 0 : volume}
                  onLoad={handleVideoLoad}
                  onProgress={handleVideoProgress}
                  onError={handleVideoError}
                  onBuffer={handleVideoBuffer}
                  onSeek={handleVideoSeek}
                  controls={false}
                  repeat={false}
                  playInBackground={false}
                  playWhenInactive={false}
                />
                
              {/* Loading/Buffering Indicator */}
              {(isLoading || isBuffering) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <ThemedText variant="body1" color="inverse" style={{ marginTop: 10 }}>
                    {isLoading ? 'Loading video...' : 'Buffering...'}
                  </ThemedText>
                </View>
              )}

              {/* Controls Overlay */}
              {showControls && (
                <View style={styles.fullscreenControlsOverlay}>
                  <TouchableOpacity style={styles.closeButtonFullscreen} onPress={onClose}>
                    <Icon name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                  
                  {/* Center Controls */}
                  <View style={styles.centerControls}>
                    {/* Seek Backward */}
                    <TouchableOpacity 
                      style={[styles.seekButton, styles.controlButton]} 
                      onPress={handleSeekBackward}
                      activeOpacity={0.7}
                    >
                      <View style={styles.controlButtonBackground}>
                        <Icon name="replay-10" size={32} color="#fff" />
                      </View>
                    </TouchableOpacity>
                    
                    {/* Play/Pause Button */}
                    <TouchableOpacity 
                      style={[styles.centerPlayButton, styles.controlButton]} 
                      onPress={handlePlayPause}
                      activeOpacity={0.7}
                    >
                      <View style={styles.playButtonBackground}>
                        <Icon name={isPlaying ? "pause" : "play-arrow"} size={48} color="#fff" />
                      </View>
                    </TouchableOpacity>
                    
                    {/* Seek Forward */}
                    <TouchableOpacity 
                      style={[styles.seekButton, styles.controlButton]} 
                      onPress={handleSeekForward}
                      activeOpacity={0.7}
                    >
                      <View style={styles.controlButtonBackground}>
                        <Icon name="forward-10" size={32} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Controls */}
                  <View style={styles.fullscreenBottomControls}>
                    <View style={styles.bottomLeftControls}>
                      <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
                        <Icon name={isPlaying ? "pause" : "play-arrow"} size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.volumeButton} onPress={handleVolumeToggle}>
                        <Icon name={isMuted ? "volume-off" : "volume-up"} size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      <View style={styles.timeContainer}>
                        <ThemedText variant="caption" color="inverse" style={styles.timeText}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { width: `${(currentTime / duration) * 100}%` }]} 
                        />
                        <TouchableOpacity 
                          style={[styles.progressThumb, { left: `${(currentTime / duration) * 100}%` }]}
                          onPress={(e) => {
                            const { locationX } = e.nativeEvent;
                            const percentage = (locationX / screenWidth) * 100;
                            handleSeek(percentage);
                          }}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.bottomRightControls}>
                      <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
                        <Icon name="settings" size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.pipButton} onPress={togglePictureInPicture}>
                        <Icon name="picture-in-picture-alt" size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
                        <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Settings Menu */}
                  {showSettings && (
                    <View style={styles.settingsMenu}>
                      <TouchableOpacity 
                        style={styles.settingsItem}
                        onPress={() => {
                          setShowPlaybackSpeed(true);
                          setShowSettings(false);
                        }}
                      >
                        <Icon name="speed" size={18} color="#fff" />
                        <ThemedText variant="body2" color="inverse" style={{ marginLeft: 10, fontSize: 14 }}>
                          Speed ({playbackRate}x)
                        </ThemedText>
                        <Icon name="chevron-right" size={18} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.settingsItem}
                        onPress={() => {
                          setShowQuality(true);
                          setShowSettings(false);
                        }}
                      >
                        <Icon name="high-quality" size={18} color="#fff" />
                        <ThemedText variant="body2" color="inverse" style={{ marginLeft: 10, fontSize: 14 }}>
                          Quality ({selectedQuality})
                        </ThemedText>
                        <Icon name="chevron-right" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Playback Speed Menu */}
                  {showPlaybackSpeed && (
                    <View style={[styles.settingsMenu, { bottom: 100 }]}>
                      <TouchableOpacity 
                        style={styles.settingsHeader}
                        onPress={() => {
                          setShowPlaybackSpeed(false);
                          setShowSettings(true);
                        }}
                      >
                        <Icon name="chevron-left" size={18} color="#fff" />
                        <ThemedText variant="body2" color="inverse" style={{ marginLeft: 6, fontSize: 14 }}>
                          Playback Speed
                        </ThemedText>
                      </TouchableOpacity>
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
                        <TouchableOpacity 
                          key={speed}
                          style={[styles.settingsItem, playbackRate === speed && styles.selectedItem]}
                          onPress={() => handlePlaybackSpeedChange(speed)}
                        >
                          <ThemedText variant="body2" color="inverse" style={{ fontSize: 14 }}>
                            {speed === 1.0 ? 'Normal' : `${speed}x`}
                          </ThemedText>
                          {playbackRate === speed && <Icon name="check" size={18} color="#fff" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Quality Menu */}
                  {showQuality && (
                    <View style={[styles.settingsMenu, { bottom: 100 }]}>
                      <TouchableOpacity 
                        style={styles.settingsHeader}
                        onPress={() => {
                          setShowQuality(false);
                          setShowSettings(true);
                        }}
                      >
                        <Icon name="chevron-left" size={18} color="#fff" />
                        <ThemedText variant="body2" color="inverse" style={{ marginLeft: 6, fontSize: 14 }}>
                          Quality
                        </ThemedText>
                      </TouchableOpacity>
                      {['Auto', '1080p', '720p', '480p', '360p'].map((quality) => (
                        <TouchableOpacity 
                          key={quality}
                          style={[styles.settingsItem, selectedQuality === quality && styles.selectedItem]}
                          onPress={() => handleQualityChange(quality)}
                        >
                          <ThemedText variant="body2" color="inverse" style={{ fontSize: 14 }}>
                            {quality}
                          </ThemedText>
                          {selectedQuality === quality && <Icon name="check" size={18} color="#fff" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {!isFullscreen && (
          <>
            {/* Header */}
            <SafeAreaEdges edges={['top']}>
              <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleClose}>
                  <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <ThemedText variant="h5" color="inverse" weight="bold" numberOfLines={1} style={styles.headerTitle}>
                  {podcast.title}
                </ThemedText>
                <TouchableOpacity style={styles.shareHeaderButton} onPress={handleShareVideo}>
                  <Icon name="share" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaEdges>

            {/* Video Section - Moved to 2nd position */}
            <View style={styles.videoSection}>
              <TouchableOpacity 
              style={styles.videoContainer} 
              activeOpacity={1}
              onPress={handleDoubleTap}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: podcast.video_url }}
                    style={styles.video}
                    resizeMode="contain"
                    paused={!isPlaying}
                    rate={playbackRate}
                    volume={isMuted ? 0 : volume}
                    onLoad={handleVideoLoad}
                    onProgress={handleVideoProgress}
                    onError={handleVideoError}
                    onBuffer={handleVideoBuffer}
                    onSeek={handleVideoSeek}
                    controls={false}
                    repeat={false}
                    playInBackground={false}
                    playWhenInactive={false}
                  />
                  
                {/* Loading/Buffering Indicator */}
                {(isLoading || isBuffering) && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <ThemedText variant="body1" color="inverse" style={{ marginTop: 10 }}>
                      {isLoading ? 'Loading video...' : 'Buffering...'}
                    </ThemedText>
                  </View>
                )}

                {/* Controls Overlay */}
                {showControls && (
                  <View style={styles.controlsOverlay}>
                    {/* Center Controls */}
                    <View style={styles.centerControls}>
                      {/* Seek Backward */}
                      <TouchableOpacity 
                        style={[styles.seekButton, styles.controlButton]} 
                        onPress={handleSeekBackward}
                        activeOpacity={0.7}
                      >
                        <View style={styles.controlButtonBackground}>
                          <Icon name="replay-10" size={32} color="#fff" />
                        </View>
                      </TouchableOpacity>
                      
                      {/* Play/Pause Button */}
                      <TouchableOpacity 
                        style={[styles.centerPlayButton, styles.controlButton]} 
                        onPress={handlePlayPause}
                        activeOpacity={0.7}
                      >
                        <View style={styles.playButtonBackground}>
                          <Icon name={isPlaying ? "pause" : "play-arrow"} size={48} color="#fff" />
                        </View>
                      </TouchableOpacity>
                      
                      {/* Seek Forward */}
                      <TouchableOpacity 
                        style={[styles.seekButton, styles.controlButton]} 
                        onPress={handleSeekForward}
                        activeOpacity={0.7}
                      >
                        <View style={styles.controlButtonBackground}>
                          <Icon name="forward-10" size={32} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                      <View style={styles.bottomLeftControls}>
                        <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
                          <Icon name={isPlaying ? "pause" : "play-arrow"} size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.volumeButton} onPress={handleVolumeToggle}>
                          <Icon name={isMuted ? "volume-off" : "volume-up"} size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <View style={styles.timeContainer}>
                          <ThemedText variant="caption" color="inverse" style={styles.timeText}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[styles.progressFill, { width: `${(currentTime / duration) * 100}%` }]} 
                          />
                          <TouchableOpacity 
                            style={[styles.progressThumb, { left: `${(currentTime / duration) * 100}%` }]}
                            onPress={(e) => {
                              const { locationX } = e.nativeEvent;
                              const percentage = (locationX / screenWidth) * 100;
                              handleSeek(percentage);
                            }}
                          />
                        </View>
                      </View>
                      
                      <View style={styles.bottomRightControls}>
                        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
                          <Icon name="settings" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.pipButton} onPress={togglePictureInPicture}>
                          <Icon name="picture-in-picture-alt" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
                          <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={24} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Settings Menu */}
                    {showSettings && (
                      <View style={styles.settingsMenu}>
                        <TouchableOpacity 
                          style={styles.settingsItem}
                          onPress={() => {
                            setShowPlaybackSpeed(true);
                            setShowSettings(false);
                          }}
                        >
                          <Icon name="speed" size={18} color="#fff" />
                          <ThemedText variant="body2" color="inverse" style={{ marginLeft: 10, fontSize: 14 }}>
                            Speed ({playbackRate}x)
                          </ThemedText>
                          <Icon name="chevron-right" size={18} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.settingsItem}
                          onPress={() => {
                            setShowQuality(true);
                            setShowSettings(false);
                          }}
                        >
                          <Icon name="high-quality" size={18} color="#fff" />
                          <ThemedText variant="body2" color="inverse" style={{ marginLeft: 10, fontSize: 14 }}>
                            Quality ({selectedQuality})
                          </ThemedText>
                          <Icon name="chevron-right" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {/* Playback Speed Menu */}
                    {showPlaybackSpeed && (
                      <View style={[styles.settingsMenu, { bottom: 60 }]}>
                        <TouchableOpacity 
                          style={styles.settingsHeader}
                          onPress={() => {
                            setShowPlaybackSpeed(false);
                            setShowSettings(true);
                          }}
                        >
                          <Icon name="chevron-left" size={18} color="#fff" />
                          <ThemedText variant="body2" color="inverse" style={{ marginLeft: 6, fontSize: 14 }}>
                            Playback Speed
                          </ThemedText>
                        </TouchableOpacity>
                        {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
                          <TouchableOpacity 
                            key={speed}
                            style={[styles.settingsItem, playbackRate === speed && styles.selectedItem]}
                            onPress={() => handlePlaybackSpeedChange(speed)}
                          >
                            <ThemedText variant="body2" color="inverse" style={{ fontSize: 14 }}>
                              {speed === 1.0 ? 'Normal' : `${speed}x`}
                            </ThemedText>
                            {playbackRate === speed && <Icon name="check" size={18} color="#fff" />}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    
                    {/* Quality Menu */}
                    {showQuality && (
                      <View style={[styles.settingsMenu, { bottom: 60 }]}>
                        <TouchableOpacity 
                          style={styles.settingsHeader}
                          onPress={() => {
                            setShowQuality(false);
                            setShowSettings(true);
                          }}
                        >
                          <Icon name="chevron-left" size={18} color="#fff" />
                          <ThemedText variant="body2" color="inverse" style={{ marginLeft: 6, fontSize: 14 }}>
                            Quality
                          </ThemedText>
                        </TouchableOpacity>
                        {['Auto', '1080p', '720p', '480p', '360p'].map((quality) => (
                          <TouchableOpacity 
                            key={quality}
                            style={[styles.settingsItem, selectedQuality === quality && styles.selectedItem]}
                            onPress={() => handleQualityChange(quality)}
                          >
                            <ThemedText variant="body2" color="inverse" style={{ fontSize: 14 }}>
                              {quality}
                            </ThemedText>
                            {selectedQuality === quality && <Icon name="check" size={18} color="#fff" />}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                
                {/* Touch Feedback Indicator */}
                {showTouchFeedback && (
                  <View 
                    style={[
                      styles.touchFeedback,
                      {
                        left: touchPosition.x - 30,
                        top: touchPosition.y - 30,
                      }
                    ]}
                  >
                    <Icon name={isPlaying ? "pause" : "play-arrow"} size={40} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Content Section */}
            <View style={styles.contentSection}>
              {/* Title and Like Section */}
              <ThemedCard variant="elevated" style={styles.titleCard}>
                <View style={styles.titleContainer}>
                  <View style={styles.titleTextContainer}>
                    <ThemedText variant="h5" weight="bold" style={styles.title}>
                      {podcast.title}
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
                      {podcast.likes_count || 0}
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
                  {podcast.description || 'No description available.'}
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
                  {podcast.duration && (
                    <View style={styles.infoItem}>
                      <Icon name="schedule" size={18} color={theme.colors.textSecondary} />
                      <ThemedText variant="body2" color="secondary" style={{ marginLeft: 8 }}>
                        Duration: {podcast.duration}
                      </ThemedText>
                    </View>
                  )}
                 
                  <View style={styles.infoItem}>
                    <Icon name="calendar-today" size={18} color={theme.colors.textSecondary} />
                    <ThemedText variant="body2" color="secondary" style={{ marginLeft: 8 }}>
                      Published: {new Date(podcast.created_at).toLocaleDateString('en-US', {
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