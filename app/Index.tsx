import React from 'react';
import { View } from 'react-native';
import AuthGate from './(auth)/AuthGate';
const Index = () => {
  return (
    <View style={styles.container}>
      <AuthGate />
    </View>
  )
}
const styles:any = {
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
  }
}
export default Index;