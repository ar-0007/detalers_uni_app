import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Assignment, Submission, assignmentAPI } from '../services/api';
import GlassCard from './common/GlassCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Removed DocumentPicker import as file upload is no longer needed

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmissionComplete?: (submission: Submission) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onSubmissionComplete }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  // Removed selectedFile state as file upload is no longer needed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (showSubmissionModal) {
      loadMySubmissions();
    }
  }, [showSubmissionModal]);

  const loadMySubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const response = await assignmentAPI.getMySubmissions(assignment.assignment_id);
      if (response.success && response.data) {
        setMySubmissions(response.data);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenAssignment = () => {
    setShowSubmissionModal(true);
  };

  // Removed handleSelectFile function as file upload is no longer needed

  const handleSubmitAssignment = async () => {
    if (!submissionText.trim()) {
      Alert.alert('Error', 'Please provide text submission.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Submitting assignment:', {
        assignmentId: assignment.assignment_id,
        hasText: !!submissionText.trim()
      });
      
      const response = await assignmentAPI.submitAssignmentText(
        assignment.assignment_id,
        submissionText.trim()
      );
      
      console.log('Submission response:', response);
      
      if (response.success && response.data) {
        Alert.alert('Success', 'Assignment submitted successfully!');
        setSubmissionText('');
        setShowSubmissionModal(false);
        onSubmissionComplete?.(response.data);
        loadMySubmissions();
      } else {
        console.error('Submission failed:', response);
        Alert.alert('Error', response.message || 'Failed to submit assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assignment. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAssignment = () => {
    if (assignment.assignment_file_url) {
      Linking.openURL(assignment.assignment_file_url);
    }
  };

  const handleDownloadSubmission = (submission: Submission) => {
    if (submission.submission_file_url) {
      Linking.openURL(submission.submission_file_url);
    }
  };

  const closeModal = () => {
    setShowSubmissionModal(false);
    setSubmissionText('');
  };

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const hasSubmissions = mySubmissions.length > 0;
  const latestSubmission = mySubmissions[0]; // Assuming submissions are ordered by date

  return (
    <>
      <GlassCard style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.header}>
          <Icon name="assignment" size={24} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>{assignment.title}</Text>
          {isOverdue && (
            <Icon name="warning" size={20} color={theme.error} />
          )}
        </View>
        
        {assignment.description && (
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {assignment.description}
          </Text>
        )}
        
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {assignment.due_date 
                ? `Due: ${new Date(assignment.due_date).toLocaleDateString()}`
                : 'No due date'
              }
            </Text>
          </View>
          
          {assignment.max_score && (
            <View style={styles.infoRow}>
              <Icon name="grade" size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Max Score: {assignment.max_score}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Icon name="folder" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {assignment.chapter?.title || assignment.course?.title}
            </Text>
          </View>
        </View>
        
        {hasSubmissions && (
          <View style={[styles.submissionStatus, { backgroundColor: theme.success + '20' }]}>
            <Icon name="check-circle" size={16} color={theme.success} />
            <Text style={[styles.submissionStatusText, { color: theme.success }]}>
              Submitted {latestSubmission.score ? `• Score: ${latestSubmission.score}` : ''}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.openButton, { backgroundColor: theme.primary }]}
          onPress={handleOpenAssignment}
        >
          <Text style={[styles.openButtonText, { color: theme.background }]}>
            {hasSubmissions ? 'View Submission' : 'Submit Assignment'}
          </Text>
        </TouchableOpacity>
      </GlassCard>

      <Modal
        visible={showSubmissionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{assignment.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Assignment Details */}
            <View style={styles.assignmentDetails}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Assignment Details</Text>
              
              {assignment.description && (
                <Text style={[styles.assignmentDescription, { color: theme.textSecondary }]}>
                  {assignment.description}
                </Text>
              )}
              
              {assignment.assignment_file_url && (
                <TouchableOpacity
                  style={[styles.downloadButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  onPress={handleDownloadAssignment}
                >
                  <Icon name="download" size={20} color={theme.primary} />
                  <Text style={[styles.downloadButtonText, { color: theme.primary }]}>
                    Download Assignment File
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Previous Submissions */}
            {hasSubmissions && (
              <View style={styles.submissionsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Submissions</Text>
                
                {mySubmissions.map((submission, index) => (
                  <View key={submission.submission_id} style={[styles.submissionItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.submissionHeader}>
                      <Text style={[styles.submissionDate, { color: theme.text }]}>
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                      </Text>
                      {submission.score && (
                        <Text style={[styles.submissionScore, { color: theme.success }]}>
                          Score: {submission.score}
                        </Text>
                      )}
                    </View>
                    
                    {submission.submission_text && (
                      <Text style={[styles.submissionText, { color: theme.textSecondary }]}>
                        {submission.submission_text}
                      </Text>
                    )}
                    
                    {submission.submission_file_url && (
                      <TouchableOpacity
                        style={styles.fileDownload}
                        onPress={() => handleDownloadSubmission(submission)}
                      >
                        <Icon name="attach-file" size={16} color={theme.primary} />
                        <Text style={[styles.fileDownloadText, { color: theme.primary }]}>
                          Download Submitted File
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {submission.feedback && (
                      <View style={[styles.feedback, { backgroundColor: theme.primary + '10' }]}>
                        <Text style={[styles.feedbackLabel, { color: theme.primary }]}>Feedback:</Text>
                        <Text style={[styles.feedbackText, { color: theme.text }]}>
                          {submission.feedback}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* New Submission Form - Only show if no submissions exist and not overdue */}
            {!isOverdue && !hasSubmissions && (
              <View style={styles.submissionForm}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>New Submission</Text>
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Text Submission</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                      color: theme.text,
                    }
                  ]}
                  placeholder="Enter your submission text here..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={submissionText}
                  onChangeText={setSubmissionText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                {/* File upload section removed - only text submission allowed */}
              </View>
            )}
          </ScrollView>

          {!isOverdue && !hasSubmissions && (
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: submissionText.trim() ? theme.success : theme.border,
                    opacity: isSubmitting ? 0.7 : 1,
                  }
                ]}
                onPress={handleSubmitAssignment}
                disabled={!submissionText.trim() || isSubmitting}
              >
                <Text style={[styles.submitButtonText, { color: theme.background }]}>
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Show message when assignment is already submitted */}
          {hasSubmissions && (
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <View style={[styles.submittedMessage, { backgroundColor: theme.success + '20' }]}>
                <Icon name="check-circle" size={20} color={theme.success} />
                <Text style={[styles.submittedMessageText, { color: theme.success }]}>
                  Assignment already submitted. You can view your submission above.
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  info: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  submissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  submissionStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  openButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  assignmentDetails: {
    marginBottom: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  assignmentDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  submissionsSection: {
    marginBottom: 28,
  },
  submissionItem: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  submissionDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  submissionScore: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  submissionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.9,
  },
  fileDownload: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  fileDownloadText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  feedback: {
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 3,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 20,
  },
  submissionForm: {
    marginBottom: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    letterSpacing: 0.2,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    lineHeight: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  fileUploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  selectedFileName: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submittedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  submittedMessageText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default AssignmentCard;