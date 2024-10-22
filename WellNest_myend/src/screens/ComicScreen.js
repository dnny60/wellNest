import React, {useState, useRef, useEffect} from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';

const ComicScreen = ({navigation, route}) => {
  const [comics, setComics] = useState(Array(10).fill(null)); // 初始設置為空數組
  const [selectedComic, setSelectedComic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgmSound, setBgmSound] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const BGM_URL = "https://wellnestbucket.s3.ap-southeast-2.amazonaws.com/cozy_bgm.mp3";

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

  // Fetch comics collection on screen load
  const fetchComicCollection = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User is not authenticated');
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/comic/collection`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comic collection');
      }

      const data = await response.json();
      console.log('API Response:', data); // 確認 API 回傳的資料

      if (data.length === 0) {
        console.log('No comics found in the collection.');
      }

      setComics(data); // 更新漫畫集合
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message); // 在頁面上顯示錯誤
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComicCollection(); // 加載漫畫集合
  }, []);

  const handleModalOpen = comic => {
    setLoading(true);
    setSelectedComic(comic);
    
    console.log('Selected Comic:', comic);
    
    // Extract comic URLs and captions
    const comicUrls = comic.urlsByType?.comic?.map(c => c.url).filter(url => url) || [];
    const audioUrls = comic.urlsByType?.voice?.filter(url => url) || []; // Filter out undefined or empty audio URLs
    
    // Preload images
    const imagePromises = comicUrls.map(url => {
      if (url) {
        console.log(`Loading image: ${url}`);
        return Image.prefetch(url);
      }
      return Promise.resolve(); // Skip null or invalid URLs
    });
    
    // Preload audio
    const audioPromises = audioUrls.map(url =>
        new Promise(resolve => {
          if (url) {
            console.log(`Loading audio: ${url}`);
            new Sound(url, null, error => {
              resolve();  // You don't need to release here, as it's handled in playSound
            });
          } else {
            resolve();
          }
        }),
      );
    
    // Wait for images and audio to preload before opening modal
    Promise.all([...imagePromises, ...audioPromises]).then(() => {
      setLoading(false);
      setModalVisible(true);
    });
  };




  const renderComicImage = ({item, index}) => {
    // Get the caption and remove square brackets and any "caption:" prefix
    const caption = selectedComic?.urlsByType?.comic?.[index]?.caption?.replace(/[\[\]]/g, '').replace(/^caption:/, '').trim() || '';;
    
    // Get dialogue if available
    const dialogue = selectedComic?.dialogue
    ? selectedComic.dialogue.find(d => parseInt(d.page, 10) === index + 1)?.content.replace(/\\n/g, '')
    : '';


    return (
      <View style={styles.comicContainer}>
       {dialogue && (
          <View style={styles.dialogueWrapper}>
            <Text style={styles.dialogueText}>{dialogue}</Text>
            <View style={styles.dialogueTail} />
          </View>
        )}
        {/* Display comic image */}
        <Image
          source={{uri: item}}
          style={styles.fullImage}
          resizeMode="contain"
        />
        
        {/* Display caption if available */}
        {caption ? (
          <View style={styles.captionWrapper}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : null}
      </View>
    );
  };

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
  
  const playAudioQueue = (index = 1) => {
    if (selectedComic && selectedComic.urlsByType.voice && index < selectedComic.urlsByType.voice.length) {
      const sound = playSound(selectedComic.urlsByType.voice[index], () => {
        const nextIndex = index + 1;
        setCurrentAudioIndex(nextIndex);
  
        if (flatListRef.current && nextIndex < selectedComic.urlsByType.comic.length) {
          flatListRef.current.scrollToIndex({index: nextIndex, animated: true});
        }
  
        if (nextIndex < selectedComic.urlsByType.voice.length) {
          playAudioQueue(nextIndex);
        }
      });
      setAudioQueue(prevQueue => [...prevQueue, sound]);
    }
  };


  useEffect(() => {
    if (modalVisible && selectedComic) {
      const bgm = playSound(BGM_URL );
      setBgmSound(bgm);

      playAudioQueue();
    }
  }, [modalVisible, selectedComic]);

  const handleModalClose = () => {
    if (bgmSound) {
      bgmSound.stop(() => {
        bgmSound.release();
        setBgmSound(null);
      });
    }
    audioQueue.forEach(sound => {
      sound.stop(() => sound.release());
    });
  
    setAudioQueue([]);  // 清空队列
    setModalVisible(false);
    setCurrentAudioIndex(0);
  };

  const formatDate = (dateString) => {
    const datePart = dateString.split('T')[0]; 
    const [year, month, day] = datePart.split('-'); 
    return `${month}/${day}`;
  };

  const renderComicCover = ({item}) => {
    if (!item || !item.urlsByType || !item.urlsByType.comic || !item.urlsByType.comic[0]) {
      return (
        <View style={styles.coverContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.coverContainer}
          onPress={() => handleModalOpen(item)}>
            <Text style={styles.comicDate}>{formatDate(item.date)}</Text>
            <Text style={styles.comicTitle}> {item.title}</Text>
            <Image
              source={{uri: item.urlsByType.comic[0].url}}  // Correctly access the comic URL
              style={styles.coverImage}
            />
        </TouchableOpacity>
      );
    }
  };

  useEffect(() => {
    if (route.params?.autoFetch) {
      fetchComic();
    }
  }, [route.params]);

  //漫畫生成
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

      await fetchComicCollection();

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

    <View style={styles.titleWrapper}>
        <Text style={styles.title}>心情日記</Text>
    </View>
      

      <FlatList
        data={comics}
        renderItem={renderComicCover}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />


      {selectedComic && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={handleModalClose}>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleModalClose}>
              <Icon name="close" size={30} color="#000" />
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingComicContainer}>
                <ActivityIndicator size="large" color="#80351E" />
                <Text style={styles.loadingComicText}>載入中...</Text>
              </View>
            ) : (
              <FlatList
                  ref={flatListRef}
                  data={selectedComic.urlsByType.comic.map(c => c.url ? c.url : null)}
                  renderItem={renderComicImage}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  getItemLayout={(data, index) => ({
                    length: 400,  // 每個項目的固定寬度/高度
                    offset: 400 * index,  // 根據索引計算每個項目的位置
                    index,
                  })}
                  onScrollToIndexFailed={info => {
                    // 這個函數可以處理滾動到不可見項目的失敗
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                  }}
                />
            )}
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
  titleWrapper:{
    width:'100%',
    borderBottomWidth:1,
    borderColor:'#80351E'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#80351E',
    textAlign: 'center',
    marginVertical: 20,
  },
  comicDate: {
    fontSize:10,
    color: '#E3B7AA',
    textAlign: 'center',
    padding:2,   
  },
  comicTitle:{
    fontSize:12,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom:5,
  },
  grid: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor:'#E3B7AA',
    height:'200%'
    
  },
  coverContainer: {
    margin: 10,
    marginTop:30,
    paddingTop:20,
    width: 150,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor:'#ECDDC2',
    backgroundColor:'white',
    borderRadius: 10,
    borderWidth:0.1,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  coverImage: {
    width: 150,
    height: 150,
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#EDEBDC',
    justifyContent: 'center',
    alignContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEBDC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#80351E',
  },
  comicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 400, // 固定寬度以保持位置一致
    height: 'auto', // 固定高度
    position: 'relative', // 使用相對位置確保內容不會相互重疊

  },
  captionWrapper: {
    backgroundColor: '#EDEBDC',
    borderRadius: 0,
    width: '70%',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    position: 'absolute', // 固定位置
    bottom: 160, // 固定在容器的底部
  
  },
  captionText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#444',
    flexWrap: 'wrap',
  },
  dialogueWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flexShrink: 1,
    flexDirection: 'column', 
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 20, 
    position: 'absolute', 
    top: 50,  
    overflow: 'visible',  
    width:'70%'
  },
  
  dialogueText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    flexWrap: 'wrap',  
  },
  dialogueTail: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 25,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fullImage: {
    width: 400,    // 圖片填滿容器寬度
    height: '70%',    // 固定高度為容器的70%
    position: 'absolute', // 固定圖片位置，防止圖片移動
    top: 60, // 保證圖片在容器頂部開始
    marginHorizontal: 0.5,
    marginTop: 50,
    marginBottom: -20,
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
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ComicScreen;