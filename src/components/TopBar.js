import React from 'react';
import { TouchableOpacity, View, Text} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const TopBar = ({ navigation }) => { 
    return (
        <View style={{
            flex: 0.1,
            marginTop:10,
            justifyContent:'center',
            flexDirection:'row',
            alignItems:'center',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} 
                    style={{
                        flex:0.6,
                        alignItems: 'flex-start',
                       
                        
                    }}>
                    <AntDesign name="arrowleft" size={30} color="black"  />
                       
                </TouchableOpacity>
                <Text style={{
                    flex:1,
                    justifyContent:'center',
                    alignItems:'center',
                    color: 'black', 
                    fontSize: 20, 
                    fontFamily: 'Rhodium Libre', 
                    fontWeight: '400',
                    }}>
                    WellNest
                </Text>
            
        </View>

      );
};

export default TopBar;