import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import ImageField from '../components/ImageField';
import OptionPicker from '../components/OptionPicker';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { colors, spacing } from '../constants/theme';
import { getCategories } from '../services/categoryService';
import { createProduct, productToForm, updateProduct } from '../services/productService';
import useAction from '../utils/useAction';
import useAsync from '../utils/useAsync';
import useForm from '../utils/useForm';
import { validateProduct } from '../utils/validators';

const emptyForm = { title: '', description: '', price: '', image: undefined, categoryId: undefined };

export default function ProductCreateScreen({ route, navigation }) {
  return (
    <RequireAuth role="SELLER" message="Só contas de vendedor podem cadastrar produtos.">
      <ProductForm product={route.params?.product} navigation={navigation} />
    </RequireAuth>
  );
}

function ProductForm({ product, navigation }) {
  const categoriesState = useAsync(getCategories);
  const categories = categoriesState.data;
  const { form, errors, setField, reset, submit } = useForm({
    initial: product ? productToForm(product) : emptyForm,
    validate: validateProduct,
    onEdit: () => publish.clear(),
  });
  const publish = useAction(async (values) => {
    if (product) {
      await updateProduct(product.id, values);
      navigation.goBack();
    } else {
      await createProduct(values);
      reset();
    }
  });

  const categoryOptions = useMemo(
    () => (categories ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  return (
    <Screen>
      <AsyncContent state={categoriesState}>
        {() => (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ImageField
              label="Imagem do Produto"
              value={form.image}
              onChange={setField('image')}
              error={errors.image}
            />
            <OptionPicker
              label="Categoria"
              options={categoryOptions}
              value={form.categoryId}
              onChange={setField('categoryId')}
              error={errors.categoryId}
            />
            <TextField
              label="Título"
              placeholder="Ex: Troll Mutante"
              value={form.title}
              onChangeText={setField('title')}
              error={errors.title}
            />
            <TextField
              label="Descrição do Produto"
              multiline
              value={form.description}
              onChangeText={setField('description')}
              error={errors.description}
            />
            <TextField
              label="Preço (R$)"
              keyboardType="decimal-pad"
              value={form.price}
              onChangeText={setField('price')}
              error={errors.price}
            />
            <Button
              title={product ? 'Salvar alterações' : 'Publicar Produto'}
              onPress={() => submit(publish.run)}
              loading={publish.loading}
            />
            {publish.error ? (
              <AppText size="sm" color={colors.error}>
                {publish.error}
              </AppText>
            ) : null}
            {publish.success ? (
              <AppText size="sm" color={colors.primary}>
                Produto publicado!
              </AppText>
            ) : null}
          </ScrollView>
        )}
      </AsyncContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
