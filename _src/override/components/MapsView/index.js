import React from 'react';
import MapView from 'react-native-maps';

import Text from '@app/components/Text';
import {rxUserTheme} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';
import PropTypes from 'prop-types';
import CustomView from '@app/components/CustomView';
import {Colors} from '@app/styles';
import {DARK} from '@app/helpers/Constants';

const NavBar = ({ref, location, storeLocation, onPressDirection}) => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const scheme = useReactiveVar(rxUserTheme);

  return (
    <MapView
      ref={ref}
      showsScale
      showsUserLocation
      showsMyLocationButton
      style={{height: '100%', width: '100%', borderRadius: 6}}
      initialRegion={{
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      region={{
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      provider="google">
      {storeLocation?.items.map((item, index) => {
        return (
          <MapView.Marker
            key={item.index}
            coordinate={{
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
            }}>
            <MapView.Callout onPress={() => onPressDirection({item})}>
              <CustomView
                backgroundColor={scheme === DARK ? Colors.DARK : Colors.WHITE}>
                <CustomView padding={5}>
                  <Text bold large>
                    {item.store_name}
                  </Text>
                </CustomView>
                <CustomView padding={5}>
                  <Text ellipsizeMode="tail" numberOfLines={0}>
                    {item.address}
                  </Text>
                </CustomView>
              </CustomView>
            </MapView.Callout>
          </MapView.Marker>
        );
      })}
    </MapView>
  );
};

NavBar.propTypes = {
  // use for displaying logo or not
  location: PropTypes.object,
  // use for displaying back button or not
  storeLocation: PropTypes.object,
  // use for displaying search can be input:true or touch:false
  onPressDirection: PropTypes.func,
};

export default NavBar;
