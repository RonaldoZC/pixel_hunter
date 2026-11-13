import { useCallback, useEffect, useRef, useState } from 'react';

// Controla uma ação disparada pelo usuário (entrar, salvar, comprar...): expõe { loading, error,
// success } e `run(...args)`, que devolve o resultado de `action` ou `undefined` se falhar
// (a mensagem fica em `error`). `clear` limpa erro e sucesso, ex.: quando o usuário edita o formulário.
export default function useAction(action) {
  const [state, setState] = useState({ loading: false, error: null, success: false });
  const actionRef = useRef(action);

  // Mantém a versão mais recente de `action` sem trocar a identidade de `run`.
  useEffect(() => {
    actionRef.current = action;
  });

  const run = useCallback(async (...args) => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await actionRef.current(...args);
      setState({ loading: false, error: null, success: true });
      return result ?? true;
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
      return undefined;
    }
  }, []);

  const clear = useCallback(() => setState({ loading: false, error: null, success: false }), []);

  return { ...state, run, clear };
}
