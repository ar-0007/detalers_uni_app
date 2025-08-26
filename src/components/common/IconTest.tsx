import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const IconTest: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Icon Test - All Icon Families</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Icons</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <Icon name="home" size={24} color="#FF6B35" />
            <Text style={styles.iconLabel}>home</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="school" size={24} color="#4ECDC4" />
            <Text style={styles.iconLabel}>school</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="person" size={24} color="#A78BFA" />
            <Text style={styles.iconLabel}>person</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="notifications" size={24} color="#FFB84D" />
            <Text style={styles.iconLabel}>notifications</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Community Icons</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="car" size={24} color="#FF6B35" />
            <Text style={styles.iconLabel}>car</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="washing-machine" size={24} color="#4ECDC4" />
            <Text style={styles.iconLabel}>washing-machine</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="spray" size={24} color="#A78BFA" />
            <Text style={styles.iconLabel}>spray</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="polish" size={24} color="#FFB84D" />
            <Text style={styles.iconLabel}>polish</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ionicons</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <Ionicons name="car-sport" size={24} color="#FF6B35" />
            <Text style={styles.iconLabel}>car-sport</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="water" size={24} color="#4ECDC4" />
            <Text style={styles.iconLabel}>water</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="brush" size={24} color="#A78BFA" />
            <Text style={styles.iconLabel}>brush</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="settings" size={24} color="#FFB84D" />
            <Text style={styles.iconLabel}>settings</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Awesome</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <FontAwesome name="car" size={24} color="#FF6B35" />
            <Text style={styles.iconLabel}>car</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="tint" size={24} color="#4ECDC4" />
            <Text style={styles.iconLabel}>tint</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="paint-brush" size={24} color="#A78BFA" />
            <Text style={styles.iconLabel}>paint-brush</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="cog" size={24} color="#FFB84D" />
            <Text style={styles.iconLabel}>cog</Text>
          </View>
        </View>
      </View>

      <Text style={styles.note}>
        Note: If icons don't show, try restarting the Metro bundler and rebuilding the app
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconItem: {
    alignItems: 'center',
    margin: 8,
    width: 80,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#666666',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default IconTest; 