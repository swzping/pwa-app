import {useState} from 'react';

export function useSelection({maxTotal = 0}) {
  const [selectedMap, setSelectedMap] = useState({});

  const reset = (initSelectedMap) => setSelectedMap(initSelectedMap);

  const calcTotal = map =>
    Object.values(map).reduce((sum, qty) => sum + Number(qty || 0), 0);

  const toggle = ({selected, key, quantity = 1}) => {
    setSelectedMap(prev => {
      const next = {...prev};

      // cancel selected
      if (!selected || quantity < 1) {
        delete next[key];
        return next;
      }

      next[key] = quantity;
      return next;
    });
  };

  return {
    selectedMap,
    toggle,
    total: calcTotal(selectedMap),
    reset,
  };
}
