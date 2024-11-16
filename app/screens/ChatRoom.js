import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ref, onValue, push, serverTimestamp, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const database = getDatabase();

export default function ChatRoom({ route }) {
  const { chatRoomId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const auth = getAuth();
  const flatListRef = useRef(null);

  useEffect(() => {
    const chatRoomMessagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);

    const unsubscribe = onValue(chatRoomMessagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messagesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setMessages(messagesArray);
      }
    });

    // Detect keyboard visibility
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    // Clean up listeners
    return () => {
      unsubscribe();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [chatRoomId]);

  useEffect(() => {
    // Scroll to the bottom of the chat list when a new message is added
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (messageText.trim() === "") return;

    const chatRoomMessagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
    await push(chatRoomMessagesRef, {
      text: messageText,
      sender: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setMessageText("");
  };

  const clearChat = () => {
    const chatRoomMessagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
    
    // Delete all messages in this chat room
    remove(chatRoomMessagesRef)
      .then(() => {
        Alert.alert("Success", "Chat cleared successfully!");
      })
      .catch((error) => {
        console.error("Error clearing chat:", error);
        Alert.alert("Error", "Could not clear chat. Please try again.");
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Text style={styles.header}>Chat with {otherUserName}</Text>

          {/* FlatList to render messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text
                style={[
                  styles.message,
                  item.sender === auth.currentUser.uid ? styles.sent : styles.received,
                ]}
              >
                {item.text}
              </Text>
            )}
            contentContainerStyle={{
              paddingBottom: keyboardVisible ? 150 : 80, // Adjust content bottom when keyboard is visible
            }}
            keyboardShouldPersistTaps="handled"
          />

          {/* Message Input Field and Send Button */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Clear Chat Button */}
          <TouchableOpacity
            onPress={clearChat}
            style={styles.clearChatButton}
          >
            <Text style={styles.clearChatButtonText}>Clear Chat</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "flex-end",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10, // Optional for some space between messages and input
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  sent: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  received: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
  },
  clearChatButton: {
    backgroundColor: "#FF6347", // Red color for "Clear Chat" button
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "center",
  },
  clearChatButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
