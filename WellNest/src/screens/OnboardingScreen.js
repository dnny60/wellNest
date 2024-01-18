import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {Image} from 'react-native-reanimated/lib/typescript/Animated';

// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Gaming from '../assets/images/misc/gaming.svg';

const OnboardingScreen = ({navigation}) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}>
      <ImageBackground
        source={require('../assets/Images/wallpaper.png')}
        style={styles.backgroundImage}>
        <View style={{marginTop: 20}}>
          <Text
            style={{
              width: 230,
              height: 232,
              textAlign: 'center',
              color: 'black',
              fontSize: 48,
              fontFamily: 'Rhodium Libre',
              fontWeight: '400',
            }}>
            Welcome to WellNest
          </Text>
        </View>
      </ImageBackground>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          padding: 10,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#B65A3D',
            width: 167,
            height: 52,
            borderRadius: 10,
            margin: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Login')}>
          <Text
            style={{
              color: '#B65A3D',
              fontSize: 13,
              fontFamily: 'Roboto',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.52,
            }}>
            登入
          </Text>
          {/* <MaterialIcons name="arrow-forward-ios" size={22} color="#fff" /> */}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#80351E',
            borderRadius: 10,
            width: 167,
            height: 52,
            margin: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Register')}>
          <Text
            style={{
              color: 'white',
              fontSize: 13,
              fontFamily: 'Roboto',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.52,
            }}>
            註冊
          </Text>
          {/* <MaterialIcons name="arrow-forward-ios" size={22} color="#fff" /> */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    // width:'100%',
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 48,
    fontFamily: 'Rhodium Libre',
    fontWeight: '400',
  },
});

export default OnboardingScreen;
