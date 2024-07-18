import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  TextInput,
  Button,
  useColorScheme,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings({ navigation }: { navigation: any }) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "white" : "black";
  const tabBarHeight = useBottomTabBarHeight();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSetPin = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert("PIN must be 4 digits long");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("PINs do not match");
      return;
    }

    try {
      await AsyncStorage.setItem("appPin", pin);
      navigation.replace("Home"); // Replace with your home screen route
    } catch (error) {
      Alert.alert("Failed to save PIN");
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingBottom: tabBarHeight }]}>
      <Text style={[styles.title, { color: textColor }]}>Set Your PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        onChangeText={setPin}
        value={pin}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        onChangeText={setConfirmPin}
        value={confirmPin}
      />
      <Button title="Set PIN" onPress={handleSetPin} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 18,
  },
});
