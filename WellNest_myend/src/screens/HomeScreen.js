import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';
import EventSource from 'react-native-event-source';
import { AuthContext } from '../components/AuthContext';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import AnimalScene from '../scenes/animalScene';

const HomeScreen = ({ navigation }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [userId, setUserId] = useState('');
  const authContext = useContext(AuthContext);
  const { setIsUserLoggedIn } = authContext;
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioQueue, setAudioQueue] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId !== null) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to fetch user_id from AsyncStorage:', error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    console.log('Updated messages: ', messages);
  }, [messages]);

  useEffect(() => {
    playNextAudio();
  }, [audioQueue, isPlaying]);

  const addTestSoundToQueue = () => {
    const testSoundPath = 'Magnetic.aac';
    var song = new Sound(testSoundPath, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      song.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });
  };

  const playNextAudio = () => {
    if (audioQueue.length > 0 && !isPlaying) {
      console.log('Playing next audio:', audioQueue[0]);
      setIsPlaying(true);
      const nextAudioPath = audioQueue[0];

      const sound = new Sound(nextAudioPath, '', error => {
        if (error) {
          console.error('載入音频文件失敗:', error);
          setIsPlaying(false);
          setAudioQueue(queue => queue.slice(1));
          return;
        }

        sound.play(success => {
          if (success) {
            console.log('音檔播放成功');
          } else {
            console.log('音檔播放失敗');
          }
          sound.release();
          setAudioQueue(queue => queue.slice(1));
          setIsPlaying(false);
        });
      });
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: 'user', text: inputMessage },
    ]);
    setInputMessage('');

    const url = `http://localhost:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
      inputMessage,
    )}`;
    let eventSource = new EventSource(url);

    let aiMessageBuffer = '';

    eventSource.addEventListener('message', event => {
      const data = JSON.parse(event.data);

      if (data && data.code === 0) {
        if (data.data.messageType === 'AUDIO') {
          const base64Audio = data.data.message;
          const audioPath = `${
            RNFS.DocumentDirectoryPath
          }/${new Date().getTime()}`;

          RNFS.writeFile(audioPath, base64Audio, 'base64')
            .then(() => {
              console.log('音樂寫入成功:', audioPath);
              setAudioQueue(currentQueue => [...currentQueue, audioPath]);
            })
            .catch(err => console.error('音樂寫入失败:', err));
        } else if (data.data.messageType === 'TEXT') {
          const messageText = data.data.message;

          if (messageText !== '#') {
            aiMessageBuffer += messageText;
            setCurrentAiMessage(aiMessageBuffer);
          } else {
            if (aiMessageBuffer.trim() !== '') {
              setMessages(prevMessages => [
                ...prevMessages,
                { sender: 'ai', text: aiMessageBuffer },
              ]);
              aiMessageBuffer = '';
              setCurrentAiMessage('');
            }
          }
        }

        if (data.data.end) {
          eventSource.close();
        }
      }

      eventSource.addEventListener('error', error => {
        console.error('EventSource failed:', error);
        eventSource.close();
      });
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user_id');
    setIsUserLoggedIn(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEBDC' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <TopBar navigation={navigation} />
            <ScrollView style={styles.chatContainer}>
              {messages.map((msg, index) => (
                <View
                  key={`${msg.sender}-${index}`}
                  style={[
                    styles.messageContainer,
                    msg.sender === 'user'
                      ? styles.userMessage
                      : styles.aiMessage,
                  ]}
                >
                  <Text>{msg.text}</Text>
                </View>
              ))}
              {currentAiMessage ? (
                <View style={[styles.messageContainer, styles.aiMessage]}>
                  <Text>{currentAiMessage}</Text>
                </View>
              ) : null}
            </ScrollView>
            <View style={{ flex: 1 , marginBottom:-45}}>
              <AnimalScene />
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message"
                  value={inputMessage}
                  onChangeText={setInputMessage}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  style={styles.sendButton}
                >
                  <Icon name="send" size={30} color="#4C241D" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomRightRadius: 0.5,
    marginLeft: 80,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomLeftRadius: 0.5,
    marginRight: 80,
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
  },
  sendButton: {
    marginLeft: 10,
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
