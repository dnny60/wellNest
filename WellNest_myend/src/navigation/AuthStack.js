import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SurveyScreen from '../screens/QuestionnaireStartScreen';
import Question1 from '../screens/Question1';
import {AuthContext} from '../components/AuthContext';
import AppStack from './AppStack';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);

  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('userToken');
  //       console.log('Token:', token);
  //       //true false記得改回來
  //       if (token) {
  //         setIsUserLoggedIn(true);
  //       } else {
  //         setIsUserLoggedIn(false);
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      // 这里我们不从 AsyncStorage 获取token，
      // 而是直接设置一个前端测试的登录状态，true为已登录，false为未登录
      const testLoggedInStatus = false; // 改为true来模拟已登录状态，false表示未登录
      setIsUserLoggedIn(testLoggedInStatus);
    };

    checkLoginStatus();
  }, []);

  if (isUserLoggedIn === null) {
    return null; // 或者加载中的指示器
  }
  return (
    <AuthContext.Provider value={{isUserLoggedIn, setIsUserLoggedIn}}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isUserLoggedIn ? (
          // 如果用户已登录，直接显示 ProfileScreen
          <>
            {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
            <Stack.Screen name="AppStack" component={AppStack} />
          </>
        ) : (
          // 如果用户未登录，显示完整的登录流程
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Survey" component={SurveyScreen} />
            <Stack.Screen name="Q1" component={Question1} />
          </>
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
};

export default AuthStack;
