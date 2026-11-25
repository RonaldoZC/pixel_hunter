import { useCallback, useEffect, useRef, useState } from 'react';

export default function useAction(action) {
  const [state, setState] = useState({ loading: false, error: undefined, success: false });
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  });

  const run = useCallback(async (...args) => {
    setState({ loading: true, error: undefined, success: false });
    try {
      await actionRef.current(...args);
      setState({ loading: false, error: undefined, success: true });
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
    }
  }, []);

  const clear = useCallback(() => setState({ loading: false, error: undefined, success: false }), []);

  return { ...state, run, clear };
}
