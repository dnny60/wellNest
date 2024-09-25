import React, {useState, useEffect, useContext , useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Button
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

const HomeScreen = ({navigation, route}) => {
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
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef(); // 添加 ScrollView 的引用
  const [userInput, setUserInput] = useState('');


   // 初始化判斷是否從任務頁面進入
   useEffect(() => {
    if (route.params?.generateComic !== undefined) {
      // 確認 route 是從 MissionsScreen 傳遞過來的
      if (route.params.generateComic) {
        // 使用者選擇了生成漫畫
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'ai', text: '快跟我分享做這個任務的過程吧！' }
        ]);
      } 
    } else {
      // 如果沒有 route 參數，顯示錯誤提示或做其他處理
      console.log('未從任務頁面進入');
    }
  }, [route.params?.generateComic]);

  const handleSubmit = () => {
    console.log('User input:', userInput);
    setUserInput('');
    // Navigate to ComicScreen with userInput as a parameter
    navigation.navigate('漫畫', { userInput });
  };



  // 當 messages 狀態發生變化時，滾動到最底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);


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
      const response = await fetch('http://172.20.10.3:8080/chat/create', {
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

    const url = `http://172.20.10.3:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
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
      const response = await fetch('http://172.20.10.3:8080/message/create', {
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
      const response = await fetch('http://172.20.10.3:8080/chat/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({userId}),
      });

      if (response.ok) {
        console.log('Chat finished successfully');
        setShowFinishButton(false); // 隱藏結束按鈕
        await AsyncStorage.removeItem('chatCreated'); // Reset chat creation flag
        setModalVisible(true); // 顯示 Modal
      } else {
        console.error('Failed to finish chat');
      }
    } catch (error) {
      console.error('Error finishing chat:', error);
    }
  };

  const navigateToMissions = () => {
    setModalVisible(false); // 關閉 Modal
    navigation.navigate('任務', {autoFetch: true}); // 導航到任務畫面，並傳遞參數
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 3 : 0} // Offset for iOS to avoid navbar covering
      >
        <TopBar navigation={navigation} />
        <ScrollView 
          style={styles.chatContainer}
          ref={scrollViewRef}>
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
           {route.params?.generateComic ? (
            // 如果 route.params.generateComic 為 true 顯示 "生成漫畫" 按鈕
            <TouchableOpacity style={styles.finishButton} onPress={handleSubmit}>
              <Text style={styles.finishButtonText}>生成漫畫</Text>
            </TouchableOpacity>
          ) : (
            // 如果 route.params.generateComic 為 false，則顯示 "下次再聊" 按鈕
            <View>
              {showFinishButton && (
                <TouchableOpacity style={styles.finishButton} onPress={finishChat}>
                  <Text style={styles.finishButtonText}>下次再聊</Text>
                </TouchableOpacity>
              )}
            </View>
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
            placeholder="輸入文字..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={30} color="#4C241D" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Modal 彈窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Image
              source={require('../assets/material/13.png')} // 使用 require 加載本地圖片
              style={styles.modalImage}
            />
             <Text style={styles.modalText}>看看適合你的活動吧~</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.yesmodalButton}
                onPress={navigateToMissions}>
                <Text style={styles.yesmodalButtonText}>好啊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nomodalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.nomodalButtonText}>不用了</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderRadius: 14,
    borderBottomRightRadius: 0.5,
    marginVertical: 5,
    marginRight:10,
    marginLeft:20,
    padding: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomLeftRadius: 0.5,
    marginVertical: 5,
    marginRight:20,
    marginLeft:10,
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
    width:100,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: 110,
    height: 100,
    marginBottom: 20,
  },
  modalView: {
    margin:50,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  yesmodalButton: {
    width:100,
    backgroundColor: '#4C241D',
    borderWidth:1,
    borderColor:'#4C241D',
    padding: 10,
    borderRadius: 30,
    margin: 10,
  },
  yesmodalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  nomodalButton: {
    width:100,
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#4C241D',
    padding: 10,
    borderRadius: 30,
    margin: 10,
  },
  nomodalButtonText: {
    color: '#4C241D',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;
