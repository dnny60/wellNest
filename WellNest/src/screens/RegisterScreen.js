import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import TopBar from '../components/TopBar';



// import RegistrationSVG from '../assets/images/misc/registration.svg';
// import GoogleSVG from '../assets/images/misc/google.svg';
// import FacebookSVG from '../assets/images/misc/facebook.svg';


const RegisterScreen = ({navigation}) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [dobLabel, setDobLabel] = useState('Date of Birth');

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor:'#EDEBDC',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 25}}>

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
          註冊
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
       
        </View>


        <InputField
          label={'電子郵件'}
          keyboardType="email-address"
        />
        
        <InputField
          label={'姓名'}
        />
        <InputField
          label={'密碼'}
          inputType="password"
        />

        <InputField
          label={'確認密碼'}
          inputType="password"
        />


        <CustomButton label={'註冊'} onPress={() => navigation.goBack()} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <Text>已經註冊？</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{color: '#80351E', fontWeight: '700'}}> 登入</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;