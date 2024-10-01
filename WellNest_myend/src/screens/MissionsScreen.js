import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import {AuthContext} from '../components/AuthContext';
import ChatbotScene from '../scenes/chatbotScene';

const API_URL = 'http://172.20.10.3:8080'; // Update this to your actual backend URL

const MissionsScreen = ({navigation, route}) => {
  const [missions, setMissions] = useState([]);
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const authContext = useContext(AuthContext);
  const {setIsUserLoggedIn} = authContext;
  const [selectedMission, setSelectedMission] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showCompletionButtons, setShowCompletionButtons] = useState(false);
  

  useEffect(() => {
    const initializeMission = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        const storedUserToken = await AsyncStorage.getItem('userToken');
        if (storedUserId && storedUserToken) {
          setUserId(storedUserId);
          setUserToken(storedUserToken);
        }
      } catch (error) {
        console.error('Failed to fetch user data from AsyncStorage:', error);
      }
    };

    initializeMission();
  }, []);

  useEffect(() => {
    if (route.params?.autoFetch) {
      fetchMissions();
    }
  }, [route.params]);

  const fetchMissions = async () => {
    try {
      console.log("User Token:", userToken); 
      const response = await fetch(`${API_URL}/mission`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include the Bearer token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }

      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };
  const handleMissionPress = mission => {
    // 彈出 Alert 來確認是否選擇任務
    Alert.alert(
      '選擇確認',
      `你確定要選擇這項任務 "${mission.content}" 嗎？`,
      [
        {
          text: '否',
          onPress: () => console.log('任務選擇取消'),
          style: 'cancel',
        },
        {
          text: '確定',
          onPress: () => confirmMissionSelection(mission)
        },
      ],
      {cancelable: false},
    );
  };
// 用于将选中的任务发送到后端
const submitMissionToBackend = async (mission) => {
  try {
    const response = await fetch(`${API_URL}/mission/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`, // 使用用户的 token 授权
      },
      body: JSON.stringify({
        mission: mission.content, // 将任务内容发送到后端
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit mission to backend');
    }

    console.log('Mission submitted to backend successfully');
  } catch (error) {
    console.error('Error submitting mission to backend:', error);
    Alert.alert('提交任務時出錯', '無法將任務提交到伺服器，請稍後再試。');
  }
};

// 確認選擇任務後的處理邏輯
const confirmMissionSelection = mission => {
  // 確認選擇後將該任務設為選中的任務
  setSelectedMission(mission);
  const newMessage = `太好了，你選擇了[${mission.content}]！如果你完成了請隨時告訴我。`;
  setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: newMessage }]);
  setShowCompletionButtons(true); // 顯示完成按鈕

};
 
  const handleMissionCompletion = completed => {
    const userMessage = completed ? '完成了！' : '還沒有';
    const aiResponse = completed
      ? '太棒了！有沒有發生什麼好玩的事。你願不願意跟我分享？'
      : '沒關係，繼續加油！如果完成了隨時告訴我。';
  
      setChatMessages(prevMessages => [
      ...prevMessages,
      { sender: 'user', text: userMessage },
      { sender: 'ai', text: aiResponse }
    ]);
  
    if (completed) {
      setTimeout(() => {
        // 顯示生成漫畫選項
        Alert.alert(
          '紀錄心情',
          '幫你記錄現在的心情？',
          [
            {
              text: '否',
              onPress: () => {
                // 回傳 "沒問題的呦～ 下次再見！"
                setMessages(prevMessages => [
                  ...prevMessages,
                  { sender: 'ai', text: '沒問題的呦～ 下次再見！' }
                ]);
              },
            },
            {
              text: '是',
              onPress: () => navigation.navigate('主頁', { generateComic: true }), // 導向主畫面且生成漫畫
            },
          ],
          { cancelable: false }
        );
      }, 1000);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      
      <ScrollView style={styles.chatContainer}>
        {/* Chat messages */}
        {chatMessages.map((msg, index) => (
          <View
            key={index}
            style={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}>
            <Text>{msg.text}</Text>
          </View>
        ))}

     {/* 任務列表 */}
    <View style={styles.missionsContainer}>
      {selectedMission ? (
        // 顯示已選擇的任務並禁用按鈕
        <TouchableOpacity
          style={[styles.missionContainer, styles.selectedMissionContainer]}
          disabled={true} // 禁用按鈕
        >
          <Text style={[styles.missionText, styles.selectedMissionText]}>
            {selectedMission.content}
          </Text>
        </TouchableOpacity>
      ) : (
        // 顯示任務列表，未選擇時任務按鈕啟用
        missions.length > 0 ? (
          missions.map((mission, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.missionContainer,
                selectedMission?.id === mission.id && styles.selectedMissionContainer, // 已選任務樣式
              ]}
              onPress={() => handleMissionPress(mission)} // 選擇任務時的操作
              disabled={selectedMission !== null} // 已選擇的任務禁用按鈕
            >
              <Text
                style={[
                  styles.missionText,
                  selectedMission?.id === mission.id && styles.selectedMissionText, // 已選任務的文字樣式
                ]}
              >
                {mission.content}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          // 沒有任務時顯示
          <View style={styles.noMissionContainer}>
            <Text style={styles.noMissionText}>這裡空空如也</Text>
            <Text style={styles.noMissionText}>快來找我聊天領取任務吧～</Text>
          </View>
        )
      )}
    </View>

        {/* “完成了” 或 “還沒有”按鈕 */}
        {showCompletionButtons && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => handleMissionCompletion(true)}>
              <Text style={styles.buttonText}>完成了</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => handleMissionCompletion(false)}>
              <Text style={styles.buttonText}>還沒有</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.sceneContainer}>
        <ChatbotScene />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  sceneContainer: {
    flex: 0.8,
  },
  missionsContainer: {
    justifyContent: 'center',
    marginLeft: 45,
    marginRight: 45,
    marginBottom: 10,
    marginTop: 30,
  },
  missionContainer: {
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
  },
  missionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
  },
  noMissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
  },
  noMissionText: {
    fontSize: 16,
    color: '#80351E',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  completionButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MissionsScreen;