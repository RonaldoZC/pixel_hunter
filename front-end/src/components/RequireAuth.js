import { EmptyState, LoadingState } from './ListStates';
import Screen from './Screen';
import { useAuth } from '../context/AuthContext';

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
