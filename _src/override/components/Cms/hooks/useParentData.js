import {createContext, useContext, useMemo} from 'react';

export const ParentDataContext = createContext();

export const ParentDataProvider = ({children, data, onUpdate}) => {
  const contextValue = useMemo(() => {
    return {
      getData: () => data,
      updateData: onUpdate,
      rawData: data,
    };
  }, [data, onUpdate]);

  return (
    <ParentDataContext.Provider value={contextValue}>
      {children}
    </ParentDataContext.Provider>
  );
};

export const useParentData = () => {
  let context = useContext(ParentDataContext);

  if (context === undefined) {
    context = { rawData: {} };
    // console.error('useParentData must be used within a ParentDataProvider.');
  }

  return context;
};
