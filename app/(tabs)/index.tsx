import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

type ProductData = {
  id: string;
  product: string;
  date: string;
  notificationIds: string[];
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [product, setProduct] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [data, setData] = useState<ProductData[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
  };

  const handleSave = async () => {
    if (!product || !date) {
      alert("Product name and date are required.");
      return;
    }

    const notificationIds = await scheduleNotifications(product, date);

    const newProduct: ProductData = {
      id: String(Date.now()),
      product,
      date,
      notificationIds,
    };

    const newData: ProductData[] = [...data, newProduct];
    setData(newData);
    await AsyncStorage.setItem("data", JSON.stringify(newData));
    setProduct("");
    setDate("");
    setModalVisible(false);
  };

  const loadData = async () => {
    const storedData = await AsyncStorage.getItem("data");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  };

  const scheduleNotifications = async (
    productName: string,
    notificationDate: string
  ) => {
    const notificationIds = [];

    const startDate = new Date(notificationDate);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(notificationDate);
    endDate.setHours(23, 59, 59, 999);

    const totalHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    for (let i = 0; i <= totalHours; i += 8) {
      const triggerDate = new Date(startDate);
      triggerDate.setHours(startDate.getHours() + i);

      if (triggerDate > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Product Reminder",
            body: `Reminder for ${productName}`,
          },
          trigger: triggerDate,
        });

        notificationIds.push(notificationId);
      }
    }

    return notificationIds;
  };

  const handleDelete = async (id: string) => {
    const productToDelete = data.find((item) => item.id === id);
    if (productToDelete) {
      for (const notificationId of productToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }

    const filteredData = data.filter((item) => item.id !== id);
    setData(filteredData);
    await AsyncStorage.setItem("data", JSON.stringify(filteredData));
  };

  const handleEdit = async (id: string) => {
    const editedData = data.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          product,
          date,
        };
      }
      return item;
    });

    setData(editedData);
    await AsyncStorage.setItem("data", JSON.stringify(editedData));
    setModalVisible(false);
  };

  const openEditModal = (id: string) => {
    const itemToEdit = data.find((item) => item.id === id);
    if (itemToEdit) {
      setProduct(itemToEdit.product);
      setDate(itemToEdit.date);
      setEditId(id);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setProduct("");
    setDate("");
    setEditId("");
    setModalVisible(false);
  };

  const showAddModal = () => {
    setProduct("");
    setDate("");
    setEditId("");
    setModalVisible(true);
  };

  const textColor = colorScheme === "dark" ? "white" : "black";

  return (
    <View style={styles.mainContainer}>
      <Button title="Add Product" onPress={showAddModal} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: "blue" }}>
              {editId ? "Edit Product" : "Add Product"}
            </Text>
            <TextInput
              value={product}
              onChangeText={setProduct}
              placeholder="Enter product name"
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="Enter date (YYYY-MM-DD)"
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <Button title="Cancel" onPress={closeModal} />
              <Button
                title={editId ? "Save Changes" : "Add"}
                onPress={editId ? () => handleEdit(editId) : handleSave}
              />
            </View>
          </View>
        </View>
      </Modal>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              borderBottomWidth: 1,
            }}
          >
            <View>
              <Text style={{ color: textColor }}>Product: {item.product}</Text>
              <Text style={{ color: textColor }}>Date: {item.date}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => openEditModal(item.id)}
              >
                <Text style={{ color: "blue" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: StatusBar.currentHeight || 0,
  },
});
