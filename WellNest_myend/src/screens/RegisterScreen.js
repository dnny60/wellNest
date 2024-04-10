import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import TopBar from '../components/TopBar';
import {Picker} from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';

const RegisterScreen = ({navigation}) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [dobLabel, setDobLabel] = useState('Date of Birth');

  const [gender, setGender] = useState(''); // 性别状态
  const [age, setAge] = useState(''); // 年龄状态

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isNicknameEmpty, setIsNicknameEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);

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
  // const API_URL = 'http://52.68.188.15/';
  //'http://192.168.1.105:8080/users/register'
  const registration = () => {
    console.log('Registration button pressed');
    if (email && nickname && password && confirmPassword && gender && age) {
      axios
        .post('http://localhost:8080/users/register', {
          email: email,
          password: password,
          name: nickname,
          gender: gender,
          age: age,
        })
        .then(response => {
          console.log('Success:', response.data);
          // 根据 response 处理成功的逻辑
          if (response.data.status === 'success') {
            // 注册成功的逻辑
          } else if (response.data.error === '该电子邮件已被注册') {
            // 电子邮件已被注册的逻辑
          } else {
            // 其他错误的逻辑
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#EDEBDC',
        flex: 1,
        justifyContent: 'center',
      }}>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <TopBar navigation={navigation} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            paddingHorizontal: 30,
            flexDirection: 'column',
          }}>
          <Text
            style={{
              fontFamily: 'Roboto-Medium',
              fontSize: 36,
              fontWeight: '400',
              color: '#80351E',

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
              setIsEmailEmpty(!text);
              console.log(text);
            }}
          />
          {isEmailEmpty && (
            <Text style={styles.errorText}>電子郵件不能為空</Text>
          )}
          <InputField
            label={'暱稱'}
            onChangeText={text => {
              setNickname(text);
              setIsNicknameEmpty(!text);
              console.log(text);
            }}
          />

          {isNicknameEmpty && (
            <Text style={styles.errorText}>暱稱不能為空</Text>
          )}

          {/* 性别选择 */}
          <View style={styles.container}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>性別</Text>
            </View>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                selectedValue={gender}
                onValueChange={value => setGender(value)}
                items={[
                  {label: '男', value: 'Male'},
                  {label: '女', value: 'Female'},
                  {label: '其他', value: 'Other'},
                ]}
              />
            </View>
          </View>

          <InputField
            label={'年齡'}
            inputType="age"
            keyboardType="numeric"
            onChangeText={text => {
              setAge(text);
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
          {isPasswordEmpty && (
            <Text style={styles.errorText}>密碼不能為空</Text>
          )}
          {!isPasswordMatch && (
            <Text style={{color: 'red', alignSelf: 'flex-start'}}>
              密碼不相同
            </Text>
          )}
          {isPasswordMatch && password && confirmPassword && (
            // 這裡可以放置一個勾選圖標
            <Text style={{color: 'green', alignSelf: 'flex-end'}}>✔</Text>
          )}

          <CustomButton
            label={'註冊'}
            onPress={() => registration(navigation)}
          />

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
    </View>
  );
};

const styles = StyleSheet.create({
  // ... 其他样式 ...
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#B65A3D',
    padding: 5,
    marginBottom: 25,
    height: 45,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: 'gray',
  },
  pickerContainer: {
    flex: 8,
    textAlignVertical: 'center',
    // Adjust this as needed
  },
});

export default RegisterScreen;
