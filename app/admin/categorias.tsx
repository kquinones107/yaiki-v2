// =============================================
// ADMIN CATEGORIES SCREEN — Gestión de Categorías
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Switch, Alert, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getAllCategories, createCategory, updateCategory } from '@/services/productService';
import { Category } from '@/types';
import Toast from 'react-native-toast-message';

export default function AdminCategoriesScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: getAllCategories,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        name: name.trim(),
        emoji: emoji.trim() || '✨',
        isActive: true,
        order: categories.length + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalVisible(false);
      setName('');
      setEmoji('✨');
      Toast.show({ type: 'success', text1: 'Categoría creada' });
    },
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCategory(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Nombre Requerido', 'Ingresa un nombre para la categoría.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorías</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Switch
              value={item.isActive}
              onValueChange={(val) =>
                toggleCategoryMutation.mutate({ id: item.id, isActive: val })
              }
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={Colors.white}
            />
          </View>
        )}
      />

      {/* MODAL NUEVA CATEGORÍA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Categoría</Text>

            <Text style={styles.label}>Emoji Icono</Text>
            <TextInput
              style={styles.inputEmoji}
              value={emoji}
              onChangeText={setEmoji}
              maxLength={4}
            />

            <Text style={styles.label}>Nombre de la Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Tobilleras"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: { fontSize: 24, marginRight: Spacing.md },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.sm },
  inputEmoji: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: 60,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.textMuted, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: '800' },
});
