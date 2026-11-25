import { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { logo } from '../constants/images';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import useAction from '../utils/useAction';
import useForm from '../utils/useForm';
import { validateLogin } from '../utils/validators';

export default function HomeScreen({ navigation }) {
  const { user, restoring, signIn } = useAuth();
  const { form, errors, setField, submit } = useForm({
    initial: { email: '', password: '' },
    validate: validateLogin,
    onEdit: () => login.clear(),
  });
  const login = useAction(signIn);
  const redirected = useRef(false);

  useEffect(() => {
    if (restoring || !user || redirected.current) return;
    redirected.current = true;
    navigation.navigate('StoreMap');
  }, [restoring, user, navigation]);

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
        <Button title="Entrar" onPress={() => submit(login.run)} loading={login.loading || restoring} />
        {login.error ? (
          <AppText size="sm" color={colors.error}>
            {login.error}
          </AppText>
        ) : null}
        <Button title="Cadastrar" variant="outline" size="sm" onPress={() => navigation.navigate('Register')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  logo: { alignSelf: 'center', width: 200, height: 200 },
  title: { textAlign: 'center', marginBottom: spacing.md },
});
