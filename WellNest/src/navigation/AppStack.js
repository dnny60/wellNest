import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import MissionsScreen from '../screens/MissionsScreen';
import ComicScreen from '../screens/ComicScreen';
import HomeScreen from '../screens/HomeScreen';
import EditProfile from '../screens/EditprofileScreen';
import CustomDrawer from '../components/CustomDrawer';
import SettingStack from './SettingStack';

import Ionicons from 'react-native-vector-icons/Ionicons';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const AppStack = () => {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer{...props}/>} screenOptions={{headerShown: false}}>
      <Drawer.Screen name="Home" component={HomeScreen} options={{
        drawerIcon:({color}) => (
          <Ionicons name="home-outline" size={22} color={color}/>
        )
      }}/>
      <Drawer.Screen name="Setting" component={SettingStack} >
      </Drawer.Screen>
      <Drawer.Screen name="Comic" component={ComicScreen} />
      <Drawer.Screen name="Mission" component={MissionsScreen} />
    </Drawer.Navigator>
  );
};

export default AppStack;