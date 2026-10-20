import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Whee",
  slug: "whee",
  version: "0.0.1",
  scheme: "whee",
  icon: "./assets/brand/app-icon.png",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.whee.app"
  },
  android: {
    package: "com.whee.app"
  },
  web: {
    bundler: "metro",
    output: "server",
    favicon: "./assets/brand/app-icon.png"
  },
  plugins: [
    "expo-font",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/brand/whee-logo.png",
        imageWidth: 280,
        resizeMode: "contain",
        backgroundColor: "#FFFFFF"
      }
    ],
    "expo-status-bar"
  ]
});
