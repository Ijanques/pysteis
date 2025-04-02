// src/components/VendaItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

const VendaItem = ({ item, onPress }) => {
  if (!item) return null;

  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.id}>Venda #{item.id}</Text>
          <View style={styles.dateContainer}>
            <MaterialIcons name="event" size={16} color={colors.textDark} />
            <Text style={styles.date}>
              {item.data ? new Date(item.data).toLocaleDateString() : '--/--/----'}
            </Text>
          </View>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.total}>R$ {item.total?.toFixed(2) || '0.00'}</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: 10,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  id: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 5,
    color: colors.textDark,
    opacity: 0.7,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  total: {
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.primary,
    marginRight: 10,
  },
});

export default VendaItem;