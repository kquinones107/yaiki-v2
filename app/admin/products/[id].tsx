// ================================= subterranean =============================
// EDIT PRODUCT SCREEN — Formulario de edición de producto
// ============================================================================
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getProductById, getCategories, updateProduct, uploadProductImage } from '@/services/productService';
import Toast from 'react-native-toast-message';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setSelectedCategoryId(product.categoryId);
      setIsFeatured(product.isFeatured);
      setIsAvailable(product.isAvailable);
      if (product.images.length > 0) {
        setCurrentImageUrl(product.images[0]);
      }
    }
  }, [product]);

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

  const handleUpdate = async () => {
    if (!name.trim() || !price || !selectedCategoryId || !id) {
      Alert.alert('Campos Incompletos', 'Nombre, precio y categoría son obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);
      let updatedImages = currentImageUrl ? [currentImageUrl] : [];

      if (imageUri) {
        const uploadedUrl = await uploadProductImage(imageUri, id);
        updatedImages = [uploadedUrl];
      }

      await updateProduct(id, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        categoryId: selectedCategoryId,
        categoryName: selectedCat?.name || 'Varios',
        isAvailable,
        isFeatured,
        images: updatedImages,
      });

      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      Toast.show({ type: 'success', text1: '¡Producto Actualizado!' });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.adminAccent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Producto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* PICK IMAGE */}
        <Text style={styles.label}>Imagen del Producto</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={Colors.adminAccent} />
              <Text style={styles.pickerText}>Cambiar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* NOMBRE */}
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.textMuted}
        />

        {/* DESCRIPCIÓN */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={Colors.textMuted}
        />

        {/* PRECIO & STOCK */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Precio (COP) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
              placeholderTextColor={Colors.textMuted}
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

        {/* SWITCHES */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Producto Visible en Tienda</Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Producto Destacado</Text>
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
          onPress={handleUpdate}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Actualizar Producto</Text>
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
    marginTop: Spacing.md,
  },
  switchLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});
