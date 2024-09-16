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

const ComicScreen = ({navigation}) => {
  const [comics, setComics] = useState([]);
  const [selectedComic, setSelectedComic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgmSound, setBgmSound] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

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

  const saveComic = async comicData => {
    try {
      const updatedComics = [...comics, comicData];
      await AsyncStorage.setItem('comics', JSON.stringify(updatedComics));
      setComics(updatedComics);
    } catch (error) {
      console.error('Failed to save comic:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Comic Gallery</Text>
      <FlatList
        data={comics}
        renderItem={renderComicCover}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
      <Button
        title="Add Comic"
        onPress={() => {
          const jsonData = {
            bgm: 'https://wellnestbucket.s3.ap-southeast-2.amazonaws.com/cozy_bgm.mp3',
            audio: [
              'https://wellnestbucket.s3.amazonaws.com/voice/20240916/n_1_1.mp3',
              // Add more audio URLs
            ],
            comic: [
              'https://wellnestbucket.s3.amazonaws.com/comic_images/20240916/comic_0.webp',
              // Add more comic URLs
            ],
          };
          saveComic(jsonData);
        }}
      />

      {/* Loading Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={loading}
        onRequestClose={() => setLoading(false)}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>

      {/* Content Modal */}
      {selectedComic && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={handleModalClose}>
          <SafeAreaView style={styles.modalContainer}>
            <Button title="Close" onPress={handleModalClose} />
            <FlatList
              data={selectedComic.comic}
              renderItem={({item}) => (
                <Image
                  source={{uri: item}}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              contentContainerStyle={styles.grid}
            />
          </SafeAreaView>
        </Modal>
      )}
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
    backgroundColor: '#fff',
  },
  image: {
    width: '48%',
    height: 150,
    margin: 1,
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
});

export default ComicScreen;
