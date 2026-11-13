import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import OptionPicker from '../components/OptionPicker';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { colors, spacing } from '../constants/theme';
import { signUp } from '../services/authService';
import useAction from '../utils/useAction';
import { validateRegister } from '../utils/validators';

const emptyForm = { username: '', email: '', password: '', confirmPassword: '', role: null };
const roleOptions = [
  { value: 'BUYER', label: 'Comprador' },
  { value: 'SELLER', label: 'Vendedor' },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const register = useAction(signUp);

  // Atualiza o campo e limpa o erro e o aviso dele, para não mostrar mensagem desatualizada.
  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    register.clear();
  };

  const submit = async () => {
    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (await register.run(form)) setForm(emptyForm);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Nome de usuário"
          value={form.username}
          onChangeText={setField('username')}
          error={errors.username}
          autoCapitalize="none"
        />
        <TextField
          label="E-mail"
          value={form.email}
          onChangeText={setField('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Senha"
          value={form.password}
          onChangeText={setField('password')}
          error={errors.password}
          secureTextEntry
        />
        <TextField
          label="Confirme sua senha"
          value={form.confirmPassword}
          onChangeText={setField('confirmPassword')}
          error={errors.confirmPassword}
          secureTextEntry
        />
        <OptionPicker
          label="Tipo de conta"
          options={roleOptions}
          value={form.role}
          onChange={setField('role')}
          error={errors.role}
        />
        <Button title="Cadastrar" onPress={submit} loading={register.loading} />
        {register.error ? (
          <AppText size="sm" color={colors.error}>
            {register.error}
          </AppText>
        ) : null}
        {register.success ? (
          <>
            <AppText color={colors.primary}>Cadastro realizado! Agora é só entrar.</AppText>
            <Button title="Ir para o login" variant="outline" size="sm" onPress={() => navigation.goBack()} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
