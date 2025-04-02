// src/screens/ProdutosScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { listarProdutos, adicionarProduto, atualizarProduto, removerProduto, listarCategorias } from '../services/database';

const ProdutosScreen = ({ navigation }) => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [produtosData, categoriasData] = await Promise.all([
        listarProdutos(),
        listarCategorias()
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setCodigo('');
    setNome('');
    setDescricao('');
    setPreco('');
    setCategoriaId('');
    setEditando(null);
  };

  const validarCampos = () => {
    if (!codigo || !nome || !preco) {
      Alert.alert('Atenção', 'Preencha código, nome e preço!');
      return false;
    }
    if (isNaN(parseFloat(preco))) {
      Alert.alert('Atenção', 'Preço deve ser um valor numérico!');
      return false;
    }
    return true;
  };

  const salvarProduto = async () => {
    if (!validarCampos()) return;

    try {
      const produto = {
        codigo,
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria_id: categoriaId || null
      };

      if (editando) {
        await atualizarProduto(editando.id, produto);
        Alert.alert('Sucesso', 'Pastel atualizado com sucesso!');
      } else {
        await adicionarProduto(produto);
        Alert.alert('Sucesso', 'Pastel adicionado com sucesso!');
      }

      limparFormulario();
      await carregarDados();
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      const mensagem = error.message.includes('UNIQUE') 
        ? 'Já existe um produto com este código' 
        : 'Erro ao salvar o produto';
      Alert.alert('Erro', mensagem);
    }
  };

  const editarProduto = (produto) => {
    setEditando(produto);
    setCodigo(produto.codigo);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setPreco(produto.preco.toString());
    setCategoriaId(produto.categoria_id || '');
    setModalVisible(true);
  };

  const confirmarRemocao = (id) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover este pastel?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', onPress: () => removerProdutoHandler(id) }
      ]
    );
  };

  const removerProdutoHandler = async (id) => {
    try {
      await removerProduto(id);
      await carregarDados();
      Alert.alert('Sucesso', 'Pastel removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      Alert.alert(
        'Atenção',
        error.message.includes('associado') 
          ? 'Não é possível remover pastéis vinculados a vendas'
          : 'Não foi possível remover o pastel'
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarDados);
    return unsubscribe;
  }, [navigation]);

  if (carregando && produtos.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando pastéis...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Cardápio de Pastéis</Text>

      <TouchableOpacity
        style={globalStyles.buttonPrimary}
        onPress={() => {
          limparFormulario();
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={globalStyles.buttonText}>Novo Pastel</Text>
      </TouchableOpacity>

      {produtos.length === 0 ? (
        <Text style={globalStyles.emptyMessage}>Nenhum pastel cadastrado</Text>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[globalStyles.card, styles.produtoCard]}>
              <View style={styles.produtoHeader}>
                <Text style={styles.produtoCodigo}>{item.codigo}</Text>
                <Text style={styles.produtoNome}>{item.nome}</Text>
                <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
              </View>
              
              {item.descricao && (
                <Text style={styles.produtoDescricao}>{item.descricao}</Text>
              )}

              {item.categoria_nome && (
                <View style={styles.categoriaContainer}>
                  <MaterialIcons name="category" size={16} color={colors.secondary} />
                  <Text style={styles.categoriaText}>{item.categoria_nome}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                  onPress={() => editarProduto(item)}
                >
                  <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.danger }]}
                  onPress={() => confirmarRemocao(item.id)}
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal de Edição/Adição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar Pastel' : 'Novo Pastel'}
            </Text>

            <TextInput
              placeholder="Código (ex: P001)"
              value={codigo}
              onChangeText={setCodigo}
              style={globalStyles.input}
              maxLength={10}
            />
            
            <TextInput
              placeholder="Nome do Pastel"
              value={nome}
              onChangeText={setNome}
              style={globalStyles.input}
            />
            
            <TextInput
              placeholder="Descrição (opcional)"
              value={descricao}
              onChangeText={setDescricao}
              style={globalStyles.input}
              multiline
            />
            
            <TextInput
              placeholder="Preço (ex: 8.50)"
              value={preco}
              onChangeText={setPreco}
              style={globalStyles.input}
              keyboardType="numeric"
            />

            <Picker
              selectedValue={categoriaId}
              onValueChange={(itemValue) => setCategoriaId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Sem categoria" value="" />
              {categorias.map(cat => (
                <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  limparFormulario();
                  setModalVisible(false);
                }}
              >
                <Text style={globalStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarProduto}
              >
                <Text style={globalStyles.buttonText}>
                  {editando ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  produtoCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoCodigo: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    flex: 1,
    marginHorizontal: 10,
  },
  produtoPreco: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  produtoDescricao: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.8,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoriaText: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.warning,
  },
});

export default ProdutosScreen;