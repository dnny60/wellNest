// AuthService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.105:8080/users'; // 基础URL

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: email,
      password: password,
    });

    if (response.data && response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userEmail', response.data.email); // 保存email
      await AsyncStorage.setItem('userName', response.data.name); // 保存名字
      return response.data; // 返回数据对象
    } else {
      // 可以处理错误情况
      return null; // 或返回特定的错误信息
    }
  } catch (error) {
    console.error('Error:', error);
    throw error; // 或处理错误
  }
};

const logout = async () => {
  await AsyncStorage.removeItem('userToken');
};

const isLoggedIn = async () => {
  const userToken = await AsyncStorage.getItem('userToken');
  return !!userToken;
};

export default {
  login,
  logout,
  isLoggedIn,
};
