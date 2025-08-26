import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  LayoutChangeEvent,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from './common/ThemedText'; // Assuming you have this

interface VideoPlayerProps {
  visible: boolean;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ visible, videoUrl, title, onClose }) => {
  const videoRef = useRef<VideoRef>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Auto-play when the modal opens
  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
      hideControlsWithDelay(); // Start the timer to hide controls
    }
  }, [visible]);

  // Clears the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const hideControlsWithDelay = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 4000); // Hide controls after 4 seconds
  };

  // This is the improved toggle logic
  const toggleControls = () => {
    setShowControls(prevShowControls => {
      const newShowControls = !prevShowControls;
      if (newShowControls) {
        hideControlsWithDelay(); // If showing controls, set timer to hide them
      } else {
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current); // If hiding controls manually, clear timer
        }
      }
      return newShowControls;
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
    hideControlsWithDelay(); // Reset timer on interaction
  };

  const handleVideoLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const handleVideoProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const handleVideoError = (error: any) => {
    console.error("Video Error:", error);
    setIsLoading(false);
  };

  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  const handleSeek = (event: { nativeEvent: { locationX: number } }) => {
    if (duration > 0 && progressBarWidth > 0) {
      const position = event.nativeEvent.locationX;
      const percentage = (position / progressBarWidth);
      const seekTime = percentage * duration;
      videoRef.current?.seek(seekTime);
      setCurrentTime(seekTime);
      hideControlsWithDelay(); // Reset timer on interaction
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return isNaN(mins) || isNaN(secs) ? '0:00' : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" supportedOrientations={['landscape', 'portrait']}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.videoContainer} activeOpacity={1} onPress={toggleControls}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="contain"
            paused={!isPlaying}
            onLoad={handleVideoLoad}
            onProgress={handleVideoProgress}
            onError={handleVideoError}
            controls={false} // ✅ Crucial fix: Make sure this is false
          />

          {isLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {showControls && (
            <View style={[styles.overlay, styles.controlsOverlay]}>
              <View style={styles.topBar}>
                <ThemedText variant="h5" color="inverse" weight="bold" numberOfLines={1} style={styles.title}>
                  {title}
                </ThemedText>
                <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                  <Icon name="close" size={30} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.centerControls}>
                {!isLoading && (
                  <TouchableOpacity onPress={handlePlayPause} style={styles.iconButton}>
                    <Icon name={isPlaying ? "pause" : "play-arrow"} size={60} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.bottomBar}>
                <ThemedText style={styles.timeText}>{formatTime(currentTime)}</ThemedText>
                <TouchableOpacity style={styles.progressContainer} onPress={handleSeek} onLayout={onProgressBarLayout} activeOpacity={0.8}>
                  <View style={styles.progressBarBackground} />
                  <View style={[styles.progressBarFill, { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }]}/>
                </TouchableOpacity>
                <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  videoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  controlsOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 10 },
  title: { flex: 1, textAlign: 'left', color: '#fff' },
  iconButton: { padding: 8 },
  centerControls: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingBottom: 20 },
  timeText: { color: '#fff', width: 50, textAlign: 'center' },
  progressContainer: { flex: 1, height: 20, justifyContent: 'center', marginHorizontal: 10 },
  progressBarBackground: { height: 4, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: '#fff', borderRadius: 2, position: 'absolute' },
});

export default VideoPlayer;