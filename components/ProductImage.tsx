// =============================================
// PRODUCT IMAGE — Foto del producto con respaldo local
// Si el producto aún no tiene fotos en Storage, usa la
// imagen de la categoría incluida en la app.
// =============================================
import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { SEED_FALLBACK_IMAGE, SEED_IMAGE_BY_CATEGORY } from '@/constants/seedCatalog';
import { Product } from '@/types';

export const imageSourceFor = (categoryId?: string, url?: string) => {
  if (url) return { uri: url };
  return (categoryId && SEED_IMAGE_BY_CATEGORY[categoryId]) || SEED_FALLBACK_IMAGE;
};

export default function ProductImage({
  product, index = 0, style, resizeMode = 'cover',
}: {
  product: Pick<Product, 'images' | 'categoryId'>;
  index?: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain';
}) {
  return (
    <Image
      source={imageSourceFor(product.categoryId, product.images?.[index])}
      style={style}
      resizeMode={resizeMode}
    />
  );
}
