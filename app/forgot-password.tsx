import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { triggerLightHaptic, triggerMediumHaptic, triggerErrorHaptic, triggerSuccessHaptic } from '../utils/haptics';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    triggerMediumHaptic();
    if (!email) {
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      triggerSuccessHaptic();
      setEmailSent(true);
    } catch (error: any) {
      triggerErrorHaptic();
      let errorMessage = 'Une erreur est survenue lors de l\'envoi de l\'email de récupération';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte n\'est associé à cette adresse email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    triggerLightHaptic();
    router.back();
  };

  const handleResendEmail = () => {
    setEmailSent(false);
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
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBackToLogin}
              >
                <ChevronLeft size={24} color={Colors.white} />
              </TouchableOpacity>

              <View style={styles.resetCard}>
                <Image
                  source={require('../assets/images/App Icon Vector.png')}
                  style={styles.appIcon}
                  resizeMode="contain"
                />
                
                {!emailSent ? (
                  <>
                    <Text style={styles.title}>Mot de passe oublié ?</Text>
                    <Text style={styles.subtitle}>
                      Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
                    </Text>

                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Mail size={20} color={Colors.text.muted} style={styles.inputIcon} />
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
                    </View>

                    <TouchableOpacity 
                      style={styles.resetButton} 
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      <Text style={styles.resetButtonText}>
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien de récupération'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                      <Text style={styles.loginText}>Vous avez retrouvé votre mot de passe ? </Text>
                      <TouchableOpacity onPress={handleBackToLogin}>
                        <Text style={styles.loginLink}>Se connecter</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.successIconContainer}>
                      <Mail size={60} color={Colors.primary} />
                    </View>
                    
                    <Text style={styles.title}>Email envoyé !</Text>
                    <Text style={styles.subtitle}>
                      Nous avons envoyé un email de récupération à {email}. Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.
                    </Text>

                    <TouchableOpacity 
                      style={styles.resetButton} 
                      onPress={handleBackToLogin}
                    >
                      <Text style={styles.resetButtonText}>
                        Retour à la page de connexion
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleResendEmail}>
                      <Text style={styles.resendLink}>Renvoyer l'email</Text>
                    </TouchableOpacity>
                  </>
                )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  resetCard: {
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
  appIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.text.muted,
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 16,
  },
});