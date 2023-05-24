import { ScrollView, SafeAreaView, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { Avatar } from '@rneui/base';
import { signOut } from 'firebase/auth/react-native';
import CustomListItems from '../components/CustomListItems';
import { auth, db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);

  const onSignOut = () => {
    // Unsubscribe from the snapshot listener
    const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      setChats(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    unsubscribe();

    signOut(auth)
      .then(() => {
        console.log('signed out!');
        navigation.replace('Login');
      })
      .catch((error) => {
        console.log({ error });
        alert(error.message);
      });
  };

  const enterChat = (id, chatName) => {
    navigation.navigate('Chat', { id, chatName });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const userChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredChats = userChats.filter((chat) => {
        if (chat.isGroupChat) {
          // Filter group chats where the current user is a participant or the creator
          return (
            (chat.participants &&
              chat.participants.some((participant) => participant.userId === auth.currentUser.uid)) ||
            (chat.createdBy === auth.currentUser.uid)
          );
        } else {
          // Filter one-on-one chats where the current user is a participant
          return (
            chat.participants &&
            chat.participants.some((participant) => participant.userId === auth.currentUser.uid)
          );
        }
      });

      setChats(filteredChats);
    });

    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chatz',
      headerStyle: { backgroundColor: '#ECE3E9' },
      headerTitleStyle: { color: 'black' },
      headerTintColor: 'white',
      headerLeft: () => (
        <View style={{ marginLeft: 14 }}>
          <TouchableOpacity activeOpacity={0.5} onPress={onSignOut}>
            <Avatar
              rounded
              borderColor="black"
              borderWidth={1}
              source={{ uri: auth?.currentUser?.photoURL }}
              size={35}
            />
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 80,
            marginRight: 20,
          }}
        >
          <TouchableOpacity activeOpacity={0.5}>
            <AntDesign name="camerao" size={25} color="black" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate('AddChat')}>
            <SimpleLineIcons name="pencil" size={22} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        {chats.map(({ id, chatName }) => (
          <CustomListItems key={id} id={id} chatName={chatName} enterChat={enterChat} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: 'white',
  },
});

