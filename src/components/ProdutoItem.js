// src/components/ProdutoItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

const ProdutoItem = ({ item, onRemover }) => {
  const confirmarRemocao = () => {
    Alert.alert(
      'Confirmar',
      `Deseja realmente remover o pastel ${item.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', onPress: () => onRemover(item.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.codigo}>{item.codigo}</Text>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.nome}>{item.nome}</Text>
        
        {item.descricao && (
          <Text style={styles.descricao}>{item.descricao}</Text>
        )}
        
        {item.categoria_nome && (
          <View style={styles.categoriaContainer}>
            <MaterialIcons name="category" size={16} color={colors.secondary} />
            <Text style={styles.categoria}>{item.categoria_nome}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.botaoRemover} 
        onPress={confirmarRemocao}
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  codigo: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  descricao: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.8,
    marginBottom: 8,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoria: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
    marginLeft: 5,
  },
  botaoRemover: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default ProdutoItem;