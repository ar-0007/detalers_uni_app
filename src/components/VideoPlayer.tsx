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
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

interface VideoPlayerProps {
  visible: boolean;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ visible, videoUrl, title, onClose }) => {
  return (
    <EnhancedVideoPlayer
      visible={visible}
      video={{ 
        video_url: videoUrl, 
        title: title,
        description: '',
        duration: '',
        likes_count: 0,
        video_id: '',
        course_id: '',
        chapter_id: '',
        created_at: '',
        updated_at: '',
        is_liked: false,
        is_completed: false,
        watch_percentage: 0,
      }}
      onClose={onClose}
      onLike={() => {}}
      quizzes={[]}
      assignments={[]}
    />
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