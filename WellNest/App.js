import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';

function App() {
  return (
    <NavigationContainer  style={styles.container}>
      {/* <AppStack /> */}
      <AuthStack />
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes the whole screen
    backgroundColor: '#EDEBDC', // Replace with your desired background color
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default App;