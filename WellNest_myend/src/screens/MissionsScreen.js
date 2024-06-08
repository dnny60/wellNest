import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';
import EventSource from 'react-native-event-source';
import { AuthContext } from '../components/AuthContext';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import positiveImage from '../assets/mission/positive.png';
import negativeImage from '../assets/mission/negative.png';
import neutralImage from '../assets/mission/neutral.png';

const API_URL = 'http://192.168.1.101:8080'; // Update this to your actual backend URL

const MissionsScreen = ({ navigation }) => {
  const [missions, setMissions] = useState([]);
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

  // const fakeMissions = [
  //   { emotion: 'positive', content: '與朋友交談', difficulty: '1' },
  //   { emotion: 'positive', content: '寫下你今天感激的三件事', difficulty: '2' },
  //   { emotion: 'positive', content: '幫助陌生人完成一件小事', difficulty: '3' },
  //   { emotion: 'negative', content: '反思你最近困擾的事', difficulty: '3' },
  //   { emotion: 'negative', content: '寫一封信給過去的自己', difficulty: '4' },
  //   { emotion: 'negative', content: '花一小時做你最不喜歡的家務', difficulty: '5' },
  //   { emotion: 'neutral', content: '花30分鐘做冥想運動', difficulty: '5' },
  //   { emotion: 'neutral', content: '閱讀一本書的第一章', difficulty: '2' },
  //   { emotion: 'neutral', content: '散步15分鐘', difficulty: '1' },
  // ];

  const fetchMissions = async emotion => {
    try {
      const response = await axios.get(`${API_URL}/missions/${emotion}`);
      setMissions(response.data);
      // setMissions(fakeMissions.filter(mission => mission.emotion === emotion));
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  const addTestSoundToQueue = () => {
    const testSoundPath = 'Magnetic.aac'; // 注意: 这个路径可能需要根据你的文件存放位置进行调整
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
      setIsPlaying(true); // 标记为正在播放
      const nextAudioPath = audioQueue[0]; // 获取队列中的下一个音频

      const sound = new Sound(nextAudioPath, '', error => {
        if (error) {
          console.error('加载音频文件失败:', error);
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
      { sender: 'user', text: inputMessage },
    ]);
    setInputMessage('');

    const url = `http://localhost:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
      inputMessage,
    )}`;
    let eventSource = new EventSource(url);

    let aiMessageBuffer = ''; // 用于累积AI的消息

    eventSource.addEventListener('message', event => {
      const data = JSON.parse(event.data);

      if (data && data.code === 0) {
        if (data.data.messageType === 'AUDIO') {
          const base64Audio = data.data.message; // Base64编码的音频数据
          const audioPath = `${RNFS.DocumentDirectoryPath}/${new Date().getTime()}`;

          RNFS.writeFile(audioPath, base64Audio, 'base64')
            .then(() => {
              console.log('音频文件写入成功:', audioPath); // 打印文件路径
              setAudioQueue(currentQueue => [...currentQueue, audioPath]);
            })
            .catch(err => console.error('写入音频文件失败:', err));
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
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      {/* 情緒選擇 neutral,positive,negative */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => fetchMissions('positive')}>
          <Image style={styles.image} source={positiveImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => fetchMissions('negative')}>
          <Image style={styles.image} source={negativeImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => fetchMissions('neutral')}>
          <Image style={styles.image} source={neutralImage} />
        </TouchableOpacity>
      </View> 

      <ScrollView style={styles.chatContainer}>
        {/* 任務列表 */}
        <View style={styles.missionsContainer}> 
            {missions.length > 0 ? (
              missions.map((mission, index) => (
                <TouchableOpacity key={index} style={styles.missionContainer}>
                  {/* <View style={styles.missionHeader}>
                    <Text style={styles.text}>{mission.emotion}</Text>
                    <Text style={styles.text}>難度: {mission.difficulty}</Text>
                  </View> */}
                  <Text style={styles.missionText}>{mission.content}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noMissionText}>Select an emotion to see missions</Text>
            )}
          </View>
          {/* 聊天室 */}
        <View style={[
          styles.messageContainer,styles.aiMessage]}>
              <Text>來選擇一樣任務吧～</Text>
        </View>
        {messages.map((msg, index) => (
         
          <View
            key={`${msg.sender}-${index}`}
            style={[
              styles.messageContainer,
              msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
            ]}>
            <Text>{msg.text}</Text>
          </View>
        ))}
        {currentAiMessage ? (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <Text>{currentAiMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={30} color="#4C241D" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 50,
    marginBottom:10,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    width: 73,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  missionsContainer: {
    justifyContent: 'center',
    marginLeft: 45,
    marginRight: 45,
    marginBottom:10,
    marginTop:30
  },
  missionContainer: {
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
    padding:25,
  },
  missionHeader: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: '#130F26',
    fontSize: 12,
    marginBottom: -15,
  
  },
  missionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
  },
  noMissionText: {
    fontSize: 16,
    color: '#80351E',
    textAlign: 'center',
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    // borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3B7AA',
    borderRadius:14,
    borderBottomRightRadius:0.5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius:14,
    borderBottomLeftRadius:0.5,
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
  testSoundButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  testSoundButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MissionsScreen;
