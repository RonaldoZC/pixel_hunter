import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { logo } from '../constants/images';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import useAction from '../utils/useAction';
import { validateLogin } from '../utils/validators';

export default function HomeScreen({ navigation }) {
  const { user, restoring, signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const login = useAction(signIn);
  const redirected = useRef(false);

  // Com sessão (recém-feita ou restaurada ao abrir o app), segue para o mapa uma única vez.
  // Voltar ao início pelo mapa não redireciona de novo; sair da conta recria esta tela.
  useEffect(() => {
    if (restoring || !user || redirected.current) return;
    redirected.current = true;
    navigation.navigate('StoreMap');
  }, [restoring, user, navigation]);

  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    login.clear();
  };

  const submit = () => {
    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length === 0) login.run(form);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo do Pixel Hunter" />
        <AppText bold size="xxl" color={colors.primary} style={styles.title}>
          Pixel Hunter
        </AppText>
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
        <Button title="Entrar" onPress={submit} loading={login.loading || restoring} />
        {login.error ? (
          <AppText size="sm" color={colors.error}>
            {login.error}
          </AppText>
        ) : null}
        <Button title="Cadastrar" variant="outline" size="sm" onPress={() => navigation.navigate('Register')} />
        {/* Navegar pelas lojas não exige conta; comprar e vender exigem. */}
        <Button title="Explorar lojas" variant="outline" size="sm" onPress={() => navigation.navigate('StoreMap')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  logo: { alignSelf: 'center', width: 200, height: 200 },
  title: { textAlign: 'center', marginBottom: spacing.md },
});
