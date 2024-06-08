import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const questions = [
  {
    id: 1,
    text: '睡眠困難（譬如難以入睡、易醒或早醒）',
    image: require('../assets/Images/sleep.png'),
  },
  {
    id: 2,
    text: '有自殺的想法',
    image: require('../assets/Images/heart.png'),
  },
  {
    id: 3,
    text: '有自殺的想法',
    image: require('../assets/Images/heart.png'),
  },
  {
    id: 4,
    text: '有自殺的想法',
    image: require('../assets/Images/heart.png'),
  },
  {
    id: 5,
    text: '有自殺的想法',
    image: require('../assets/Images/heart.png'),
  },
  {
    id: 6,
    text: '有自殺的想法',
    image: require('../assets/Images/heart.png'),
  },
  // Add more questions as needed
];

const QuestionnaireScreen = ({navigation}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Set initial state to -1 for the intro screen
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('userToken');
      setUserId(id);
      setUserToken(token);
      console.log('userToken:', token);
      console.log('userId:', id);
    };
    fetchUserId();
  }, []);

  const handleAnswer = async answer => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSubmitted(true);
      const now = new Date();
      setCompletionTime(now.toLocaleString());
      console.log('Submitted answers:', newAnswers);
      const totalScore = newAnswers.reduce(
        (total, num) => total + (num || 0),
        0,
      );
      console.log('Total score:', totalScore);
      console.log('Completion time:', now.toLocaleString());

      // Send data to server after submission
      try {
        await axios.post(
          'http://192.168.1.101:8080/scales',
          {
            userId: userId,
            totalScore: totalScore,
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          },
        );
        console.log('Data sent to server successfully');
      } catch (error) {
        console.error('Error sending data to server:', error);
      }
    }
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestionIndex(-1);
    setSubmitted(false);
    console.log('Answers reset:', answers);
    console.log('userId:', userId);
    navigation.navigate('主頁');
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellnest</Text>
      {currentQuestionIndex === -1 ? (
        <View style={styles.introContainer}>
          <Image
            source={require('../assets/Images/introduction.png')}
            style={styles.introImage}
          />
          <Text style={styles.introText}>
            簡式健康量表（Brief Symptom Rating Scale,
            BSRS），又名「心情溫度計」，是一種能夠探尋心理狀態的篩檢工具。
          </Text>
          <Text style={styles.introText}>
            此量表包含6個簡單的題目，它可以幫助我們瞭解自己目前的情緒困擾程度，並依據測試結果做出適當的處理。
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentQuestionIndex(0)}>
            <Text style={styles.buttonText}>開始作答</Text>
          </TouchableOpacity>
        </View>
      ) : submitted ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>測試結果</Text>
          <ScrollView>
            {answers.map((answer, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultQuestion}>
                  {questions[index].text}
                </Text>
                <Text style={styles.resultAnswer}>得分: {answer}</Text>
              </View>
            ))}
            <Text style={styles.resultTotal}>
              總分: {answers.reduce((total, num) => total + (num || 0), 0)}
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>返回主頁</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.questionContainer}>
          <Text style={styles.questionCount}>
            第{currentQuestionIndex + 1}/{questions.length}題
          </Text>
          <Text style={styles.questionText}>
            請選擇最近一個星期（含今天），你對下列問題感受到的嚴重程度
          </Text>
          <Image source={currentQuestion.image} style={styles.questionImage} />
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <View style={styles.answersContainer}>
            {[1, 2, 3, 4, 5].map(value => (
              <TouchableOpacity
                key={value}
                style={styles.answerButton}
                onPress={() => handleAnswer(value)}>
                <Text style={styles.answerText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.navigationButtons}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                }>
                <Text style={styles.navButtonText}>返回</Text>
              </TouchableOpacity>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleAnswer(null)}>
                <Text style={styles.navButtonText}>下一題</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleAnswer(null)}>
                <Text style={styles.navButtonText}>送出</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF5E1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  introContainer: {
    alignItems: 'center',
  },
  introImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  questionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  questionImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  answersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  answerButton: {
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 5,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  navButton: {
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 5,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 8,
  },
  resultQuestion: {
    fontSize: 16,
  },
  resultAnswer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

export default QuestionnaireScreen;
