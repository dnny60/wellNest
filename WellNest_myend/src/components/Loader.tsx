import { Props } from '@react-three/fiber'
import React from 'react'
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native'

const Loader =() => {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={'black'}/>
      </View>
    )
  
}

export default Loader;

const styles = StyleSheet.create({
    container:{
        ...StyleSheet.absoluteFillObject,
        justifyContent:'center',
        alignItems:'center'
    }

})
