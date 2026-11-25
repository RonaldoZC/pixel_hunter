import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((asset) => {
    setItems((prev) =>
      prev.some((item) => item.id === asset.id)
        ? prev
        : [...prev, { id: asset.id, title: asset.title, price: asset.price }]
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0);
    return {
      items,
      count: items.length,
      total: totalCents / 100,
      isInCart: (id) => items.some((item) => item.id === id),
      addItem,
      removeItem,
      clear,
    };
  }, [items, addItem, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }
  return context;
}
