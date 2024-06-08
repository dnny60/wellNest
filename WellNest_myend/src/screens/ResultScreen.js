import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../constants';
import {ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';

const ResultScreen = ({route, navigation}) => {
  const {questions, answers, totalScore} = route.params;

  const handleHomePress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: '主頁'}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.resultTitle}>測試結果</Text>
      <ScrollView>
        {questions.map((question, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultQuestion}>{question.questionText}</Text>
            <Text style={styles.resultAnswer}>得分: {answers[index]}</Text>
          </View>
        ))}
        <Text style={styles.resultTotal}>總分: {totalScore}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleHomePress}>
        <Text style={styles.buttonText}>返回主頁</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5E1',
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
});

export default ResultScreen;
