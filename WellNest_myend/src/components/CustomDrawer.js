import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {AuthContext} from '../components/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthService from './AuthService';

const CustomDrawer = props => {

  const {setIsUserLoggedIn} = useContext(AuthContext);

  const handleLogout = async (navigation) => {
    try {
      // Call the logout function and pass navigation
      // await AsyncStorage.removeItem('userToken');
  
      // If logout function doesn't throw an error, assume logout is successful
      setIsUserLoggedIn(false);
      navigation.navigate('Onboarding');
    } catch (error) {
      console.error('登出失败', error);
      Alert.alert('登出失败');
    }
  };

  
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#FCF7E8'}}>
        <View style={{
          padding:20,
        }}>
          <Image
            source={require('../assets/Images/user-profile.jpg')}
            style={{height: 80, width: 80, borderRadius: 40, marginBottom: 10}}
          />
          <Text
            style={{
              color: '#000',
              fontSize: 18,
              fontFamily: 'Roboto-Medium',
              marginBottom: 5,
            }}>
            John Doe
          </Text>
    
        </View>

        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>

      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        
        <TouchableOpacity  onPress={handleLogout}  style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="exit-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
              }}>
              登出
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};




export default CustomDrawer;