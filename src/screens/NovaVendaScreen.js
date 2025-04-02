// src/screens/NovaVendaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { listarProdutos, adicionarItemVenda, atualizarTotalVenda, buscarItensVenda } from '../services/database';

const NovaVendaScreen = ({ route, navigation }) => {
  const { vendaId } = route.params;
  const [pasteis, setPasteis] = useState([]);
  const [itensVenda, setItensVenda] = useState([]);
  const [quantidade, setQuantidade] = useState('1');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [totalVenda, setTotalVenda] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const carregarPasteis = async () => {
    try {
      const result = await listarProdutos();
      setPasteis(result);
    } catch (error) {
      console.error('Erro ao carregar pastéis:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pastéis');
    }
  };

  const carregarItensVenda = async () => {
    try {
      const result = await buscarItensVenda(vendaId);
      setItensVenda(result);
      const total = result.reduce((sum, item) => sum + (item.preco_unitario * item.quantidade), 0);
      setTotalVenda(total);
    } catch (error) {
      console.error('Erro ao carregar itens da venda:', error);
      Alert.alert('Erro', 'Não foi possível carregar os itens da venda');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarItemVendaHandler = async () => {
    if (!produtoSelecionado) {
      Alert.alert('Atenção', 'Selecione um produto primeiro');
      return;
    }

    try {
      await adicionarItemVenda(vendaId, {
        produto_id: produtoSelecionado.id,
        produto_codigo: produtoSelecionado.codigo,
        quantidade: parseInt(quantidade),
        preco_unitario: produtoSelecionado.preco
      });
      await carregarItensVenda();
      setQuantidade('1');
      setProdutoSelecionado(null);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o item à venda');
    }
  };

  const finalizarVenda = async () => {
    try {
      await atualizarTotalVenda(vendaId, totalVenda);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a venda');
    }
  };

  useEffect(() => {
    carregarPasteis();
    carregarItensVenda();
  }, []);

  if (carregando) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={globalStyles.header}>Nova Venda #{vendaId}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Selecionar Pastel</Text>

        <View style={styles.produtosContainer}>
          {pasteis?.map((item) => (
            <TouchableOpacity
              key={item.codigo}
              style={[
                styles.produtoItem,
                produtoSelecionado?.id === item.id && styles.produtoSelecionado
              ]}
              onPress={() => setProdutoSelecionado(item)}
            >
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{item.nome}</Text>
                <Text style={styles.produtoCodigo}>{item.codigo}</Text>
                {item.descricao && (
                  <Text style={styles.produtoDescricao}>{item.descricao}</Text>
                )}
              </View>
              <Text style={styles.produtoPreco}>R$ {item.preco?.toFixed(2) || '0.00'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Adicionar Item</Text>

        <TextInput
          placeholder="Quantidade"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          style={globalStyles.input}
        />

        <TouchableOpacity
          style={[
            globalStyles.buttonPrimary,
            !produtoSelecionado && { opacity: 0.5 }
          ]}
          onPress={adicionarItemVendaHandler}
          disabled={!produtoSelecionado}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color="white" />
          <Text style={globalStyles.buttonText}>Adicionar à Venda</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Itens da Venda</Text>

        {itensVenda.length === 0 ? (
          <Text style={globalStyles.emptyMessage}>Nenhum item adicionado</Text>
        ) : (
          <View style={styles.itensContainer}>
            {itensVenda.map((item) => (
              <View key={item.id.toString()} style={styles.itemVenda}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantidade}>{item.quantidade}x</Text>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemPreco}>R$ {item.preco_unitario.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[globalStyles.card, styles.totalSection]}>
        <Text style={styles.totalLabel}>Total da Venda:</Text>
        <Text style={styles.totalValue}>R$ {totalVenda.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[
          globalStyles.buttonPrimary,
          itensVenda.length === 0 && { opacity: 0.5 }
        ]}
        onPress={finalizarVenda}
        disabled={itensVenda.length === 0}
      >
        <MaterialIcons name="check-circle" size={24} color="white" />
        <Text style={globalStyles.buttonText}>Finalizar Venda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  produtoSelecionado: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5F5',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  produtoCodigo: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
  },
  produtoDescricao: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 4,
  },
  produtoPreco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 10,
  },
  produtosList: {
    maxHeight: 200,
  },
  itemVenda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantidade: {
    fontWeight: 'bold',
    marginRight: 10,
    color: colors.primary,
  },
  itemNome: {
    flex: 1,
  },
  itemPreco: {
    marginLeft: 10,
    color: colors.textDark,
    opacity: 0.7,
  },
  itemSubtotal: {
    fontWeight: 'bold',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default NovaVendaScreen;