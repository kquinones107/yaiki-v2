// =============================================
// CREATE PRODUCT SCREEN — Formulario de nuevo producto
// Con subida de foto a Firebase Storage
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getCategories, createProduct, uploadProductImage } from '@/services/productService';
import Toast from 'react-native-toast-message';

export default function CreateProductScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !selectedCategoryId) {
      Alert.alert('Campos Incompletos', 'Nombre, precio y categoría son obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);

      // 1. Crear documento preliminar en Firestore
      const newProductId = await createProduct({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        categoryId: selectedCategoryId,
        categoryName: selectedCat?.name || 'Varios',
        images: [],
        isAvailable: true,
        isFeatured,
        tags: [selectedCat?.name || 'Accesorios'],
      });

      // 2. Subir imagen si seleccionó una
      let imageUrls: string[] = [];
      if (imageUri) {
        const uploadedUrl = await uploadProductImage(imageUri, newProductId);
        imageUrls.push(uploadedUrl);

        // Actualizar producto con la imagen subida
        const { updateProduct } = await import('@/services/productService');
        await updateProduct(newProductId, { images: imageUrls });
      }

      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });

      Toast.show({ type: 'success', text1: '¡Producto Creado con Éxito!' });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Producto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* PICK IMAGE */}
        <Text style={styles.label}>Imagen del Producto</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={Colors.adminAccent} />
              <Text style={styles.pickerText}>Toca para elegir una foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* NOMBRE */}
        <Text style={styles.label}>Nombre del Producto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Pulsera Olas del Mar"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* DESCRIPCIÓN */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalla los materiales, tamaño y diseño..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* PRECIO & STOCK */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Precio (COP) *</Text>
            <TextInput
              style={styles.input}
              placeholder="35000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Stock Inicial</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        {/* CATEGORÍA */}
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.categoriesWrap}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                selectedCategoryId === cat.id && styles.catChipSelected,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCategoryId === cat.id && styles.catChipTextSelected,
                ]}
              >
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DESTACADO */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Producto Destacado</Text>
            <Text style={styles.switchDesc}>Aparecerá en el inicio de la app</Text>
          </View>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: Colors.border, true: Colors.adminAccent }}
            thumbColor={Colors.white}
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Producto</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  form: { padding: Spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.md },
  flex1: { flex: 1 },
  imagePicker: {
    height: 180,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  pickerPlaceholder: { alignItems: 'center', gap: Spacing.xs },
  pickerText: { color: Colors.textMuted, fontSize: 13 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  catChip: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipSelected: { backgroundColor: Colors.adminAccent, borderColor: Colors.adminAccent },
  catChipText: { color: Colors.textSecondary, fontSize: 13 },
  catChipTextSelected: { color: Colors.white, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  switchLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  switchDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  saveBtn: {
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
