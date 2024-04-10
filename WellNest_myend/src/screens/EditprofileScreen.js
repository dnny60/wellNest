import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  StyleSheet
} from "react-native";
import React, { useState } from "react";
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS, FONTS } from "../constants";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
// import { imagesDataURL } from "../constants/data";
import DatePicker, { getFormatedDate } from "react-native-modern-datepicker";
import TopBar from '../components/TopBar';
import LinearGradient from 'react-native-linear-gradient';

import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    return result === RESULTS.GRANTED;
  }

  return true;
};

const EditProfile = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [name, setName] = useState("陳小明");
  const [email, setEmail] = useState("metperters@gmail.com");
  const [password, setPassword] = useState("randompassword");
  const [gender, setGender] = useState("女生");

  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "YYYY/MM/DD"
  );
  const [selectedStartDate, setSelectedStartDate] = useState("01/01/1990");
  const [startedDate, setStartedDate] = useState("12/12/2023");

  const handleChangeStartDate = (propDate) => {
    setStartedDate(propDate);
  };

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  const handleImageSelection = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      console.log('No permission to access gallery');
      return;
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      
      }
    );
  };
  const minDate = new Date('1934-01-01');

  function renderDatePicker() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={openStartDatePicker}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: '#5B0F0F',
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              padding: 35,
              width: "90%",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <DatePicker
              mode="calendar"
              minimumDate={getFormatedDate(minDate, 'YYYY/MM/DD')}
              selected={startedDate}
              onDateChanged={handleChangeStartDate}
              onSelectedChange={(date) => setSelectedStartDate(date)}
              options={{
                backgroundColor: '#5B0F0F',
                textHeaderColor: "#F2D0B2",
                textDefaultColor: COLORS.white,
                selectedTextColor: COLORS.white,
                mainColor: "#F2D0B2",
                textSecondaryColor: COLORS.white,
                
              }}
            />

            <TouchableOpacity onPress={handleOnPressStartDate}>
              <Text style={{ ...FONTS.body3, color: COLORS.white }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <LinearGradient
      colors={['#F2D0B2', '#F7C4BE']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }} // Apply any style you want
    >
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 22,
      }}
    >
        <TopBar navigation={navigation} />


      <ScrollView>
        <View
          style={{
            alignItems: "center",
            marginVertical: 22,
          }}
        >
          
            <Image
               source={selectedImage ? { uri: selectedImage } :require('../assets/Images/user-profile.jpg')}
              style={{
                height: 130,
                width: 130,
                borderRadius: 85,
              }}
            />

           
            <TouchableOpacity onPress={handleImageSelection}>
            <View
              style={{
                position: "absolute",
                backgroundColor:'white',
                borderRadius:100,
                padding:5,
                bottom: 0,
                left: 25,
                zIndex: 9999,
              }}
            >
              <MaterialIcons
                name="photo-camera"
                size={20}
                color={'gray'}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{
          marginHorizontal:20,
          
          
        }}>
          <View
            style={ styles.container}
          >
            <Text style={{ marginTop:10, color:'gray'}}>全名</Text>
            <View
              style={styles.input}
            >
              <TextInput
                value={name}
                onChangeText={(value) => setName(value)}
                editable={true}
              />
            </View>
          </View>

          <View
            style={styles.container}
          >
            <Text style={{marginTop:10, color:'gray'}}>Email</Text>
            <View
              style={styles.input}
            >
              <TextInput
                value={email}
                onChangeText={(value) => setEmail(value)}
                editable={true}
              />
            </View>
          </View>

          <View
            style={styles.container}
          >
            <Text style={{marginTop:10, color:'gray'}}>密碼</Text>

            <View
              style={styles.input}
            >
              <TextInput
                value={password}
                onChangeText={(value) => setPassword(value)}
                editable={true}
                secureTextEntry
              />
            </View>
          </View>

          <View
            style={styles.container}
          >
            <Text style={{marginTop:10, color:'gray'}}>生日</Text>
            <TouchableOpacity
              onPress={handleOnPressStartDate}
              style={styles.input}
            >
              <Text>{selectedStartDate}</Text>
            </TouchableOpacity>
          </View>
        

        <View
          style={styles.container}
        >
          <Text style={{marginTop:10, color:'gray'}}>性別</Text>
          <View
            style={styles.input}
          >
            <TextInput
              value={gender}
              onChangeText={(value) => setGender(value)}
              editable={true}
            />
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#5B0F0F',
            height: 44,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...FONTS.body3,
              color: COLORS.white,
            }}
          >
            保存
          </Text>
        </TouchableOpacity>

        {renderDatePicker()}
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );

  
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor:COLORS.white,
    marginBottom: 6,
    borderColor: COLORS.secondaryGray,
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
    marginBottom:30,
    borderRadius:10
  },
  input:{

    height: 30,
    width: "100%",
    marginVertical: 1,
    justifyContent: "center",
    

  }
});



export default EditProfile;