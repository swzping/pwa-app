import {useNavigationState} from '@react-navigation/native';

export const usePreviousScreen = () => {
  return useNavigationState(state => {
    const routes = state?.routes || [];
    return routes.length >= 2 ? routes[routes.length - 2]?.name : 'app_start';
  });
};
