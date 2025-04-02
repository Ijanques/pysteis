// src/screens/CategoriasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { listarCategorias, adicionarCategoria, atualizarCategoria, removerCategoria } from '../services/database';

const CategoriasScreen = ({ navigation }) => {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarCategorias = async () => {
    setCarregando(true);
    try {
      const result = await listarCategorias();
      setCategorias(result);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setCarregando(false);
    }
  };

  const salvarCategoria = async () => {
    if (!nome) {
      Alert.alert('Atenção', 'Informe o nome da categoria');
      return;
    }

    try {
      if (editando) {
        await atualizarCategoria(editando.id, nome);
        Alert.alert('Sucesso', 'Categoria atualizada!');
      } else {
        await adicionarCategoria(nome);
        Alert.alert('Sucesso', 'Categoria adicionada!');
      }
      setNome('');
      setEditando(null);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a categoria');
    }
  };

  const editarCategoria = (categoria) => {
    setEditando(categoria);
    setNome(categoria.nome);
  };

  const deletarCategoria = async (id) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          onPress: async () => {
            try {
              await removerCategoria(id);
              await carregarCategorias();
              Alert.alert('Sucesso', 'Categoria removida!');
            } catch (error) {
              console.error('Erro ao remover categoria:', error);
              Alert.alert('Erro', 'Não foi possível remover a categoria, pois existem pasteis vinculados a ela');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarCategorias);
    return unsubscribe;
  }, [navigation]);

  if (carregando && categorias.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Categorias de Pastéis</Text>

      <View style={globalStyles.card}>
        <TextInput
          placeholder="Nome da categoria"
          value={nome}
          onChangeText={setNome}
          style={globalStyles.input}
        />
        
        <TouchableOpacity 
          style={[
            globalStyles.buttonPrimary,
            editando && { backgroundColor: colors.secondary }
          ]} 
          onPress={salvarCategoria}
        >
          <MaterialIcons 
            name={editando ? "save" : "add"} 
            size={24} 
            color="white" 
          />
          <Text style={globalStyles.buttonText}>
            {editando ? 'Atualizar Categoria' : 'Adicionar Categoria'}
          </Text>
        </TouchableOpacity>
      </View>

      {categorias.length === 0 ? (
        <Text style={globalStyles.emptyMessage}>Nenhuma categoria cadastrada</Text>
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[globalStyles.card, styles.categoryCard]}>
              <Text style={styles.categoryName}>{item.nome}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                  onPress={() => editarCategoria(item)}
                >
                  <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.danger }]}
                  onPress={() => deletarCategoria(item.id)}
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  categoryName: {
    fontSize: 16,
    color: colors.textDark,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
});

export default CategoriasScreen;