import { StyleSheet, View, Text, StatusBar } from "react-native";

export default function TabTwoScreen() {
  return (
    <View style={styles.mainContainer}>
      <Text>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: StatusBar.currentHeight,
  },
});
