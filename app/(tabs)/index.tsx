import { StyleSheet, View, Text, StatusBar } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.mainContainer}>
      <Text>Strona główna</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: StatusBar.currentHeight,
  },
});
