import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import ImageField from '../components/ImageField';
import { ErrorState, LoadingState } from '../components/ListStates';
import OptionPicker from '../components/OptionPicker';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { colors, spacing } from '../constants/theme';
import { getCategories } from '../services/categoryService';
import { createProduct, productToForm, updateProduct } from '../services/productService';
import useAction from '../utils/useAction';
import useAsync from '../utils/useAsync';
import { validateProduct } from '../utils/validators';

const emptyForm = { title: '', description: '', price: '', image: null, categoryId: null };

// Cadastro de produto; com `route.params.product` vira a edição desse produto.
export default function ProductCreateScreen({ route, navigation }) {
  return (
    <RequireAuth role="SELLER" message="Só contas de vendedor podem cadastrar produtos.">
      <ProductForm product={route.params?.product} navigation={navigation} />
    </RequireAuth>
  );
}

function ProductForm({ product, navigation }) {
  const { data: categories, loading, error, reload } = useAsync(getCategories);
  const [form, setForm] = useState(() => (product ? productToForm(product) : emptyForm));
  const [errors, setErrors] = useState({});
  const save = useCallback(
    (values) => (product ? updateProduct(product.id, values) : createProduct(values)),
    [product]
  );
  const publish = useAction(save);

  const categoryOptions = useMemo(
    () => (categories ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  // Atualiza o campo e limpa o erro e o aviso dele, para não mostrar mensagem desatualizada.
  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    publish.clear();
  };

  const submit = async () => {
    const found = validateProduct(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (!(await publish.run(form))) return;
    if (product) navigation.goBack();
    else setForm(emptyForm);
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
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
        <Button title={product ? 'Salvar alterações' : 'Publicar Produto'} onPress={submit} loading={publish.loading} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
