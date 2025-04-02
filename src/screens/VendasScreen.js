// src/screens/VendasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { listarVendas, criarVenda } from '../services/database';
import VendaItem from '../components/VendaItem';

const VendasScreen = ({ navigation }) => {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarVendas = async () => {
    setCarregando(true);
    try {
      const result = await listarVendas();
      setVendas(result);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as vendas');
    } finally {
      setCarregando(false);
    }
  };

  const novaVenda = async () => {
    try {
      const vendaId = await criarVenda();
      navigation.navigate('NovaVenda', { vendaId });
    } catch (error) {
      console.error('Erro ao criar nova venda:', error);
      Alert.alert('Erro', 'Não foi possível criar nova venda');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarVendas);
    return unsubscribe;
  }, [navigation]);

  if (carregando && vendas.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando vendas...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Histórico de Vendas</Text>

      <TouchableOpacity
        style={globalStyles.buttonPrimary}
        onPress={novaVenda}
      >
        <MaterialIcons name="add-shopping-cart" size={24} color="white" />
        <Text style={globalStyles.buttonText}>Nova Venda</Text>
      </TouchableOpacity>

      {vendas.length === 0 ? (
        <Text style={globalStyles.emptyMessage}>Nenhuma venda registrada</Text>
      ) : (
        <FlatList
          data={vendas}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <VendaItem 
              item={item} 
              onPress={() => navigation.navigate('DetalhesVenda', { vendaId: item.id })} 
            />
          )}
        />
      )}
    </View>
  );
};

export default VendasScreen;