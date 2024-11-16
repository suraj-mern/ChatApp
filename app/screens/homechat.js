import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, get, set, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

const db = getDatabase();

export default function HomeChat() {
  const navigation = useNavigation();
  const { setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessages, setNewMessages] = useState({});

  const generateChatRoomId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  // Fetch users from database
  const fetchUsers = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user is signed in.");
      return;
    }

    try {
      const allUsersRef = ref(db, 'users');
      const snapshot = await get(allUsersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const filteredUsers = Object.entries(usersData)
          .filter(([uid, userData]) => uid !== currentUser.uid)
          .map(([uid, userData]) => ({
            uid,
            ...userData,
          }));

        setUsers(filteredUsers);

        // Check for the latest messages and new messages for each user
        filteredUsers.forEach(user => {
          const chatRoomId = generateChatRoomId(currentUser.uid, user.uid);
          const chatRoomRef = ref(db, `chatRooms/${chatRoomId}/messages`);

          onValue(chatRoomRef, (snapshot) => {
            if (snapshot.exists()) {
              const messages = snapshot.val();
              const lastMessage = Object.entries(messages).sort((a, b) => b[1].timestamp - a[1].timestamp)[0]; // Get the last message

              if (lastMessage && lastMessage[1].sender !== currentUser.uid) {
                // A new message from another user
                setNewMessages(prev => ({
                  ...prev,
                  [chatRoomId]: true,
                }));

                // Send notification about new message
                sendPushNotification(user, lastMessage[1]);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleUserClick = async (selectedUser) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user is signed in.");
      return;
    }

    const chatRoomId = generateChatRoomId(currentUser.uid, selectedUser.uid);
    const chatRoomRef = ref(db, `chatRooms/${chatRoomId}`);

    try {
      const snapshot = await get(chatRoomRef);

      if (!snapshot.exists()) {
        await set(chatRoomRef, {
          users: {
            [currentUser.uid]: true,
            [selectedUser.uid]: true,
          },
          messages: {},
        });
      }

      // Reset the new message flag for this chat
      setNewMessages(prev => ({ ...prev, [chatRoomId]: false }));

      navigation.navigate('ChatRoom', {
        chatRoomId,
        otherUserName: selectedUser.name,
        otherUserId: selectedUser.uid,
      });
    } catch (error) {
      console.error("Error handling user click: ", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate('login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const sendPushNotification = async (user, message) => {
    // Get the Expo push token for the user
    const pushToken = user.expoPushToken;

    if (pushToken) {
      const messageContent = {
        to: pushToken,
        sound: 'default',
        title: `New message from ${message.senderName}`, // Customize this based on your data
        body: message.text,
        data: {
          chatRoomId: message.chatRoomId,
          otherUserName: user.name,
        },
      };

      try {
        await Notifications.scheduleNotificationAsync({
          content: messageContent,
          trigger: null, // Immediately trigger the notification
        });
        console.log("Notification sent!");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="bg-white">
        <View className="flex-row justify-between items-center bg-blue-400" style={{ height: 60 }}>
          <Text className="text-lg font-bold">Your Name</Text>
          <TouchableOpacity className="absolute top-3 right-0 p-2" onPress={handleLogout}>
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.header}>All Users</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => {
            const chatRoomId = generateChatRoomId(getAuth().currentUser.uid, item.uid);
            return (
              <View style={styles.userCard}>
                <TouchableOpacity onPress={() => handleUserClick(item)}>
                  <View style={styles.userRow}>
                    <Text style={styles.userText}>Name: {item.name}</Text>
                    {/* Show new message indicator */}
                    {newMessages[chatRoomId] && (
                      <View style={styles.newMessageToken}></View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  newMessageToken: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});
