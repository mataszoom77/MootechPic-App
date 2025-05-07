import React, { useState, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/LogInAssets/logo";
import CheckMark from "../assets/LogInAssets/checkMark";
import Vector from "../assets/LogInAssets/box";
import GoogleLogo from "../assets/LogInAssets/google";
import api from "../api";   // Axios instance

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleRememberMeToggle = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setIsChecked((prev) => !prev);
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.elastic(1.5) }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });
      await login({ email, password });  // Use context to store token
    } catch (err) {
      Alert.alert("Login Failed", "Invalid credentials");
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Logo style={styles.logo} />
        <Text style={styles.title}>MOOTECH PIC</Text>

        <View style={styles.formWrapper}>
          <Text style={styles.header}>Log in</Text>

          <View style={styles.formContainer}>
            <TextInput
              placeholder="email@domain.com"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor = "#111"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor = "#111"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />

            <Pressable style={styles.rememberRow} onPress={handleRememberMeToggle}>
              <Animated.View style={[styles.checkboxIcon, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                {isChecked ? <CheckMark width={24} height={24} /> : <Vector width={24} height={24} />}
              </Animated.View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By clicking continue, you agree to our Terms of Service and Privacy Policy
          </Text>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 94,
    height: 50,
    marginTop: 86,
    alignSelf: "center",
  },
  title: {
    color: "#ADC81B",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  formWrapper: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ADC81B",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "85%",
    alignSelf: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFDFDF",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#000",
    marginBottom: 16,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxIcon: {
    marginRight: 8,
  },
  rememberText: {
    color: "#ADC81B",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "85%",
    alignSelf: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ADC81B80",
  },
  orText: {
    marginHorizontal: 10,
    color: "#ADC81B",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    marginVertical: 16,
    marginHorizontal: 24,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 12,
    color: "#000",
  },
  registerLink: {
    fontSize: 12,
    color: "#91A61D",
    fontWeight: "bold",
    marginLeft: 6,
  },
});
