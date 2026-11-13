import { EmptyState, LoadingState } from './ListStates';
import Screen from './Screen';
import { useAuth } from '../context/AuthContext';

// Mostra `children` só para quem está logado (e, se `role` for dado, tem esse perfil).
// Os botões das Configurações já escondem essas telas; isto protege também o acesso direto.
export default function RequireAuth({ role, message, children }) {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (!user) {
    return (
      <Screen>
        <EmptyState message="Entre na sua conta para continuar." />
      </Screen>
    );
  }
  if (role && user.role !== role) {
    return (
      <Screen>
        <EmptyState message={message ?? 'Esta área não está disponível para o seu tipo de conta.'} />
      </Screen>
    );
  }
  return children;
}
