import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import Icon from 'react-native-vector-icons/AntDesign';
import TopBar from '../components/TopBar';
import AuthService from '../components/AuthService';
import {AuthContext} from '../components/AuthContext';

// import LoginSVG from '../assets/images/misc/login.svg';
// import GoogleSVG from '../assets/images/misc/google.svg';
// import FacebookSVG from '../assets/images/misc/facebook.svg';
// import TwitterSVG from '../assets/images/misc/twitter.svg';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setIsUserLoggedIn} = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const data = await AuthService.login(email, password);
      if (data.token) {
        // 登录成功
        setIsUserLoggedIn(true);
        navigation.navigate('Profile');
      } else {
        // 显示错误消息
        Alert.alert('登录失败');
      }
    } catch (error) {
      console.error('登录失败', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 25,
          backgroundColor: '#EDEBDC',
          flexDirection: 'column',
        }}>
        <TopBar navigation={navigation} />

        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: 36,
            fontWeight: '400',
            color: '#80351E',

            marginTop: 100,
            marginBottom: 30,
          }}>
          登入
        </Text>

        <InputField
          label={'電子郵件'}
          keyboardType="email-address"
          onChangeText={text => {
            setEmail(text);
            console.log(text);
          }}
        />

        <InputField
          label={'密碼'}
          inputType="password"
          fieldButtonLabel={'Forgot?'}
          fieldButtonFunction={() => {}}
          onChangeText={text => {
            setPassword(text);
            console.log(text);
          }}
        />

        <CustomButton label={'登入'} onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
