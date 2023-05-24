import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useLayoutEffect } from 'react';
import { Button, Input, Text, Avatar } from '@rneui/themed';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, setDoc, getFirestore } from 'firebase/firestore';

const firestore = getFirestore();

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back to Login",
    });
  }, [navigation]);

  const register = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);

        // Store additional user data in the database
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL:
            imageUrl ||
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        };

        // Save the user data to Firestore
        const userRef = doc(firestore, 'users', user.uid);
        setDoc(userRef, userData);

        return updateProfile(user, {
          displayName: name,
          photoURL:
            imageUrl ||
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        });
      })
      .then(() => {
        console.log('Profile updated successfully.');
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
    <StatusBar style="light" />
      <Text h3 style={{ marginBottom: 50 }}>
        Create a Chatz Account
      </Text>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Full Name"
          autoFocus
          type="text"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
          placeholder="Password"
          type="password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <Input
          placeholder="Profile Picture Url (optional)"
          type="text"
          value={imageUrl}
          onChangeText={(text) => setImageUrl(text)}
          onSubmitEditing={register}
        />
      </View>
      <Button
        containerStyle={styles.button}
        buttonStyle={{backgroundColor: '#CE278C'}}
        title="Register"
        titleStyle={{fontWeight: 'bold'}}
        onPress={register}
        raised
      />
      <View style={{height: 100}} />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white'
  },
  inputContainer: {
    width: 300,
    marginTop: 10
  },
  button: {
    width: 200,
    marginTop: 10
  }
})
