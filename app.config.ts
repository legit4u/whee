import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Whee",
  slug: "whee",
  version: "0.0.1",
  scheme: "whee",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: "com.whee.app"
  },
  android: {
    package: "com.whee.app"
  },
  web: {
    bundler: "metro",
    output: "server"
  },
  plugins: []
});
