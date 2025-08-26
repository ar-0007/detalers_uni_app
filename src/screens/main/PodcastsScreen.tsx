import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const PodcastsScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  // Mock podcasts data
  const mockPodcasts = [
    {
      id: '1',
      title: 'Car Detailing Fundamentals',
      description: 'Learn the basics of car detailing and maintenance.',
      duration: '45:30',
      date: '2024-01-10',
      image: require('../../assets/logo.png'),
      isNew: true,
    },
    {
      id: '2',
      title: 'Advanced Paint Correction Techniques',
      description: 'Deep dive into professional paint correction methods.',
      duration: '52:15',
      date: '2024-01-08',
      image: require('../../assets/logo.png'),
      isNew: false,
    },
    {
      id: '3',
      title: 'Interior Detailing Masterclass',
      description: 'Complete guide to interior cleaning and detailing.',
      duration: '38:45',
      date: '2024-01-05',
      image: require('../../assets/logo.png'),
      isNew: false,
    },
    {
      id: '4',
      title: 'Ceramic Coating Application',
      description: 'Professional ceramic coating techniques and tips.',
      duration: '41:20',
      date: '2024-01-03',
      image: require('../../assets/logo.png'),
      isNew: false,
    },
  ];

  const handlePlayPodcast = (podcastId: string) => {
    setCurrentPlaying(podcastId);
    Alert.alert('Playing Podcast', 'Audio player will open here...');
  };

  const handlePausePodcast = (podcastId: string) => {
    setCurrentPlaying(null);
    Alert.alert('Paused', 'Podcast paused');
  };

  const renderPodcastCard = (podcast: any) => {
    const isPlaying = currentPlaying === podcast.id;
    
    return (
      <View key={podcast.id} style={[styles.podcastCard, { backgroundColor: theme.colors.card }]}>
        <Image source={podcast.image} style={styles.podcastImage} />
        
        <View style={styles.podcastContent}>
          <View style={styles.podcastHeader}>
            <Text style={[styles.podcastTitle, { color: theme.colors.text }]}>
              {podcast.title}
            </Text>
            {podcast.isNew && (
              <View style={[styles.newBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.newText, { color: theme.colors.background }]}>
                  NEW
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.podcastDescription, { color: theme.colors.textSecondary }]}>
            {podcast.description}
          </Text>

          <View style={styles.podcastMeta}>
            <Text style={[styles.podcastDuration, { color: theme.colors.textSecondary }]}>
              ⏱️ {podcast.duration}
            </Text>
            <Text style={[styles.podcastDate, { color: theme.colors.textSecondary }]}>
              📅 {podcast.date}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.playButton,
              {
                backgroundColor: isPlaying ? theme.colors.error : theme.colors.primary,
              },
            ]}
            onPress={() => isPlaying ? handlePausePodcast(podcast.id) : handlePlayPodcast(podcast.id)}
          >
            <Text style={[styles.playButtonText, { color: theme.colors.background }]}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Educational Podcasts
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Listen to expert insights and tips on car detailing
          </Text>
        </View>

        {/* Podcasts List */}
        <View style={styles.podcastsList}>
          {mockPodcasts.map(renderPodcastCard)}
        </View>

        {/* Player Controls (if playing) */}
        {currentPlaying && (
          <View style={[styles.playerControls, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.playerTitle, { color: theme.colors.text }]}>
              Now Playing: {mockPodcasts.find(p => p.id === currentPlaying)?.title}
            </Text>
            <View style={styles.playerButtons}>
              <TouchableOpacity
                style={[styles.playerButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => Alert.alert('Previous', 'Previous track')}
              >
                <Text style={[styles.playerButtonText, { color: theme.colors.background }]}>
                  ⏮️
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.playerButton, { backgroundColor: theme.colors.error }]}
                onPress={() => handlePausePodcast(currentPlaying)}
              >
                <Text style={[styles.playerButtonText, { color: theme.colors.background }]}>
                  ⏸️
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.playerButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => Alert.alert('Next', 'Next track')}
              >
                <Text style={[styles.playerButtonText, { color: theme.colors.background }]}>
                  ⏭️
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  podcastsList: {
    paddingHorizontal: 20,
  },
  podcastCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  podcastImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  podcastContent: {
    flex: 1,
  },
  podcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  podcastDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  podcastDuration: {
    fontSize: 12,
  },
  podcastDate: {
    fontSize: 12,
  },
  playButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  playerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  playerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerButtonText: {
    fontSize: 18,
  },
});

export default PodcastsScreen; 