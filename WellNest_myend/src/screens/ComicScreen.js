import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import AnimalScene from '../scenes/animalScene';
import ChatbotScene from '../scenes/chatbotScene';
import Icon from 'react-native-vector-icons/Ionicons';


const ComicScreen = ({navigation, route}) => {
  const [comics, setComics] = useState([]);
  const [selectedComic, setSelectedComic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgmSound, setBgmSound] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [caption, setCaption] = useState(''); // Add state for caption
  const [description, setDescription] = useState(''); // Add state for description
  const [narration, setNarration] = useState(''); // Add state for narration
  const [generatingComic, setGeneratingComic] = useState(false); // Track comic generation
  const [error, setError] = useState(null);



  const API_URL = 'http://172.20.10.3:8080';

  useEffect(() => {
    const loadComics = async () => {
      try {
        const storedComics = await AsyncStorage.getItem('comics');
        if (storedComics) {
          setComics(JSON.parse(storedComics));
        }
      } catch (error) {
        console.error('Failed to load comics:', error);
      }
    };
    loadComics();
  }, []);

  const playSound = (url, onEnd) => {
    console.log(`Loading sound: ${url}`);
    const sound = new Sound(url, null, error => {
      if (error) {
        Alert.alert('Error', 'Failed to load the sound');
        return;
      }
      console.log(`Playing sound: ${url}`);
      sound.play(() => {
        sound.release();
        if (onEnd) onEnd();
      });
    });
    return sound;
  };

  const playAudioQueue = (index = 0) => {
    if (selectedComic && index < selectedComic.audio.length) {
      const sound = playSound(selectedComic.audio[index], () => {
        playAudioQueue(index + 1);
      });
      setAudioQueue(prevQueue => [...prevQueue, sound]);
    }
  };

  const handleModalOpen = comic => {
    setLoading(true);
    setSelectedComic(comic);

    // Preload images
    const imagePromises = comic.comic.map(url => {
      console.log(`Loading image: ${url}`);
      return Image.prefetch(url);
    });

    // Preload audio
    const audioPromises = comic.audio.map(
      url =>
        new Promise(resolve => {
          console.log(`Loading audio: ${url}`);
          const sound = new Sound(url, null, error => {
            if (!error) sound.release();
            resolve();
          });
        }),
    );

    // Load images and audio first, then open the modal
    Promise.all([...imagePromises, ...audioPromises]).then(() => {
      setLoading(false);
      setModalVisible(true);
    });
  };

  // Use an effect to play the sounds once the modal is open
  useEffect(() => {
    if (modalVisible && selectedComic) {
      // Play BGM
      const bgm = playSound(selectedComic.bgm);
      setBgmSound(bgm);

      // Play audio queue
      playAudioQueue();
    }
  }, [modalVisible, selectedComic]);

  const handleModalClose = () => {
    // Stop and release BGM
    if (bgmSound) {
      bgmSound.stop(() => bgmSound.release());
      setBgmSound(null);
    }

    // Stop and release all audio in the queue
    audioQueue.forEach(sound => {
      sound.stop(() => sound.release());
    });

    // Clear the queue and reset the index
    setAudioQueue([]);
    setCurrentAudioIndex(0);
    setModalVisible(false);
  };

  const renderComicCover = ({item}) => (
    <TouchableOpacity
      style={styles.coverContainer}
      onPress={() => handleModalOpen(item)}>
      <Image source={{uri: item.comic[0]}} style={styles.coverImage} />
    </TouchableOpacity>
  );

  const saveComic = async (comicData) => {
    try {
      const updatedComics = [...comics, comicData];
      await AsyncStorage.setItem('comics', JSON.stringify(updatedComics));
      setComics(updatedComics);
    } catch (error) {
      console.error('Failed to save comic:', error);
    }
  };

  useEffect(() => {
    if (route.params?.userInput) {
      fetchComic();
    }
  }, [route.params?.userInput]);

  const fetchComic = async () => {
    try {
      // Retrieve the user token from AsyncStorage
      const userToken = await AsyncStorage.getItem('userToken');
  
      // Ensure userToken exists before making the request
      if (!userToken) {
        throw new Error('User is not authenticated');
      }
  
      setLoading(true);
  
      // Make the API request to fetch the comic
      const response = await fetch(`${API_URL}/comic`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include the Bearer token
        },
      });
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
  
      // Parse the response
      const data = await response.json();
  
      // Save the comic data
      saveComic(data);
    } catch (error) {
      // Handle errors
      setError(error.message);
      Alert.alert('Error', `Failed to fetch comic: ${error.message}`);
    } finally {
      // Stop the loading spinner
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <Text style={styles.title}>漫畫集</Text>
    <FlatList
      data={generatingComic ? [{ comic: ['loading_placeholder_url'] }] : comics} // Display placeholder if generating
      renderItem={generatingComic ? () => (
        <View style={styles.loadingComicContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingComicText}>生成漫畫中...</Text>
        </View>
      ) : renderComicCover}
      keyExtractor={(item, index) => index.toString()}
      numColumns={2}
      contentContainerStyle={styles.grid}
    />
      {/* Fetch Comic Button */}
      <Button title="Fetch Comic" onPress={fetchComic} />


    {/* Loading Modal */}
    <Modal
      animationType="none"
      transparent={true}
      visible={loading}
      onRequestClose={() => setLoading(false)}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#80351E" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    </Modal>

    {/* Content Modal */}
    {selectedComic && (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          
          <TouchableOpacity style={styles.closeButton} onPress={ handleModalClose} >
            <Icon name="close" size={30} color="#000"/>
          </TouchableOpacity>

          <FlatList
            data={selectedComic.comic}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.columnWrapper} 
          />

          <View style={styles.sceneContainer}>
            <ChatbotScene />
          </View>
        </SafeAreaView>
      </Modal>
    )}
     {/* Error Display */}
     {error && <Text style={styles.errorText}>{error}</Text>}
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#80351E',
    textAlign: 'center',
    marginVertical: 20,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneContainer: {
    flex: 0.6,
    justifyContent: 'flex-end',
  },
  coverContainer: {
    margin: 10,
  },
  coverImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#EDEBDC',

  },
  image: {
    width: '50%',
    height: undefined, // 高度自适应
    aspectRatio: 4 / 4, // 假设图片比例为 3:4
    margin: 1,
    marginTop:15,
  },
  columnWrapper: {
    justifyContent: 'space-between', // 控制两列之间的距离
    marginBottom: 5, // 控制每行之间的垂直间距
    paddingHorizontal:40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
  },
  textContainer: {
    padding: 20,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  textContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingComicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  loadingComicText: {
    marginTop: 10,
    color: '#80351E',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 7,
    zIndex: 1,
  },
});

export default ComicScreen;
