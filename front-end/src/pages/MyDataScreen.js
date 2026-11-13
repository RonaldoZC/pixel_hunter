import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import ImageField from '../components/ImageField';
import { ErrorState, LoadingState } from '../components/ListStates';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../services/mediaService';
import { getMe, updateMe, updatePhoto } from '../services/userService';
import useAction from '../utils/useAction';
import useAsync from '../utils/useAsync';
import { validateProfile } from '../utils/validators';

export default function MyDataScreen() {
  return (
    <RequireAuth>
      <MyData />
    </RequireAuth>
  );
}

// Carrega o perfil do servidor e só mostra o formulário quando ele chegar.
function MyData() {
  const load = useCallback(() => getMe(), []);
  const { data: profile, loading, error, reload } = useAsync(load);

  return (
    <Screen>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error.message} onRetry={reload} /> : null}
      {profile ? <ProfileForm profile={profile} /> : null}
    </Screen>
  );
}

function ProfileForm({ profile }) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    username: profile.username,
    email: profile.email,
    link: profile.link,
  });
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [errors, setErrors] = useState({});

  const save = useAction(async () => {
    updateUser(await updateMe(form));
  });
  // Escolher a foto já a envia: sobe a imagem e grava a URL no perfil.
  const changePhoto = useAction(async (image) => {
    const user = await updatePhoto(await uploadImage(image));
    setPhotoUrl(user.photoUrl);
    updateUser(user);
  });

  // Atualiza o campo e limpa o erro e o aviso dele, para não mostrar mensagem desatualizada.
  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    save.clear();
  };

  const submit = () => {
    const found = validateProfile(form);
    setErrors(found);
    if (Object.keys(found).length === 0) save.run();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <ImageField
          square
          removable={false}
          size={140}
          icon="camera-outline"
          pickTitle="Editar foto"
          changeTitle="Editar foto"
          value={photoUrl ? { uri: photoUrl } : null}
          onChange={(image) => image && changePhoto.run(image)}
          error={changePhoto.error}
        />
        {changePhoto.loading ? <AppText size="sm" color={colors.textMuted}>Enviando foto...</AppText> : null}

        <TextField
          label="Nome de usuário:"
          placeholder="Ex: Fallen123"
          autoCapitalize="none"
          value={form.username}
          onChangeText={setField('username')}
          error={errors.username}
        />
        <TextField
          label="Email utilizado:"
          placeholder="Ex: Fallen123@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={setField('email')}
          error={errors.email}
        />
        <TextField
          label="Adicionar link:"
          placeholder="Adicione um link para aumentar o trafego"
          keyboardType="url"
          autoCapitalize="none"
          value={form.link}
          onChangeText={setField('link')}
          error={errors.link}
        />
        <Button title="Salvar" onPress={submit} loading={save.loading} />
        {save.error ? (
          <AppText size="sm" color={colors.error}>
            {save.error}
          </AppText>
        ) : null}
        {save.success ? (
          <AppText size="sm" color={colors.primary}>
            Dados salvos.
          </AppText>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
});
