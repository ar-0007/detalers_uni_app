import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CertificateProps {
  userName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
}

const Certificate: React.FC<CertificateProps> = ({
  userName,
  courseName,
  instructorName,
  completionDate,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <View style={[styles.certificate, { backgroundColor: theme.colors.background }]}>
      {/* Certificate Border */}
      <View style={[styles.border, { borderColor: theme.colors.primary }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.certificateTitle, { color: theme.colors.primary }]}>
            CERTIFICATE
          </Text>
          <Text style={[styles.ofCompletion, { color: theme.colors.text }]}>
            OF COMPLETION
          </Text>
        </View>

        {/* Decorative Line */}
        <View style={[styles.decorativeLine, { backgroundColor: theme.colors.primary }]} />

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={[styles.presentedTo, { color: theme.colors.textSecondary }]}>
            This is to certify that
          </Text>
          
          <Text style={[styles.userName, { color: theme.colors.primary }]}>
            {userName}
          </Text>
          
          <Text style={[styles.hasCompleted, { color: theme.colors.textSecondary }]}>
            has successfully completed the course
          </Text>
          
          <Text style={[styles.courseName, { color: theme.colors.text }]}>
            {courseName}
          </Text>
          
          <Text style={[styles.completionText, { color: theme.colors.textSecondary }]}>
            on {completionDate}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <View style={[styles.signatureLine, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.instructorName, { color: theme.colors.text }]}>
              {instructorName}
            </Text>
            <Text style={[styles.instructorTitle, { color: theme.colors.textSecondary }]}>
              Course Instructor
            </Text>
          </View>
          
          <View style={styles.dateSection}>
            <View style={[styles.signatureLine, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {completionDate}
            </Text>
            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
              Date of Completion
            </Text>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={[styles.cornerDecoration, styles.topLeft, { borderColor: theme.colors.primary }]} />
        <View style={[styles.cornerDecoration, styles.topRight, { borderColor: theme.colors.primary }]} />
        <View style={[styles.cornerDecoration, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
        <View style={[styles.cornerDecoration, styles.bottomRight, { borderColor: theme.colors.primary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  certificate: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    alignSelf: 'center',
    padding: 20,
  },
  border: {
    flex: 1,
    borderWidth: 3,
    borderRadius: 15,
    padding: 30,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  certificateTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 5,
  },
  ofCompletion: {
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '300',
  },
  decorativeLine: {
    height: 2,
    width: '60%',
    alignSelf: 'center',
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  presentedTo: {
    fontSize: 16,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  hasCompleted: {
    fontSize: 16,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  courseName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  completionText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureSection: {
    alignItems: 'center',
    flex: 1,
  },
  dateSection: {
    alignItems: 'center',
    flex: 1,
  },
  signatureLine: {
    height: 1,
    width: '80%',
    marginBottom: 8,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  topLeft: {
    top: 15,
    left: 15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 15,
    right: 15,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 15,
    left: 15,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 15,
    right: 15,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default Certificate;