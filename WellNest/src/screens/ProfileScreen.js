import React, {useState, useEffect, useContext} from 'react';
import {View, Text, SafeAreaView, Button, TextBase} from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/AuthContext';
import AuthService from '../components/AuthService';

const ProfileScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const {setIsUserLoggedIn} = useContext(AuthContext);
  const [threadId, setThreadId] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userAge, setUserAge] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      const storedUsername = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storeGender = await AsyncStorage.getItem('userGender');
      const storeAge = await AsyncStorage.getItem('userAge');
      const storedThreadId = await AsyncStorage.getItem('threadId');

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
      if (storedThreadId) setThreadId(storedThreadId);
      if (storeGender) setUserGender(storeGender);
      if (storeAge) setUserAge(storeAge);
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    // 清除存储的用户数据
    AuthService.logout();

    setIsUserLoggedIn(false);
    // 可以添加其他需要清除的数据项
    // ...

    // 导航回登录页面
  };
  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Profile Screen</Text>
      <Text>Username: {username}</Text>
      <Text>Email: {email}</Text>
      <Text>ThreadId: {threadId}</Text>
      <Text>Gender: {userGender}</Text>
      <Text>Age: {userAge}</Text>

      <CustomButton label={'登出'} onPress={handleLogout} />
      <CustomButton
        label={'主頁'}
        onPress={() => {
          navigation.navigate('Home');
        }}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
