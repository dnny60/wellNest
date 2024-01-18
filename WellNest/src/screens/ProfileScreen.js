import React, {useState, useEffect, useContext} from 'react';
import {View, Text, SafeAreaView, Button} from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/AuthContext';

const ProfileScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const {setIsUserLoggedIn} = useContext(AuthContext);

  useEffect(() => {
    const loadProfileData = async () => {
      const storedUsername = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    // 清除存储的用户数据
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
    setIsUserLoggedIn(false);
    // 可以添加其他需要清除的数据项
    // ...

    // 导航回登录页面
    navigation.navigate('Onboarding');
  };
  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Profile Screen</Text>
      <Text>Username: {username}</Text>
      <Text>Email: {email}</Text>
      <CustomButton label={'登出'} onPress={handleLogout} />
    </SafeAreaView>
  );
};

export default ProfileScreen;
