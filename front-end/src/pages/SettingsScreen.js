import { StyleSheet } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { user, isBuyer, isSeller, signOut } = useAuth();

  const leave = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <Screen style={styles.container}>
      {user ? (
        <Button title="Meus Dados" variant="outline" onPress={() => navigation.navigate('MyData')} />
      ) : null}
      {isBuyer ? (
        <Button title="Meus Pedidos" variant="outline" onPress={() => navigation.navigate('Orders')} />
      ) : null}
      <Button
        title="Atendimento ao Cliente"
        variant="outline"
        onPress={() => navigation.navigate('Support')}
      />
      {isSeller ? (
        <Button title="Meus Produtos" variant="outline" onPress={() => navigation.navigate('MyProducts')} />
      ) : null}
      {isSeller ? (
        <Button title="Cadastrar Produto" onPress={() => navigation.navigate('ProductCreate')} />
      ) : null}
      {user ? (
        <Button title="Sair" variant="outline" onPress={leave} />
      ) : (
        <Button title="Entrar" onPress={() => navigation.navigate('Home')} />
      )}
      <AppText bold style={styles.contacts}>
        Contatos:
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  contacts: { textAlign: 'center', marginTop: spacing.lg },
});
