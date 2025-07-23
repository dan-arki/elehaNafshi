import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EyeOff, Eye } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { triggerLightHaptic, triggerMediumHaptic, triggerErrorHaptic, triggerSuccessHaptic } from '../utils/haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async () => {
    triggerMediumHaptic();
    if (!email || !password) {
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      triggerSuccessHaptic();
      router.replace('/(tabs)');
    } catch (error: any) {
      triggerErrorHaptic();
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    triggerLightHaptic();
    Alert.alert('Mot de passe oublié', 'Un email de récupération sera envoyé à votre adresse.');
  };

  const handleSignUp = async () => {
    triggerMediumHaptic();
    router.push('/register');
  };

  return (
    <ImageBackground
      source={require('../assets/images/bannerViolet.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={{flex: 1}}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.loginCard}>
                <Image
                  source={require('../assets/images/App Icon Vector.png')}
                  style={styles.appIcon}
                  resizeMode="contain"
                />
                
                <Text style={styles.title}>Connecter vous à votre compte</Text>
                <Text style={styles.subtitle}>
                  Entrer votre mail et mot de passe pour vous connecter
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrer votre email"
                    placeholderTextColor={Colors.text.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Entrer votre mot de passe"
                    placeholderTextColor={Colors.text.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => {
                      triggerLightHaptic();
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? (
                      <Eye size={20} color={Colors.text.muted} />
                    ) : (
                      <EyeOff size={20} color={Colors.text.muted} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Vous n'avez pas de compte ? </Text>
                  <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.signUpLink}>S'inscrire</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  passwordInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    color: Colors.primary,
    fontSize: 14,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  appIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
});