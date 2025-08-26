import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Quiz, QuizAttempt, quizAPI } from '../services/api';
import GlassCard from './common/GlassCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QuizCardProps {
  quiz: Quiz;
  onAttemptComplete?: (attempt: QuizAttempt) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false';
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onAttemptComplete }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null);

  // Ensure questions_data is properly parsed as an array
  const getQuestions = () => {
    try {
      if (Array.isArray(quiz.questions_data)) {
        return quiz.questions_data;
      }
      if (typeof quiz.questions_data === 'string') {
        return JSON.parse(quiz.questions_data);
      }
      if (quiz.questions_data && typeof quiz.questions_data === 'object') {
        // Handle nested structure where questions are under 'questions' property
        if (quiz.questions_data.questions && Array.isArray(quiz.questions_data.questions)) {
          return quiz.questions_data.questions;
        }
        // Handle case where questions_data is an object but not an array
        return quiz.questions_data;
      }
      return [];
    } catch (error) {
      console.error('Error parsing questions_data:', error);
      return [];
    }
  };
  
  const questions = getQuestions();

  // Debug: Log the quiz structure to understand the data format
  console.log('Quiz questions_data:', quiz.questions_data);
  console.log('Parsed questions:', questions);
  console.log('Questions is array:', Array.isArray(questions));
  console.log('Questions length:', questions.length);

  const handleStartQuiz = () => {
    setShowQuizModal(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizResults(null);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    console.log('Answer selected:', { questionId, answerIndex });
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (questions && questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      
      // Debug: Log quiz structure
      console.log('Quiz data:', quiz);
      console.log('Questions:', questions);
      console.log('User answers:', answers);
      
      // Calculate score
      let correctAnswers = 0;
      
      if (!questions || questions.length === 0) {
        console.error('No questions found in quiz data');
        Alert.alert('Error', 'No questions found in this quiz');
        setIsSubmitting(false);
        return;
      }
      
      if (Array.isArray(questions)) {
        questions.forEach((question, index) => {
          // Ensure question has required properties
          if (!question || typeof question !== 'object') {
            console.error(`Invalid question at index ${index}:`, question);
            return;
          }
          
          const questionId = question.id || question.question_id || index.toString();
          const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 
                                question.correct_answer !== undefined ? question.correct_answer :
                                question.answer; // GraphQL schema uses 'answer'
          const userAnswer = answers[questionId];
          
          // Handle both string and numeric answer comparisons
          const isCorrect = userAnswer === correctAnswer || 
                           userAnswer === parseInt(correctAnswer) ||
                           userAnswer.toString() === correctAnswer;
          
        
          
          if (isCorrect) {
            correctAnswers++;
          }
        });
      }
      
      const score = (correctAnswers / questions.length) * 100;
      
      console.log('Final score calculation:', {
        correctAnswers,
        totalQuestions: questions.length,
        score
      });
      
      const answersData = {
        answers,
        score,
        totalQuestions: questions.length,
        correctAnswers
      };

      console.log('Submitting quiz attempt:', {
        quizId: quiz.quiz_id,
        answersData
      });

      const response = await quizAPI.submitQuizAttempt(quiz.quiz_id, answersData);
      
      if (response.success && response.data) {
        setQuizResults(response.data);
        setShowResults(true);
        onAttemptComplete?.(response.data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowQuizModal(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizResults(null);
  };

  const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;
  const isLastQuestion = questions && questions.length > 0 ? currentQuestionIndex === questions.length - 1 : false;
  const allQuestionsAnswered = questions && questions.length > 0 ? questions.every((q: Question) => answers[q.id] !== undefined) : false;

  return (
    <>
      <GlassCard style={{ ...styles.card, backgroundColor: theme.colors.card }}>
        <View style={styles.header}>
          <Icon name="quiz" size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{quiz.title}</Text>
        </View>
        
        {quiz.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {quiz.description}
          </Text>
        )}
        
        <View style={styles.info}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {questions && questions.length ? questions.length : 0} Questions
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {quiz.chapter?.title}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleStartQuiz}
        >
          <Text style={[styles.startButtonText, { color: theme.colors.background }]}>
            Start Quiz
          </Text>
        </TouchableOpacity>
      </GlassCard>

      <Modal
        visible={showQuizModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{quiz.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          {!showResults ? (
            <ScrollView style={styles.modalContent}>
              {currentQuestion && (
                <View style={styles.questionContainer}>
                  <Text style={[styles.questionNumber, { color: theme.colors.textSecondary }]}>
              Question {currentQuestionIndex + 1} of {questions && questions.length ? questions.length : 0}
            </Text>
                  
                  <Text style={[styles.questionText, { color: theme.colors.text }]}>
                    {currentQuestion.question || currentQuestion.text}
                  </Text>
                  
                  <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option: string, index: number) => {
                      const questionId = currentQuestion.id || currentQuestion.question_id || currentQuestionIndex.toString();
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: answers[questionId] === index
                                ? `${theme.colors.primary}20`
                                : theme.colors.background,
                              borderColor: answers[questionId] === index
                                ? theme.colors.primary
                                : theme.colors.border,
                            },
                          ]}
                          onPress={() => handleAnswerSelect(questionId, index)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: answers[questionId] === index
                                  ? theme.colors.primary
                                  : theme.colors.text,
                              },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <ScrollView style={styles.modalContent}>
              <View style={styles.resultsContainer}>
                <Icon name="check-circle" size={64} color={theme.colors.success} />
                <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Quiz Completed!</Text>
                
                {quizResults && (
                  <>
                    <Text style={[styles.scoreText, { color: theme.colors.primary }]}>
                      Score: {quizResults.score?.toFixed(1)}%
                    </Text>
                    <Text style={[styles.resultsInfo, { color: theme.colors.textSecondary }]}>
                      Completed on {new Date(quizResults.completed_at || quizResults.created_at).toLocaleDateString()}
                    </Text>
                  </>
                )}
              </View>
            </ScrollView>
          )}

          {!showResults && (
            <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    {
                      backgroundColor: currentQuestionIndex === 0 ? theme.colors.border : theme.colors.background,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <Text style={[
                    styles.navButtonText,
                    { color: currentQuestionIndex === 0 ? theme.colors.textSecondary : theme.colors.text }
                  ]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                {!isLastQuestion ? (
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={handleNextQuestion}
                  >
                    <Text style={[styles.navButtonText, { color: theme.colors.background }]}>
                      Next
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      {
                        backgroundColor: allQuestionsAnswered ? theme.colors.success : theme.colors.border,
                        opacity: isSubmitting ? 0.7 : 1,
                      }
                    ]}
                    onPress={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || isSubmitting}
                  >
                    <Text style={[styles.submitButtonText, { color: theme.colors.background }]}>
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Text>
                  </TouchableOpacity>
                )}
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
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultsInfo: {
    fontSize: 14,
  },
});

export default QuizCard;