import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor="#F4F6F9" />
      <MainScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  }
});