import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddChatScreen from './screens/AddChatScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();

const globalScreenOptions ={
  headerStyle: { backgroundColor: '#CE278C'},
  headerTitleStyle: { color : 'white'},
  headerTintColor: 'white',
};

export default function App() {

  const [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf')
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={globalScreenOptions}>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='AddChat' component={AddChatScreen} />
        <Stack.Screen name='Chat' component={ChatScreen} />
      </Stack.Navigator>
    </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
