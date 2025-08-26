import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Certificate from '../Certificate';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CertificateModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  visible,
  onClose,
  userName,
  courseName,
  instructorName,
  completionDate,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 I've successfully completed "${courseName}"!\n\nCertificate Details:\n👤 Student: ${userName}\n📚 Course: ${courseName}\n👨‍🏫 Instructor: ${instructorName}\n📅 Completed: ${completionDate}\n\n#LearningAchievement #CourseCompleted`,
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Error', 'Failed to share certificate');
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Certificate Details',
      `Student: ${userName}\nCourse: ${courseName}\nInstructor: ${instructorName}\nCompleted: ${completionDate}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Your Certificate
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Certificate */}
        <View style={styles.certificateContainer}>
          <Certificate
            userName={userName}
            courseName={courseName}
            instructorName={instructorName}
            completionDate={completionDate}
          />
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleDownload}
          >
            <Icon name="info" size={20} color={theme.colors.background} />
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton, { borderColor: theme.colors.primary }]}
            onPress={handleShare}
          >
            <Icon name="share" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              Share Certificate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  certificateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CertificateModal;