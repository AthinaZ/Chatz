import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { Button, Input } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from '../firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AddChatScreen = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userList, setUserList] = useState([]);

  const handleUserSelection = (user) => {
    if (isGroupChat) {
      if (selectedUsers.includes(user)) {
        setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser !== user));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      setSelectedUser(user);
    }
  };

  const createChat = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      // Handle the case where the current user is not authenticated
      return;
    }

    if (isGroupChat) {
      const selectedUserIds = selectedUsers.map(user => user.id);
      const chatData = {
        chatName: input,
        isGroupChat: true,
        participants: [
          { userId: currentUser.uid, isCreator: true }, // Creator
          ...selectedUserIds.map(userId => ({ userId, isCreator: false })) // Other users
        ]
      };
      await addDoc(collection(db, 'chats'), chatData);
    } else {
      if (selectedUser) {
        const chatData = {
          chatName: input,
          isGroupChat: false,
          participants: [
            { userId: currentUser.uid, isCreator: true }, // Creator
            { userId: selectedUser.id, isCreator: false } // Other user
          ]
        };
        await addDoc(collection(db, 'chats'), chatData);
      } else {
        alert('Please select a user for the one-on-one chat.');
        return;
      }
    }

    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add a new Chat',
      headerBackTitle: 'Chats',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const fetchedUsers = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.id !== auth.currentUser.uid); // Exclude the current user from the list

        setUserList(fetchedUsers);
      } catch (error) {
        console.error('Error fetching user list:', error);
        // Handle the error appropriately
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchUsers();
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Handle the error appropriately
        }
      }
    });

    return unsubscribe;
  }, []);

  const renderUserListItem = ({ item }) => (
    <TouchableOpacity
      style={isGroupChat ? (
        selectedUsers.includes(item) ? styles.selectedUserItem : styles.userItem
      ) : (
        selectedUser === item ? styles.selectedUserItem : styles.userItem
      )}
      onPress={() => handleUserSelection(item)}
    >
      <Text style={styles.userItemText}>{item.displayName}</Text>
      {(isGroupChat ? selectedUsers : [selectedUser]).includes(item) && (
        <Icon name="check" type="font-awesome" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Input
        placeholder="Enter a chat name"
        style={{ marginLeft: 10 }}
        value={input}
        onChangeText={(text) => setInput(text)}
        onSubmitEditing={createChat}
        leftIcon={<Icon name={isGroupChat ? 'users' : 'user'} size={24} color="black" type="font-awesome" />}
      />

      <View style={styles.toggleContainer}>
        <Button
          buttonStyle={isGroupChat ? styles.activeButton : styles.inactiveButton}
          titleStyle={isGroupChat ? styles.activeButtonText : styles.inactiveButtonText}
          onPress={() => setIsGroupChat(true)}
          title="Group Chat"
        />

        <Button
          buttonStyle={!isGroupChat ? styles.activeButton : styles.inactiveButton}
          titleStyle={!isGroupChat ? styles.activeButtonText : styles.inactiveButtonText}
          onPress={() => setIsGroupChat(false)}
          title="1-on-1 Chat"
        />
      </View>

      <View style={styles.userListContainer}>
        <Text style={styles.userListHeaderText}>Select from the following users:</Text>
        {userList.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.userList}
            data={userList}
            renderItem={renderUserListItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text style={styles.noUsersText}>No users found.</Text>
        )}
      </View>

      <Button
        disabled={!input}
        buttonStyle={{ backgroundColor: '#CE278C' }}
        titleStyle={{ fontWeight: 'bold' }}
        onPress={createChat}
        title="Create new Chat"
      />
    </View>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  activeButton: {
    backgroundColor: '#CE278C',
    marginHorizontal: 10,
  },
  inactiveButton: {
    backgroundColor: 'gray',
    marginHorizontal: 10,
  },
  activeButtonText: {
    fontWeight: 'bold',
    color: 'white',
  },
  inactiveButtonText: {
    color: 'white',
  },
  inactiveButtonText: {
    color: 'black',
  },
  userListContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  userListHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userList: {
    flexGrow: 1,
  },
  noUsersText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  selectUserText: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  userItemText: {
    flex: 1,
    marginLeft: 10,
    color: 'black',
  },
});



