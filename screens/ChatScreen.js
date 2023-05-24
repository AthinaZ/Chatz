import React, { useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  Text, View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Keyboard
} from 'react-native';
import { Avatar } from '@rneui/base';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const ChatScreen = ({ navigation, route }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    Keyboard.dismiss();
    await addDoc(collection(db, 'chats', route.params.id, 'messages'), {
      timestamp: serverTimestamp(),
      message: input,
      displayName: auth.currentUser?.displayName,
      email: auth.currentUser?.email,
      photoURL: auth.currentUser?.photoURL,
    })
      .then(() => {
        console.log('Message sent:', input);
        setInput('');
      })
      .catch(error => alert(error));
    };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chat',
      headerBackTitleVisible: false,
      headerTitleAlign: 'left',
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Avatar
            rounded
            source={{
              uri:
                messages[0]?.photoURL ||
                "https://cdn.pixabay.com/photo/2017/02/23/13/05/avatar-2092113_960_720.png",
            }}
            size={35}
          />
          <Text style={{ color: 'white',fontWeight: '800', marginLeft: 10 }}>
            {route.params.chatName}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={navigation.goBack}
        >
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
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
            <FontAwesome name="video-camera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5}>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, messages]);

  useLayoutEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'chats', route.params.id, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) =>
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )
    );

    return unsubscribe; // Cleanup function to unsubscribe when component unmounts
  }, [route]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {messages.map(({ id, displayName, message, photoURL, email, timestamp }, index) => {
                const currentDate = new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }).format(timestamp?.toDate());

                  return (
                    <React.Fragment key={id}>
                      {index === 0 || currentDate !== new Intl.DateTimeFormat('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(messages[index - 1].timestamp?.toDate()) ? (
                        <View style={styles.dateContainer} key={id}>
                          <Text style={styles.dateText}>{currentDate}</Text>
                        </View>
                      ) : null}
                      {email === auth.currentUser?.email ? (
                        <View style={styles.sender}>
                          <Avatar
                            source={{ uri: photoURL }}
                            rounded
                            size={30}
                            position="absolute"
                            bottom={-15}
                            right={-5}
                            containerStyle={{
                              position: 'absolute',
                              bottom: -15,
                              right: -5,
                            }}
                          />
                          <Text style={styles.senderText}>{message}</Text>
                          <Text style={styles.timestampSender}>
                            {timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.receiver}>
                          <Avatar
                            source={{ uri: photoURL }}
                            rounded
                            size={30}
                            position="absolute"
                            bottom={-15}
                            left={-5}
                            containerStyle={{
                              position: 'absolute',
                              bottom: -15,
                              left: -5,
                            }}
                          />
                          <Text style={styles.receiverText}>{message}</Text>
                          <Text style={styles.displayName}>{displayName}</Text>
                          <Text style={styles.timestampReceiver}>
                            {timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
            <View style={styles.footer}>
              <TextInput
                style={styles.textInput}
                placeholder="Chatz Message"
                // multiline
                value={input}
                onSubmitEditing={sendMessage}
                onChangeText={setInput}
              />
              <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
                <Ionicons name="send" size={24} color="#CE278C" />
              </TouchableOpacity>
            </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {  flex: 1, },
  scrollViewContent: { paddingTop: 15, },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: '#ECECEC',
    padding: 10,
    color: 'grey',
    borderRadius: 30,
  },
  receiver :{
    padding: 15,
    backgroundColor: '#CE278C',
    alignSelf: 'flex-start',
    borderRadius: 20,
    margin: 15,
    maxWidth: '80%',
    position: 'relative',
  },
  receiverText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 10,
    marginBottom: 10,
  },
  sender: {
    padding: 15,
    backgroundColor: '#ececec',
    alignSelf: 'flex-end',
    borderRadius: 20,
    margin: 15,
    maxWidth: '80%',
    position: 'relative',
  },
  senderText: {
    color: 'black',
    fontWeight: '500',
    marginLeft: 10,
  },
  displayName: {
    left: 10,
    paddingRight: 10,
    fontSize: 10,
    color: 'white',
  },
  timestampSender: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  timestampReceiver: {
    fontSize: 12,
    color: 'white',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  dateContainer: {
    backgroundColor: '#EFE9B5',
    borderRadius: 20,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555555',
    textAlign: 'center',
  },
});
