import {
  Button,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Note = {
  id: number;
  title: string;
  description: string;
};

export default function Note() {
  const tabBarHeight = useBottomTabBarHeight();

  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      const storedNotes = await AsyncStorage.getItem("notes");
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    };
    loadNotes();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Both title and description are required.");
      return;
    }

    const newNote: Note = {
      id: currentNote ? currentNote.id : Date.now(),
      title,
      description,
    };

    let updatedNotes;
    if (currentNote) {
      updatedNotes = notes.map((note) =>
        note.id === currentNote.id ? newNote : note
      );
    } else {
      updatedNotes = [...notes, newNote];
    }

    setNotes(updatedNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
    setModalVisible(false);
    setTitle("");
    setDescription("");
    setCurrentNote(null);
  };

  const handleDelete = async (id: number) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const handleEdit = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setDescription(note.description);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setCurrentNote(null);
    setTitle("");
    setDescription("");
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={styles.noteItem} onPress={() => handleEdit(item)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainContainer, { paddingBottom: tabBarHeight }]}>
      <Button title="Add Note" onPress={openAddModal} />
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {currentNote ? "Edit Note" : "Add Note"}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            style={[styles.input, styles.textArea]}
            multiline
          />
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleSave} />
            {currentNote && (
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(currentNote.id)}
              />
            )}
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: StatusBar.currentHeight,
  },
  noteItem: {
    padding: 15,
    backgroundColor: "#87cefa",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 5,
    marginVertical: 5,
  },
  noteTitle: {
    fontSize: 18,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: "100%",
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
