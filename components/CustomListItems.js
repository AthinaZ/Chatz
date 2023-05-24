import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, ListItem } from '@rneui/themed';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const CustomListItem = ({ id, chatName, enterChat }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
      const unsubscribe = onSnapshot(
        query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'desc')),
        (snapshot) =>
          setMessages(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      );
      return unsubscribe;
  }, []);

  return (
    <ListItem key={id} onPress={() => enterChat(id, chatName)} bottomDivider>
      <Avatar
        rounded
        source={{
          uri:
            messages?.[0]?.photoURL ||
            'https://cdn.pixabay.com/photo/2017/02/23/13/05/avatar-2092113_960_720.png',
        }}
      />
      <ListItem.Content>
        <ListItem.Title style={{ fontWeight: '700' }}>{chatName}</ListItem.Title>
        <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
          {messages[0] ? messages?.[0]?.displayName + ': ' + messages?.[0]?.message : 'Start chatting, say hi to everyone!'}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default CustomListItem;

const styles = StyleSheet.create({})
