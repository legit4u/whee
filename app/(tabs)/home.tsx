import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width - 56, 420, (height - 100) * (1080 / 1440));

  return (
    <View style={styles.screen}>
      <View style={styles.brand}>
        <Image
          source={require("../../assets/brand/whee-logo.png")}
          style={[styles.logo, { width: logoWidth, height: logoWidth * (1440 / 1080) }]}
          resizeMode="contain"
          accessibilityLabel="Whee logo"
        />
        <Text style={styles.tagline}>Everyday prices, made clearer.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28
  },
  brand: {
    alignItems: "center"
  },
  logo: {
    maxWidth: "100%"
  },
  tagline: {
    color: "#B21B27",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18
  }
});
