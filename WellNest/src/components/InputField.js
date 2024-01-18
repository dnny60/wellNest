import React from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#B65A3D',
        padding: 5,
        marginBottom: 25,
      }}>
      <Text
        style={{
          marginRight: 10,
          alignSelf: 'center',
        }}>
        {label}
      </Text>
      {inputType == 'password' ? (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            height: 30,
            textAlignVertical: 'center',
          }}
          secureTextEntry={true}
          onChangeText={onChangeText}
        />
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            height: 30,
            textAlignVertical: 'center',
          }}
          onChangeText={onChangeText}
        />
      )}
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text
          style={{
            color: 'rgba(0,0,0,0.5)',
            fontSize: 15,
            fontFamily: 'Roboto',
            fontWeight: '400',
            textAlignVertical: 'center',
          }}>
          {fieldButtonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
