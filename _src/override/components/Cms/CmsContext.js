import {createContext, useContext} from 'react';

export const CmsContext = createContext({
  isHomePage: false,
  onOpenVariantPopup: () => {},
});

export const useCmsContext = () => useContext(CmsContext);
