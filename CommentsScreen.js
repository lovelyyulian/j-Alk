import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';

export default function CommentsScreen({ navigation }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [editCommentId, setEditCommentId] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [username, setUsername] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);

  useEffect(() => {
    const fetchUsernameAndComments = async () => {
      const userId = auth.currentUser?.uid;

      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }

      const unsubscribe = onSnapshot(collection(db, 'comments'), (snapshot) => {
        const commentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      });

      return () => unsubscribe();
    };

    const requestNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          alert('Você precisa permitir notificações para receber atualizações.');
        }
      }
    };

    requestNotificationPermission();
    fetchUsernameAndComments();
  }, []);

  const sendNewCommentNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Novo Comentário!",
        body: "Alguém comentou em sua postagem!",
      },
      trigger: null, // Envia imediatamente
    });
  };

  const handlePublish = async () => {
    if (!comment) return;

    try {
      if (editCommentId) {
        await updateDoc(doc(db, 'comments', editCommentId), {
          text: comment,
          edited: true,
        });
        setEditCommentId(null);
      } else {
        await addDoc(collection(db, 'comments'), {
          text: comment,
          author: username,
          timestamp: new Date(),
          edited: false,
          replyTo: replyToCommentId || null,
        });
        await sendNewCommentNotification();
      }
      setComment('');
      setReplyToCommentId(null);
    } catch (error) {
      alert('Erro ao publicar comentário: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      alert('Erro ao deletar comentário: ' + error.message);
    }
  };

  const initiateEdit = (id, text) => {
    setEditCommentId(id);
    setComment(text);
    setReplyToCommentId(null);
    setSelectedCommentId(null);
  };

  const toggleOptions = (id) => {
    setSelectedCommentId(prevId => (prevId === id ? null : id));
  };

  const dismissOptions = () => {
    setSelectedCommentId(null);
    setReplyToCommentId(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      alert('Erro ao sair: ' + error.message);
    }
  };

  const replyToComment = (comment) => {
    setReplyToCommentId(comment.id);
    setComment(`${comment.author} `);
    setSelectedCommentId(null);
  };

  const sortedComments = [...comments].sort(
    (a, b) => a.timestamp?.toDate() - b.timestamp?.toDate()
  );

  const renderCommentItem = ({ item }) => (
    <View
      style={[
        styles.commentContainer,
        editCommentId === item.id && styles.editingComment,
        replyToCommentId === item.id && styles.replyingComment,
      ]}
    >
      <View style={styles.authorContainer}>
        <Text style={styles.author}>{item.author}</Text>
        {item.edited && (
          <MaterialIcons name="edit" size={16} color="lightgray" style={styles.editedIcon} />
        )}
      </View>
      {item.replyTo && (
        <Text style={styles.replyLabel}>
          Respondendo a {comments.find(c => c.id === item.replyTo)?.author}
        </Text>
      )}
      <TouchableOpacity onPress={() => toggleOptions(item.id)}>
        <Text style={styles.commentText}>{item.text}</Text>
      </TouchableOpacity>
      {item.author !== username && selectedCommentId === item.id && (
        <TouchableOpacity onPress={() => replyToComment(item)}>
          <Text style={styles.replyOption}>Responder</Text>
        </TouchableOpacity>
      )}
      {item.author === username && selectedCommentId === item.id && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={() => initiateEdit(item.id, item.text)}>
            <Text style={styles.option}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.option}>Deletar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissOptions}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />

        <View style={styles.header}>
          <Text style={styles.headerText}>allianceDev_</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedComments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommentItem}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 10}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escreva um comentário..."
              value={comment}
              onChangeText={setComment}
              placeholderTextColor="#aaa"
              keyboardAppearance="dark"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handlePublish}>
              <Text style={styles.sendButtonText}>
                {editCommentId ? 'Atualizar' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'lightgray',
    borderWidth: 1,
    marginRight: 8,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
   },
   commentContainer:{
     marginVertical :8 ,
     padding :12 ,
     borderWidth :1 ,
     borderColor :'lightgray' ,
     borderRadius :5 ,
     backgroundColor :'rgba(255 ,255 ,255 ,0.1)' ,
   },
   editingComment:{
     borderColor :'blue' ,
     backgroundColor :'rgba(255 ,255 ,255 ,0.2)' ,
   },
   replyingComment:{
     borderColor :'orange' ,
     backgroundColor :'rgba(255 ,165 ,0 ,0.1)' ,
   },
   authorContainer:{
     flexDirection :'row' ,
     alignItems :'center' ,
   },
   author:{
     fontWeight :'bold' ,
     marginBottom :4 ,
     color :'#fff' ,
   },
   editedIcon:{
     marginLeft :4 ,
   },
   option:{
     color :'lightblue' ,
     marginTop :4 ,
   },
   replyLabel:{
     color :'gray' ,
     fontSize :12 ,
     marginBottom :4 ,
   },
   replyOption:{
     color :'#007AFF' ,
     marginTop :4 ,
   },
   optionsContainer:{
     flexDirection :'row' ,
     justifyContent :'space-between' ,
     marginTop :4 ,
   },
   commentText:{
     fontSize :16 ,
     color :'#fff' ,
   },
});
