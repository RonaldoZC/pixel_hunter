import { EmptyState, ErrorState, LoadingState } from './ListStates';

export default function AsyncContent({ state, emptyMessage, children }) {
  const { data, loading, error, reload } = state;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  if (emptyMessage && data.length === 0) return <EmptyState message={emptyMessage} />;
  return children(data);
}
