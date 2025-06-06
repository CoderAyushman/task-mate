import { auth, db } from "@/firebaseConfig";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
<Ionicons name="log-out" size={24} color="black" />;

const Settings = () => {
  const router = useRouter();
  const [user, setUser] = useState<string>("");
  useEffect(() => {
    getUser();
  }, []);
  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) setUser(user);
    console.log(user);
  };
  const changePassword = () => {
    try {
      const email: any = auth.currentUser?.email;
      console.log(email);
      sendPasswordResetEmail(auth, email)
        .then(() => {
          ToastAndroid.showWithGravity(
            `Password reset email sent to ${email}`,
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          // ..
        });
    } catch (error) {
      console.log(error);
    }
  };
  const DeleteAllData = async () => {
    try {
      console.log("Clear Pressed");
      const userUid: any = auth.currentUser?.uid;
      console.log(userUid);
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, {
        tasks:[]
      })
        .then(() => {
          ToastAndroid.showWithGravity(
            `All Data Clear Successfully`,
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const clearData = () =>
    Alert.alert(
      "Clear All Data",
      "This action will permanently delete all your data from our database, including all your tasks. This process is irreversible.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "CLEAR",
          onPress: () => {
            DeleteAllData();
          },
        },
      ]
    );

  const LogOut = () =>
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "LogOut",
        onPress: async () => {
          try {
            console.log("OK Pressed");
            AsyncStorage.removeItem("user");
            auth.signOut().then(() => {
              console.log("Signed Out");
              ToastAndroid.showWithGravity(
                `Log Out Successfully`,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
              router.replace("/(auth)/LoginScreen");
            });
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="user-circle" size={100} color="#D9D9D9" />
        <Text style={styles.userEmail}>{user}</Text>
      </View>
      <Text style={styles.text}>Profile</Text>
      <Pressable style={styles.properties} onPress={changePassword}>
        <FontAwesome5
          style={styles.propertiesIconKey}
          name="key"
          size={24}
          color="white"
        />
        <Text style={styles.propertiesText}>Change Password</Text>
        <AntDesign
          style={styles.propertiesIconRight}
          name="right"
          size={24}
          color="black"
        />
      </Pressable>
      <Pressable style={styles.properties} onPress={clearData}>
        <Entypo
          style={styles.propertiesIconDatabase}
          name="database"
          size={24}
          color="white"
        />
        <Text style={styles.propertiesText}>Clear all Data</Text>
        <AntDesign
          style={styles.propertiesIconRight}
          name="right"
          size={24}
          color="black"
        />
      </Pressable>
      <Text style={styles.text}>Regional</Text>
      <Pressable style={styles.properties} onPress={LogOut}>
        <Ionicons
          style={styles.propertiesIconLogout}
          name="log-out"
          size={24}
          color="white"
        />
        <Text style={styles.propertiesText}>Log Out</Text>
        <AntDesign
          style={styles.propertiesIconRight}
          name="right"
          size={24}
          color="black"
        />
      </Pressable>
      <Text style={styles.version}>App Version: 1.0.0</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    // justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  userEmail: {
    fontWeight: "bold",
    paddingBlock: 5,
    paddingInline: 10,
    backgroundColor: "#D9D9D9",
    marginTop: 10,
    borderRadius: 10,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 50,
  },
  text: {
    alignSelf: "flex-start",
    marginLeft: 20,
    fontWeight: "black",
    fontSize: 20,
    color: "gray",
    marginTop: 50,
  },
  properties: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent:'space-evenly',
    marginTop: 30,
    width: "90%",
    backgroundColor: "#D9D9D9",
    paddingBlock: 5,
    borderRadius: 10,
  },
  propertiesText: {
    paddingRight: 50,
    fontWeight: "bold",
    fontSize: 17,
    marginRight: "auto",
  },
  propertiesIconKey: {
    padding: 10,
    backgroundColor: "darkorange",
    borderRadius: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  propertiesIconDatabase: {
    padding: 10,
    backgroundColor: "darkblue",
    borderRadius: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  propertiesIconLogout: {
    padding: 10,
    backgroundColor: "green",
    borderRadius: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  propertiesIconRight: {
    marginRight: 20,
  },
  version: {
    marginTop: 50,
    color: "gray",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 50,
    textAlign: "center",
    paddingBlock: 10,
  },
});

export default Settings;
