import React from 'react'
import {ScrollView,SafeAreaView,Text} from 'react-native';
import TopBar from '../components/TopBar';


const MissionsScreen = ({navigation}) => {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'#EDEBDC',}}>
    <TopBar navigation={navigation} />
    <ScrollView style={{flex:1}}> 
        <Text style={{
          fontSize: 50,
          fontWeight: '400',
          color: '#80351E',

        }}>Mission Screen 
        </Text>
      </ScrollView>
  </SafeAreaView>
  )
}

export default MissionsScreen
