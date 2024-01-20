import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import {sendMessage} from '../components/ChatService'; // 不再需要 getResponse
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({navigation}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState('');

  useEffect(() => {
    // 获取 threadId
    const fetchThreadId = async () => {
      try {
        const storedThreadId = await AsyncStorage.getItem('threadId');
        if (storedThreadId !== null) {
          setThreadId(storedThreadId);
        }
      } catch (e) {
        console.error('Failed to fetch threadId from AsyncStorage:', e);
      }
    };
    fetchThreadId();
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {type: 'user', text: inputMessage};
      setMessages(currentMessages => [...currentMessages, userMessage]);
      setInputMessage('');

      // 在等待响应时添加处理中的消息
      const processingMessage = {type: 'response', text: '處理中...'};
      setMessages(currentMessages => [...currentMessages, processingMessage]);

      // 发送消息到服务器并获取回应
      const responseMessage = await sendMessage(threadId, inputMessage);

      // 在得到响应后，先移除处理中的消息
      setMessages(currentMessages =>
        currentMessages.filter(msg => msg.text !== '處理中...'),
      );

      if (responseMessage) {
        // 添加服务器回应到消息数组
        setMessages(currentMessages => [
          ...currentMessages,
          {type: 'response', text: responseMessage},
        ]);
      } else {
        // 如果没有收到回应，添加一个错误消息
        setMessages(currentMessages => [
          ...currentMessages,
          {type: 'response', text: '无法获取回应，请稍后再试。'},
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Home Screen</Text>
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.message(msg.type)}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Type your message"
        value={inputMessage}
        onChangeText={setInputMessage}
      />
      <CustomButton label={'Send Message'} onPress={handleSendMessage} />
      <CustomButton
        label={'Profile'}
        onPress={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    width: '100%',
  },
  message: type => ({
    alignSelf: type === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: type === 'user' ? '#DCF8C6' : '#FFF',
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  }),
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    width: '80%',
    padding: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;
