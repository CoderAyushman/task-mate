// import { Button } from '@react-navigation/elements';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";
export default function AuthGate ()  {
  const [user, setUser] = useState<any>(null);
 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async(firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        console.log(firebaseUser)
        router.push("/(tasks)/Tasks");
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);
  // const router = router();
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/task1.jpg")}
        style={styles.image}
      />
        <Text style={styles.textFirst}>Get things done.</Text>
        <Text style={styles.textSecond}>
          Just a click away from planning your tasks.
        </Text>
      <Pressable
        onPress={() => router.replace("/(auth)/LoginScreen")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
};

const styles: any = {
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    width: "100%",
    height: "100%",
  },
  textFirst: {
    fontSize: 30,
    textAlign: "center",
    marginTop: 10,
    color: "black",
    fontWeight: "bold",
    width: "80%",
  },
  textSecond: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    color: "gray",
    fontWeight: "500",
    width: "80%",
    marginBottom: 20,
  },
  image: {
    width: "70%",
    height: "30%",
  },

  button: {
    marginTop: 30,
    width: "80%",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
    backgroundColor: "#6C63FF",
    padding: 10,
    borderRadius: 20,
    fontWeight: "bold",
  },
};
