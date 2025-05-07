// RegisterPage.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/LogInAssets/logo";
import Google from "../assets/LogInAssets/google";
import { registerUser } from "../api"; // register helper

const RegisterPage = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // call our new helper
      const { message } = await registerUser(email, password);
      Alert.alert("Success", message, [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      if (__DEV__) {
        console.error("Registration error:", err);
      }
      Alert.alert(
        "Registration Failed",
        err.response?.data || "Server error, try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Logo style={styles.logo} />
        <Text style={styles.title}>MOOTECH PIC</Text>

        <View style={styles.formWrapper}>
          <Text style={styles.header}>Create an account</Text>
          <Text style={styles.subHeader}>
            Enter your email to sign up for this app
          </Text>

          <View style={styles.formContainer}>
            <TextInput
              placeholder="email@domain.com"
              value={email}
              placeholderTextColor="#111"
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#111"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#111"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy
          </Text>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.registerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterPage;

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
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 14,
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
    marginBottom: 20,
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
