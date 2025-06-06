import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { router } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
export default function LoginScreen() {
  const [islogIn, setIsLogIn] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const linkUidToFirestore = async (uid: string, email: string) => {
    const val = doc(db, "users", uid);
    await setDoc(
      val,
      { uid, email, tasks: [] },
      { merge: true }
    );
  };
  //function for creating a new user
  const onPressSignUp = async () => {
    try {
      const Email=email.trim()
      console.log(Email);
      createUserWithEmailAndPassword(auth, Email, password)
        .then(async (userCredential) => {
          // Signed up
          const user: any = userCredential.user;     
          await linkUidToFirestore(user.uid, user.email);
          ToastAndroid.showWithGravity(
                         `Signed up successfully ${user.email}`,
                         ToastAndroid.LONG,
                         ToastAndroid.CENTER
                       );
          router.push("/(tasks)/Tasks");
          AsyncStorage.setItem("user", user.email);
            console.log(user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          console.log(error);
          if (errorCode === "auth/weak-password") {
            Alert.alert("Alert", "Password should be at least 6 characters");
          } else if (errorCode === "auth/email-already-in-use") {
            Alert.alert("Alert", "Email already in use");
          } else if (errorCode === "auth/invalid-email") {
            Alert.alert("Alert", "Invalid email");
          }
          else if (errorCode === "auth/network-request-failed") {
            Alert.alert("Alert", "Network request failed. Please check your internet connection.");
          } else {
            Alert.alert("Error", errorMessage);
          }
        });
    } catch (error: any) {
      Alert.alert(error);
    }
  };
  // Function to handle login
  const onPressLogIn = () => {
    try {
      const Email=email.trim()
      console.log("Email",Email);
      signInWithEmailAndPassword(auth, Email, password)
        .then(async (userCredential) => {
          // Signed up
          const user: any = userCredential.user;
          await linkUidToFirestore(user.uid,user.email)
           ToastAndroid.showWithGravity(
                          `logged in successfully ${user.email}`,
                          ToastAndroid.LONG,
                          ToastAndroid.CENTER
                        );
          router.push("/(tasks)/Tasks");
          AsyncStorage.setItem("user", user.email);
            console.log(user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === "auth/weak-password") {
            Alert.alert("Alert", "Password should be at least 6 characters");
          } else if (errorCode === "auth/wrong-password") {
            Alert.alert("Alert", "Wrong password");
          } else if (errorCode === "auth/invalid-email") {
            Alert.alert("Alert", "Invalid email");
          } else if (errorCode === "auth/user-not-found") {
            Alert.alert("Alert", "User not found");
          }
          else if (errorCode === "auth/network-request-failed") {
            Alert.alert("Alert", "Network request failed. Please check your internet connection.");
          }
          else {
            Alert.alert("Error", errorMessage);
            
          }
        });
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  //forget password function
  const changePassword = () => {
    try {
      if (email) {
        const auth = getAuth();
        const Email = email.trim();
        sendPasswordResetEmail(auth, Email)
          .then(() => {
            ToastAndroid.showWithGravity(
              `Password reset email sent to ${Email}`,
              ToastAndroid.LONG,
              ToastAndroid.CENTER
            );
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === "auth/user-not-found") {
              Alert.alert("Alert", "User not found");
            } else if (errorCode === "auth/invalid-email") {
              Alert.alert("Alert", "Invalid email");
            } else {
              Alert.alert("Error", errorMessage);
            }
            // ..
          });
      } else {
        Alert.alert("Alert", "Please enter email");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>  
    {islogIn?<Image source={require('../../assets/images/login.jpg')} style={styles.image} />:<Image source={require('../../assets/images/signup.jpg')} style={styles.image} />}    
        
        {islogIn ?<Text style={styles.title}>Welcome back!</Text>:<Text style={styles.title}>Let's get started!</Text>}
      
      <TextInput placeholder="Email address" style={styles.input} onChangeText={setEmail}/>
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword}/>
      {islogIn ? (
        <View style={{width: '80%'}}>

          <Text
            style={{ color: "blue", fontWeight: "bold", alignSelf: "flex-end"}}
            onPress={() => {
              changePassword();
            }}
            >
            Forgot Password?
          </Text>
            </View>
        ):(<View style={{marginTop:20}}></View>)}
      {islogIn ?<TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={onPressLogIn}>Log in</Text>
      </TouchableOpacity>:<TouchableOpacity style={styles.button} onPress={onPressSignUp}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>}
      {islogIn? 
  <View style={styles.havingAccountContainer}><Text style={styles.havingAccountText}>Don't have an account?<Text style={styles.havingAccount} onPress={() => {setIsLogIn(false);console.log("Get started")}}>Get started!</Text></Text></View>
  :
  <View style={styles.havingAccountContainer}><Text style={styles.havingAccountText}>Already have an account?<Text style={styles.havingAccount} onPress={() => {setIsLogIn(true);console.log("login")}}>Log in</Text></Text></View>
  }
  </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '60%',
    height: '30%',
    // resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '80%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 20,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  havingAccount: {
    color: '#6C63FF',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 16,
  },
  havingAccountButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  havingAccountContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  havingAccountText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    // marginBottom: 80,
  },


});

