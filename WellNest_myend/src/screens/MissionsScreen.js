import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import {AuthContext} from '../components/AuthContext';
import ComicScreen from './ComicScreen';
import AnimalScene from '../scenes/animalScene';
import ChatbotScene from '../scenes/chatbotScene';

const API_URL = 'http://192.168.2.1:8080'; // Update this to your actual backend URL

const MissionsScreen = ({navigation}) => {
  const [missions, setMissions] = useState([]);
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const authContext = useContext(AuthContext);
  const {setIsUserLoggedIn} = authContext;

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

  const fetchMissions = async () => {
    try {
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
    Alert.alert(
      '任務完成確認',
      `你已完成任務 "${mission.content}" 嗎？`,
      [
        {
          text: '否',
          onPress: () => console.log('任務未完成'),
          style: 'cancel',
        },
        {
          text: '是',
          onPress: () => handleMissionCompletion(mission),
        },
      ],
      {cancelable: false},
    );
  };

  const handleMissionCompletion = mission => {
    Alert.alert(
      '生成漫畫',
      '你想要生成漫畫嗎？',
      [
        {
          text: '否',
          onPress: () => console.log('不生成漫畫'),
          style: 'cancel',
        },
        {
          text: '是',
          onPress: () => setModalVisible(true), // Show input modal
        },
      ],
      {cancelable: false},
    );
  };

  const handleSubmit = () => {
    console.log('User input:', userInput);
    // Implement logic to handle user input, such as sending it to the backend
    setModalVisible(false);
    setUserInput('');
    navigation.navigate('漫畫'); // Navigate to ComicScreen
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      <ScrollView style={styles.chatContainer}>
        <View style={[styles.messageContainer, styles.aiMessage]}>
          <Text>來選擇一樣任務吧～</Text>
        </View>

        {/* 任務列表 */}
        <View style={styles.missionsContainer}>
          {missions.length > 0 ? (
            missions.map((mission, index) => (
              <TouchableOpacity
                key={index}
                style={styles.missionContainer}
                onPress={() => handleMissionPress(mission)}>
                <Text style={styles.missionText}>{mission.content}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View>
              <Text style={styles.noMissionText}>暫時沒有任務。</Text>
              <Button title="獲取任務" onPress={fetchMissions} />
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.sceneContainer}>
        <ChatbotScene />
      </View>

      {/* Modal for user input */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>請告訴我們你是如何達成的？</Text>
            <TextInput
              style={styles.input}
              onChangeText={setUserInput}
              value={userInput}
              placeholder="輸入文字"
            />
            <Button title="提交" onPress={handleSubmit} />
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
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 14,
    borderBottomLeftRadius: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    width: 200,
    paddingHorizontal: 10,
  },
});

export default MissionsScreen;
