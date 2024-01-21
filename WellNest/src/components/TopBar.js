import React from 'react';
import { TouchableOpacity, View, Text} from 'react-native';
import { COLORS, FONTS } from "../constants";
import Icon from 'react-native-vector-icons/Ionicons';


const TopBar = ({ navigation }) => { 
    return (
        <View style={{
            
            marginHorizontal: 12,
            justifyContent:'center',
            flexDirection:'row',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} 
                    style={{
                        position: "absolute",
                        left: 0,
                                
                    }}>
                     <Icon
                        name={'arrow-left'}
                        size={35}
                        color={'black'}
                        />
                       
                </TouchableOpacity>
                <Text style={{ ...FONTS.h3 }}> WellNest </Text>
            
        </View>

      );
};

export default TopBar;