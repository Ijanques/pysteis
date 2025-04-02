import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import globalStyles from '../theme/styles';
import { produtosMaisVendidos, categoriasMaisVendidas } from '../services/database';

const RelatoriosScreen = () => {
  const [dados, setDados] = useState([]);
  const [tipoRelatorio, setTipoRelatorio] = useState('produtos');
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const resultado = tipoRelatorio === 'produtos'
        ? await produtosMaisVendidos()
        : await categoriasMaisVendidas();
      
      setDados(resultado || []);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setDados([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio]);

  const getLabel = (item) => {
    const texto = tipoRelatorio === 'produtos'
      ? item?.nome || 'Produto sem nome'
      : item?.categoria || 'Categoria sem nome';
    
    return texto.length > 12 ? `${texto.substring(0, 12)}...` : texto;
  };

  if (carregando) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando relatórios...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.header}>Relatórios</Text>

      <View style={[globalStyles.card, styles.pickerContainer]}>
        <Picker
          selectedValue={tipoRelatorio}
          onValueChange={setTipoRelatorio}
          style={styles.picker}
        >
          <Picker.Item label="Produtos Mais Vendidos" value="produtos" />
          <Picker.Item label="Categorias Mais Vendidas" value="categorias" />
        </Picker>
      </View>

      <View style={globalStyles.card}>
        {dados.length > 0 ? (
          <>
            <BarChart
              data={{
                labels: dados.map(getLabel),
                datasets: [{
                  data: dados.map(item => item?.total_vendido || 0)
                }]
              }}
              width={300}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: colors.background,
                backgroundGradientFrom: colors.background,
                backgroundGradientTo: colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(41, 47, 54, ${opacity})`,
                propsForLabels: {
                  fontSize: 10
                }
              }}
              style={styles.chart}
            />

            <FlatList
              data={dados}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.item}>
                  <Text style={styles.rank}>{index + 1}º</Text>
                  <Text style={styles.nome}>
                    {tipoRelatorio === 'produtos' 
                      ? item?.nome || 'Produto sem nome'
                      : item?.categoria || 'Categoria sem nome'}
                  </Text>
                  <Text style={styles.total}>{item?.total_vendido || 0} vendas</Text>
                </View>
              )}
            />
          </>
        ) : (
          <Text style={globalStyles.emptyMessage}>Nenhum dado disponível</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  rank: {
    fontWeight: 'bold',
    marginRight: 10,
    color: colors.primary,
  },
  nome: {
    flex: 1,
    fontSize: 16,
  },
  total: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default RelatoriosScreen;