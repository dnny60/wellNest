import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, SafeAreaView} from 'react-native';
import BirthdayPicker from '../components/BirthdayPicker';

const ProfileScreen = () => {
  // Set initial state for form fields
  const [fullName, setFullName] = useState('Puerto Rico');
  const [nickName, setNickName] = useState('puerto_rico');
  const [email, setEmail] = useState('youremail@domain.com');
  const [birth, setbirth] = useState('2001/12/02');
  const [gender, setGender] = useState('Female');

  // Function to handle form submission
  const handleSubmit = () => {
    // Process the state values further as needed
    console.log(fullName, nickName, email, gender);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          onChangeText={setFullName}
          value={fullName}
          placeholder="用戶名"
        />
        <TextInput
          style={styles.input}
          onChangeText={setNickName}
          value={nickName}
          placeholder="綽號"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="E-mail"
          keyboardType="email-address"
        />
        <BirthdayPicker
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="E-mail"
        />
        <TextInput
          style={styles.input}
          onChangeText={setGender}
          value={gender}
          placeholder="性別"
        />
        <BirthdayPicker
          date={birth}
          onDateChange={setbirth}
          style={styles.input}
        />
        {/* Use Picker or another component for birthday and gender selection */}
        {/* Submit button */}
        <Button title="完成" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create;

export default ProfileScreen;
