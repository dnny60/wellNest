import React from 'react';
import {ScrollView, SafeAreaView, Text, View} from 'react-native';
import TopBar from '../components/TopBar';
import AnimalScene from '../scenes/animalScene';

const ComicScreen = ({navigation}) => {
  return (
    <SafeAreaView
      style={{flex: 1, flexDirection: 'column', backgroundColor: '#EDEBDC'}}>
      <TopBar navigation={navigation} />
      <View style={{flex: 1}}>
        
       <Text>
        comic section
       </Text>
      </View>
    </SafeAreaView>
  );
};

export default ComicScreen;
