import React, {useState, useEffect} from 'react';
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

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  useEffect(() => {
    setIsPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]); // 只有當 password 或 confirmPassword 改變時才運行

  // 檢查密碼是否匹配的函數
  const checkPasswordMatch = () => {
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    setIsPasswordMatch(password === confirmPassword);
  };

  // 註冊的函數
  //這裡把註冊的資料傳到後端
  const registration = () => {
    fetch('http://192.168.1.105:8080/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: nickname,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        console.log(data.status);
        if (data.status === 'success') {
          navigation.navigate('Login');
          //註冊成功的話，會跳轉到登入頁面
          //如果要加入註冊成功的提示，可以在這裡加入
        } else {
          alert(data.message);
          //如果註冊失敗，會跳出註冊失敗的提示
          //也可以加入其它東西
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    console.log('Registration');
  };

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: '#EDEBDC',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 25,
        }}>
        <TopBar navigation={navigation} />
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: 36,
            fontWeight: '400',
            color: '#80351E',
            wordWrap: 'break-word',
            marginTop: 100,
            marginBottom: 30,
          }}>
          註冊
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}></View>
        <InputField
          label={'電子郵件'}
          keyboardType="email-address"
          onChangeText={text => {
            setEmail(text);
            console.log(text);
          }}
        />
        <InputField
          label={'暱稱'}
          onChangeText={text => {
            setNickname(text);
            console.log(text);
          }}
        />
        <InputField
          label={'密碼'}
          inputType="password"
          onChangeText={text => {
            setPassword(text);
            console.log(text);
            checkPasswordMatch();
          }}
        />
        <InputField
          label={'確認密碼'}
          inputType="password"
          onChangeText={text => {
            setConfirmPassword(text);
            console.log(text);
            checkPasswordMatch();
          }}
        />
        {!isPasswordMatch && (
          <Text style={{color: 'red', alignSelf: 'flex-start'}}>
            密碼不相同
          </Text>
        )}
        {isPasswordMatch && password && confirmPassword && (
          // 這裡可以放置一個勾選圖標
          <Text style={{color: 'green', alignSelf: 'flex-end'}}>✔</Text>
        )}

        <CustomButton label={'註冊'} onPress={registration} />

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
