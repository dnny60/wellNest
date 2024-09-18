import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/AuthContext';
import EventSource from 'react-native-event-source';
import Icon from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import TopBar from '../components/TopBar';
import AnimalScene from '../scenes/animalScene';
import ChatbotScene from '../scenes/chatbotScene';

const HomeScreen = ({navigation}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [showFinishButton, setShowFinishButton] = useState(false);
  const authContext = useContext(AuthContext);
  const {setIsUserLoggedIn} = authContext;
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        const storedUserToken = await AsyncStorage.getItem('userToken');
        const chatCreated = await AsyncStorage.getItem('chatCreated');

        if (storedUserId && storedUserToken) {
          setUserId(storedUserId);
          setUserToken(storedUserToken);

          // Create chat only if it hasn't been created yet
          if (!chatCreated) {
            await createChat(storedUserToken);
            await AsyncStorage.setItem('chatCreated', 'true');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data from AsyncStorage:', error);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    console.log('Updated messages: ', messages);
  }, [messages]);

  useEffect(() => {
    playNextAudio();
  }, [audioQueue, isPlaying]);

  const createChat = async token => {
    try {
      const response = await fetch('http://192.168.2.1:8080/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({userId}),
      });
      if (response.ok) {
        console.log('Chat created successfully');
      } else {
        console.error('Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const playNextAudio = () => {
    // 只有当队列中有音频且当前没有音频正在播放时才继续
    if (audioQueue.length > 0 && !isPlaying) {
      console.log('Playing next audio:', audioQueue[0]);
      setIsPlaying(true); // 标记为正在播放
      const nextAudioPath = audioQueue[0]; // 获取队列中的下一个音频

      const sound = new Sound(nextAudioPath, '', error => {
        if (error) {
          console.error('加载音频文件失败:', error);
          // 出错时重置状态并尝试播放下一个音频
          setIsPlaying(false);
          setAudioQueue(queue => queue.slice(1));
          return;
        }

        sound.play(success => {
          if (success) {
            console.log('音频播放成功');
          } else {
            console.log('音频播放失败');
          }
          sound.release(); // 释放资源

          setAudioQueue(queue => queue.slice(1)); // 移除已播放的音频
          setIsPlaying(false); // 重置播放状态
        });
      });
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prevMessages => [
      ...prevMessages,
      {sender: 'user', text: inputMessage},
    ]);
    setInputMessage('');

    const url = `http://192.168.2.1:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
      inputMessage,
    )}`;
    let eventSource = new EventSource(url);

    let aiMessageBuffer = ''; // 用于累积AI的消息

    eventSource.addEventListener('message', event => {
      const data = JSON.parse(event.data);

      if (data && data.code === 0) {
        if (data.data.messageType === 'AUDIO') {
          const base64Audio = data.data.message; // Base64编码的音频数据
          const audioPath = `${
            RNFS.DocumentDirectoryPath
          }/${new Date().getTime()}`;

          // 将Base64编码的音频数据写入文件
          RNFS.writeFile(audioPath, base64Audio, 'base64')
            .then(() => {
              console.log('音频文件写入成功:', audioPath); // 打印文件路径
              setAudioQueue(currentQueue => [...currentQueue, audioPath]);
            })
            .catch(err => console.error('写入音频文件失败:', err));
        } else if (data.data.messageType === 'TEXT') {
          const messageText = data.data.message;

          if (messageText !== '#') {
            // 累积AI的消息到缓冲区
            aiMessageBuffer += messageText;
            // 动态更新当前AI消息，仅用于显示
            setCurrentAiMessage(aiMessageBuffer);
          } else {
            // 当收到"#"时，将累积的消息添加到messages中，并清空aiMessageBuffer
            if (aiMessageBuffer.trim() !== '') {
              setMessages(prevMessages => [
                ...prevMessages,
                {sender: 'ai', text: aiMessageBuffer},
              ]);
              aiMessageBuffer = '';
              setCurrentAiMessage('');
            }
          }
        }

        if (data.data.end) {
          eventSource.close();
          storeMessage(inputMessage);
          setShowFinishButton(true); // Show finish button after chat ends
        }
      }

      eventSource.addEventListener('error', error => {
        console.error('EventSource failed:', error);
        eventSource.close();
      });
    });
  };

  const storeMessage = async message => {
    try {
      const response = await fetch('http://192.168.2.1:8080/message/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          content: message,
          userId: parseInt(userId),
        }),
      });

      if (response.ok) {
        console.log('Message stored successfully');
      } else {
        console.error('Failed to store message');
      }
    } catch (error) {
      console.error('Error storing message:', error);
    }
  };

  const finishChat = async () => {
    try {
      const response = await fetch('http://192.168.2.1:8080/chat/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({userId}),
      });

      if (response.ok) {
        console.log('Chat finished successfully');
        setShowFinishButton(false); // Hide finish button after finishing chat
        await AsyncStorage.removeItem('chatCreated'); // Reset chat creation flag
      } else {
        console.error('Failed to finish chat');
      }
    } catch (error) {
      console.error('Error finishing chat:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user_id');
    setIsUserLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={
              msg.sender === 'user' ? styles.userMessage : styles.aiMessage
            }>
            <Text>{msg.text}</Text>
          </View>
        ))}
        {currentAiMessage ? (
          <Text style={styles.aiMessage}>{currentAiMessage}</Text>
        ) : null}
        {showFinishButton && (
          <TouchableOpacity style={styles.finishButton} onPress={finishChat}>
            <Text style={styles.finishButtonText}>Finish Chat</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.sceneContainer}>
        <ChatbotScene />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={30} color="#4C241D" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sceneContainer: {
    flex: 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomRightRadius: 0.5,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomLeftRadius: 0.5,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderRadius: 50,
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: 'black',
  },
  sendButton: {
    marginLeft: 10,
  },
  finishButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  finishButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;
