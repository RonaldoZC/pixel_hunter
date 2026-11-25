import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Card from '../components/Card';
import ImageField from '../components/ImageField';
import RequireAuth from '../components/RequireAuth';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../services/mediaService';
import { getMe, updateMe, updatePhoto } from '../services/userService';
import useAction from '../utils/useAction';
import useAsync from '../utils/useAsync';
import useForm from '../utils/useForm';
import { validateProfile } from '../utils/validators';

export default function MyDataScreen() {
  return (
    <RequireAuth>
      <MyData />
    </RequireAuth>
  );
}

function MyData() {
  const profile = useAsync(getMe);

  return (
    <Screen>
      <AsyncContent state={profile}>{(data) => <ProfileForm profile={data} />}</AsyncContent>
    </Screen>
  );
}

function ProfileForm({ profile }) {
  const { updateUser } = useAuth();
  const { form, errors, setField, submit } = useForm({
    initial: { username: profile.username, email: profile.email, link: profile.link },
    validate: validateProfile,
    onEdit: () => save.clear(),
  });
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);

  const save = useAction(async (values) => {
    updateUser(await updateMe(values));
  });
  const changePhoto = useAction(async (image) => {
    const user = await updatePhoto(await uploadImage(image));
    setPhotoUrl(user.photoUrl);
    updateUser(user);
  });

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
          value={photoUrl ? { uri: photoUrl } : undefined}
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
        <Button title="Salvar" onPress={() => submit(save.run)} loading={save.loading} />
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
