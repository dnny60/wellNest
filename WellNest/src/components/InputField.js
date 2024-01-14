import React from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        background: 'white', 
        border: '2px #B65A3D solid',
        paddingBottom: 8,
        marginBottom: 25,
      }}>
      
      {icon}
      {inputType == 'password' ? (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0}}
          secureTextEntry={true}
        />
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0}}
        />
      )}
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text style={{
            color: 'rgba(0;0;0;0.50)', 
            fontSize: 15,
            fontFamily: 'Roboto',
            fontWeight: '400'}}>{fieldButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}