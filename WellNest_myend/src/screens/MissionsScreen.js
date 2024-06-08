import React, {useState} from 'react';
import {
  ScrollView,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TopBar from '../components/TopBar';
import axios from 'axios';

const API_URL = 'http://192.168.1.101:8080'; // Update this to your actual backend URL

const MissionsScreen = ({navigation}) => {
  const [missions, setMissions] = useState([]);

  const fetchMissions = async emotion => {
    try {
      const response = await axios.get(`${API_URL}/missions/${emotion}`);
      setMissions(response.data);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#EDEBDC'}}>
      <TopBar navigation={navigation} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          margin: 10,
        }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchMissions('positive')}>
          <Text style={styles.buttonText}>Positive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchMissions('negative')}>
          <Text style={styles.buttonText}>Negative</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchMissions('neutral')}>
          <Text style={styles.buttonText}>Neutral</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{flex: 1, padding: 10}}>
        {missions.length > 0 ? (
          missions.map((mission, index) => (
            <View key={index} style={styles.missionContainer}>
              <Text style={styles.missionText}>Emotion: {mission.emotion}</Text>
              <Text style={styles.missionText}>Content: {mission.content}</Text>
              <Text style={styles.missionText}>
                Difficulty: {mission.difficulty}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMissionText}>
            Select an emotion to see missions
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  button: {
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  missionContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  missionText: {
    fontSize: 16,
    color: '#80351E',
  },
  noMissionText: {
    fontSize: 16,
    color: '#80351E',
    textAlign: 'center',
    marginTop: 20,
  },
};

export default MissionsScreen;
