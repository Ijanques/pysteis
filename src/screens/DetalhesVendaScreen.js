// src/screens/DetalhesVendaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { buscarVendaPorId, buscarItensVenda } from '../services/database';

const DetalhesVendaScreen = ({ route }) => {
  const { vendaId } = route.params;
  const [venda, setVenda] = useState(null);
  const [itensVenda, setItensVenda] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [vendaData, itensData] = await Promise.all([
        buscarVendaPorId(vendaId),
        buscarItensVenda(vendaId)
      ]);
      setVenda(vendaData);
      setItensVenda(itensData);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da venda');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [vendaId]);

  if (carregando || !venda) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Detalhes da Venda</Text>

      <View style={globalStyles.card}>
        <View style={styles.infoRow}>
          <MaterialIcons name="receipt" size={24} color={colors.primary} />
          <Text style={styles.infoText}>Número: #{venda.id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="date-range" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Data: {new Date(venda.data).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={globalStyles.sectionTitle}>Itens da Venda</Text>

      {itensVenda.length === 0 ? (
        <Text style={globalStyles.emptyMessage}>Nenhum item nesta venda</Text>
      ) : (
        <FlatList
          data={itensVenda}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[globalStyles.card, styles.itemCard]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemQuantidade}>{item.quantidade}x</Text>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemPreco}>R$ {item.preco_unitario.toFixed(2)}</Text>
              </View>
              
              {item.descricao && (
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
              )}

              <Text style={styles.itemSubtotal}>
                Subtotal: R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}

      <View style={[globalStyles.card, styles.totalCard]}>
        <Text style={styles.totalText}>Total da Venda:</Text>
        <Text style={styles.totalValue}>R$ {venda.total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: colors.textDark,
  },
  itemCard: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemQuantidade: {
    fontWeight: 'bold',
    marginRight: 10,
    color: colors.primary,
  },
  itemNome: {
    flex: 1,
    fontSize: 16,
  },
  itemPreco: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemDescricao: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  itemSubtotal: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default DetalhesVendaScreen;