import { KeyboardAvoidingView, StyleSheet, Text, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Input, Image } from '@rneui/themed';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const { user } = userCredential;
        console.log('Signed in: ', user);
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        navigation.replace('Home');
      }
    });

    return unsubscribe; // Clean up the listener when the component unmounts
  }, [navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="light" />
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.title}>Welcome to Chatz</Text>
      </View>
      <Image
        source={require('../assets/images/chat.jpg')}
        style={styles.image}
      />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Email"
          autoFocus
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          onSubmitEditing={signIn}
        />
      </View>
      <Button
        containerStyle={styles.button}
        buttonStyle={{ backgroundColor: '#CE278C' }}
        title="Login"
        titleStyle={{ fontWeight: 'bold' }}
        onPress={signIn}
      />
      <Button
        containerStyle={styles.buttonRegister}
        buttonStyle={{ borderColor: '#CE278C' }}
        titleStyle={{ color: 'grey' }}
        title="Register"
        type="outline"
        onPress={() => navigation.navigate('Register')}
      />
      <View style={{ height: 100 }} />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  title: {
    marginTop: Platform.OS === 'android' ? 60 : 0,
    fontFamily: 'Inter-Black',
    fontSize: 25,
    color: '#AA9EA5'
  },
  button: {
    width: 200,
    marginTop: 10,
    // borderWidth: Platform.OS === 'android' ? 1 : 0,
  },
  buttonRegister: {
    width: 200,
    marginTop: 10,
    borderColor: Platform.OS === 'android' ? '#CE278C' : 0,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 30
  },
  inputContainer: { width: 300, }
});
