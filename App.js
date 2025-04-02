// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { initDB } from './src/services/database';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProdutosScreen from './src/screens/ProdutosScreen';
import CategoriasScreen from './src/screens/CategoriasScreen';
import VendasScreen from './src/screens/VendasScreen';
import NovaVendaScreen from './src/screens/NovaVendaScreen';
import DetalhesVendaScreen from './src/screens/DetalhesVendaScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';

const Stack = createStackNavigator();

const App = () => {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        setDbReady(true);
      } catch (error) {
        console.error('Falha crítica na inicialização:', error);
        setError('Erro crítico: Não foi possível inicializar o banco de dados');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Inicializando banco de dados...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Pastelaria do Dev' }}
        />

        <Stack.Screen
          name="Produtos"
          component={ProdutosScreen}
          options={{ title: 'Gerenciar Pastéis' }}
        />

        <Stack.Screen
          name="Categorias"
          component={CategoriasScreen}
          options={{ title: 'Gerenciar Categorias' }}
        />

        <Stack.Screen
          name="Vendas"
          component={VendasScreen}
          options={{ title: 'Histórico de Vendas' }}
        />

        <Stack.Screen
          name="NovaVenda"
          component={NovaVendaScreen}
          options={{ title: 'Nova Venda' }}
        />

        <Stack.Screen
          name="DetalhesVenda"
          component={DetalhesVendaScreen}
          options={{ title: 'Detalhes da Venda' }}
        />

        <Stack.Screen
          name="Relatorios"
          component={RelatoriosScreen}
          options={{ title: 'Relatórios' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FFF7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#292F36',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FFF7',
  },
  errorText: {
    color: '#F44336',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;