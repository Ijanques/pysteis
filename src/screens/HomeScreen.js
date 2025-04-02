import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import backgroundImage from '../assets/background.png';
import logo from '../assets/logo.png';

const HomeScreen = ({ navigation }) => {
  const menuItems = [
    { 
      label: 'Gerenciar Pastéis', 
      screen: 'Produtos', 
      icon: 'restaurant', 
      color: colors.primary,
      textColor: colors.textLight
    },
    { 
      label: 'Gerenciar Categorias', 
      screen: 'Categorias', 
      icon: 'category', 
      color: colors.secondary,
      textColor: colors.textDark
    },
    { 
      label: 'Realizar Vendas', 
      screen: 'Vendas', 
      icon: 'shopping-cart', 
      color: colors.accent,
      textColor: colors.textDark
    },
    { 
      label: 'Relatórios', 
      screen: 'Relatorios', 
      icon: 'assessment', 
      color: colors.info,
      textColor: colors.textLight
    }
  ];

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode= "cover"
    >
      
      <View style={styles.overlay}>
        <Image source={logo} style={styles.logo} />
        
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.menuButton, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <MaterialIcons name={item.icon} size={24} color={item.textColor} />
            <Text style={[styles.buttonText, { color: item.textColor }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
};
console.log(backgroundImage);
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center', 
    padding: 30,
  },
  logo: {
    width: 400,
    height: 400,
    marginBottom: 1,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 40,
    fontFamily: 'sans-serif-condensed',
  },
  menuButton: {
    borderRadius: 25,
    padding: 18,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default HomeScreen;