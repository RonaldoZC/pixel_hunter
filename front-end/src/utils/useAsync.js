import { useCallback, useEffect, useState } from 'react';

export default function useAsync(load) {
  const [state, setState] = useState({ data: undefined, loading: true, error: undefined });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: undefined });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: undefined, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ data: undefined, loading: true, error: undefined });
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, reload };
}
