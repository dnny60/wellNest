import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import Icon from 'react-native-vector-icons/AntDesign';
import TopBar from '../components/TopBar';




// import LoginSVG from '../assets/images/misc/login.svg';
// import GoogleSVG from '../assets/images/misc/google.svg';
// import FacebookSVG from '../assets/images/misc/facebook.svg';
// import TwitterSVG from '../assets/images/misc/twitter.svg';



const LoginScreen = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <View style={{
        flex:1, 
        paddingHorizontal: 25, 
        backgroundColor:'#EDEBDC',
        flexDirection: 'column',
        
         
        }}>
        <TopBar navigation={navigation} />

        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: 36,
            fontWeight: '400',
            color: '#80351E',
            wordWrap: 'break-word',
            marginTop:100,
            marginBottom: 30,
          }}>
          登入
        </Text>

        <InputField
          label={'電子郵件'}
          keyboardType="email-address"
          
        />

        <InputField
          label={'密碼'}
          inputType="password"
          fieldButtonLabel={"Forgot?"}
          fieldButtonFunction={() => {}}
        />
        
        <CustomButton label={"登入"}  onPress={() => navigation()} />
        
        
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;