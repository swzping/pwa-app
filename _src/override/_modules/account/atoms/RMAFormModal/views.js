import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Modal} from 'react-native';
import {useReactiveVar} from '@apollo/client';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import Button from '@app/components/Button';
import {rxUserTheme} from '@app/services/cache';

import ImagePicker from '@app/components/ImagePicker';
import Input from '@app/components/Input';
import NavBar from '@app/components/NavBar';
import Picker from '@app/components/Picker';
import RadioButton from '@app/components/RadioButton';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Divider from '@app/components/Divider';
import Text from '@app/components/Text';

import FastImage from '@d11/react-native-fast-image';
import styles from '@app/_modules/account/atoms/RMAFormModal/styles';

export default function RMAFormModalViews({
  type,
  visible,
  rmaFormData,
  orderNumber,
  productsToReturn,
  setProductsToReturn,
  customFieldsRequestData,
  customFieldsItemData,
  postedThreadMessages,
  customFieldsRequestSelected,
  setCustomFieldsRequestSelected,
  threadMessage,
  setThreadMessage,
  packageSentStatus,
  setPackageSentStatus,
  onSubmitRequest,
  onCancelRequest,
  onBack,
  loading,
}) {
  const scheme = useReactiveVar(rxUserTheme);
  const {t} = useTranslation();

  const Items = ({item}) => {
    const selected = !!productsToReturn[item.item_id];
    const qtyReturnable = item.qty_returnable;

    return (
      <CustomView
        width={Mixins.MAX_WIDTH * 0.9}
        row
        horizontalCenter
        verticalCenter
        radius
        paddingVertical={10}
        paddingHorizontal={10}
        marginVertical={5}
        borderColor={Colors.GRAY_LIGHT}>
        <RenderIf condition={item.is_returnable}>
          <RadioButton
            style={{marginRight: normalize(10)}}
            selected={selected}
            onPress={() => {
              if (selected) {
                const productsToReturnTmp = {...productsToReturn};
                delete productsToReturnTmp[item.item_id];
                setProductsToReturn(productsToReturnTmp);
              } else {
                setProductsToReturn({
                  ...productsToReturn,
                  [item.item_id]: {
                    qty: 1,
                    custom_fields: {
                      field_id: 3,
                      value: 1,
                    },
                  },
                });
              }
            }}
          />
        </RenderIf>
        <FastImage
          key={item.item_id}
          style={styles.productImage}
          source={{
            uri: item.image_url,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
        <CustomView flex horizontalStart>
          <Text>{item.name}</Text>
          <RenderIf
            condition={
              (item.is_returnable && selected) || type === 'update-request'
            }>
            <CustomView row horizontalCenter verticalCenter>
              <Text scaling={false}>{t('account.view.qtyReturn')}</Text>
              <RenderIf condition={type !== 'update-request'}>
                <Input
                  styleProp={{
                    width: normalize(30),
                  }}
                  textStyleProp={{textAlign: 'center'}}
                  keyboardType="number-pad"
                  value={
                    selected ? productsToReturn[item.item_id].qty.toString() : 0
                  }
                  onChangeText={text => {
                    let qty = '0';
                    if (text !== '') {
                      qty = text;
                    }
                    if (parseInt(text) > qtyReturnable) {
                      qty = qtyReturnable;
                    }
                    setProductsToReturn({
                      ...productsToReturn,
                      [item.item_id]: {
                        ...productsToReturn[item.item_id],
                        qty: parseInt(qty),
                      },
                    });
                  }}
                />
                <Text xsmall>
                  {t('account.view.of')} {qtyReturnable}{' '}
                  {t('account.view.returnable')}
                </Text>
              </RenderIf>
              <RenderIf condition={type === 'update-request'}>
                <Text>{item.qty_rma}</Text>
              </RenderIf>
            </CustomView>
            {customFieldsItemData.map(customField => (
              <Picker
                enabled={
                  !rmaFormData.status || rmaFormData.status?.name !== 'Canceled'
                }
                key={customField.name + '' + item.item_id}
                pickerData={customField}
                selectedValue={
                  productsToReturn[item.item_id]?.custom_fields?.value
                }
                setSelectedValue={value => {
                  setProductsToReturn({
                    ...productsToReturn,
                    [item.item_id]: {
                      ...productsToReturn[item.item_id],
                      custom_fields: {
                        field_id: customField.id,
                        value: value,
                      },
                    },
                  });
                }}
              />
            ))}
          </RenderIf>
          <RenderIf condition={type === 'new-request'}>
            <RenderIf
              condition={!item.is_returnable && !item.other_rma_request}>
              <Text>{t('account.view.itemNotReturnable')}</Text>
            </RenderIf>
            <RenderIf condition={item.other_rma_request?.length}>
              <Text>
                {t('account.view.otherReturnRequest')} {item.other_rma_request}
              </Text>
            </RenderIf>
          </RenderIf>
        </CustomView>
      </CustomView>
    );
  };

  const HeaderComponent = () => {
    return (
      <>
        <CustomView marginVertical={20}>
          {customFieldsRequestData.map(customField => (
            <Picker
              enabled={
                !(
                  customField.name === 'Package Condition' &&
                  type === 'update-request'
                ) && rmaFormData.status?.name !== 'Canceled'
              }
              key={customField.name}
              pickerData={customField}
              selectedValue={customFieldsRequestSelected[customField.id]}
              setSelectedValue={value => {
                setCustomFieldsRequestSelected({
                  ...customFieldsRequestSelected,
                  [customField.id]: value,
                });
              }}
            />
          ))}
        </CustomView>

        <Text alignStart bold>
          {t('account.view.productToReturn')}
        </Text>
      </>
    );
  };

  // const FooterComponent = () => {
  // Using Function Form to solve issue : auto close keyboard on typing message
  const footerComponent = () => {
    const [showMessages, setShowMessages] = useState(false);

    const handleMessageText = text => {
      setThreadMessage({...threadMessage, text});
    };

    return (
      <>
        <RenderIf condition={postedThreadMessages.length}>
          <Button
            width={normalize(120)}
            label={
              showMessages
                ? t('account.btn.hideMessages')
                : t('account.btn.showMessages')
            }
            styleProp={styles.hideMessasgesButton}
            textStyleProp={styles.hideMessasgesButtonText}
            onPress={() => setShowMessages(!showMessages)}
          />

          <RenderIf condition={showMessages}>
            <CustomView horizontalStart>
              <Text>{t('account.view.messages')}</Text>
              {postedThreadMessages.map(message => {
                const alignStyle = {
                  alignSelf:
                    message.owner_type === 2 ? 'flex-start' : 'flex-end',
                };

                let customermsgBackgroundColor =
                  scheme === 'dark' ? Colors.BLACK : Colors.WHITE;
                let storemsgBackgroundColor =
                  scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_SMOOTH;

                const borderStyle = {
                  borderRadius: normalize(10),
                  alignSelf:
                    message.owner_type === 2 ? 'flex-start' : 'flex-end',
                  backgroundColor:
                    message.owner_type === 2
                      ? storemsgBackgroundColor
                      : customermsgBackgroundColor,
                  borderTopLeftRadius: message.owner_type === 2 ? 0 : 10,
                  borderTopRightRadius: message.owner_type === 2 ? 10 : 0,
                  borderColor: scheme === 'dark' ? Colors.WHITE : Colors.BLACK,
                  borderWidth: 0.5,
                  width: Mixins.MAX_WIDTH * 0.8,
                };

                return (
                  <RenderIf condition={message.text !== ''}>
                    <Text xxsmall style={[alignStyle]}>
                      {message.owner_type === 2
                        ? `${rmaFormData.customer_address.firstname}`
                        : t('account.view.admin')}
                    </Text>
                    <CustomView
                      style={[borderStyle]}
                      paddingHorizontal={10}
                      paddingVertical={2}
                      marginVertical={3}>
                      <RenderIf condition={message.attachments.length}>
                        {message.attachments.map(attachment => {
                          return (
                            <>
                              <Text xxsmall style={[alignStyle]}>
                                {attachment.name}
                              </Text>
                              <FastImage
                                key={attachment.name}
                                style={styles.attachmentImage}
                                source={{
                                  uri: attachment.image_url,
                                  priority: FastImage.priority.normal,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                              />
                            </>
                          );
                        })}
                      </RenderIf>
                      <Text style={[alignStyle]}>{message.text}</Text>
                      <Text xxsmall style={[alignStyle]}>
                        {message.created_at}
                      </Text>
                    </CustomView>
                  </RenderIf>
                );
              })}
            </CustomView>
          </RenderIf>
        </RenderIf>

        <RenderIf condition={rmaFormData.status?.name !== 'Canceled'}>
          <Input
            label={t('account.label.sendMessage')}
            placeholder={t('account.placeholder.messageToManager')}
            multiline={true}
            numberOfLines={10}
            value={threadMessage?.text}
            onChangeText={handleMessageText}
            // onChangeText={(text) => setThreadMessage({...threadMessage, text})}
            styleProp={styles.messageInput}
            // editable={!loading}
          />

          <ImagePicker
            style={{width: '100%'}}
            label={t('account.label.uploadImage')}
            callback={imageData => {
              const imagePath = imageData.path.split('/');
              const name = imagePath[imagePath.length - 1];
              let file_name = name;
              let file_content_base64 =
                'data:' + imageData.mime + ';base64,' + imageData.data;
              setThreadMessage({
                ...threadMessage,
                attachments: [
                  {
                    file_content_base64,
                    name,
                    file_name,
                  },
                ],
              });
            }}
          />
        </RenderIf>

        <RenderIf
          condition={
            type === 'update-request' && rmaFormData.status?.name !== 'Canceled'
          }>
          <CustomView row horizontalCenter style={{marginBottom: 15}}>
            <RadioButton
              selected={
                rmaFormData?.status?.name === 'Package Sent'
                  ? true
                  : packageSentStatus
              }
              onPress={() => {
                if (rmaFormData?.status?.name !== 'Package Sent') {
                  setPackageSentStatus(!packageSentStatus);
                }
              }}
            />
            <Text style={styles.packageSentText}>
              {t('account.view.packageSent')}
            </Text>
          </CustomView>
        </RenderIf>

        <Divider />

        <CustomView
          row
          spaceAround
          horizontalCenter
          verticalCenter
          style={{marginBottom: 20}}>
          <Button
            label={
              type === 'update-request'
                ? t('account.btn.back')
                : t('account.btn.cancel')
            }
            onPress={() => onBack()}
          />
          <RenderIf condition={rmaFormData.status?.name !== 'Canceled'}>
            <Button
              loading={loading}
              textStyleProp={{color: Colors.WHITE}}
              styleProp={{
                backgroundColor: Colors.PRIMARY,
                borderColor: Colors.PRIMARY,
              }}
              label={
                type === 'update-request'
                  ? t('account.btn.updateRequest')
                  : t('account.btn.submitRequest')
              }
              onPress={onSubmitRequest}
            />
          </RenderIf>
        </CustomView>
        <RenderIf
          condition={
            type === 'update-request' &&
            !packageSentStatus &&
            rmaFormData.status?.name !== 'Canceled'
          }>
          <Button
            width={normalize(120)}
            label={t('account.btn.cancelReturn')}
            onPress={onCancelRequest}
            styleProp={styles.cancelButton}
          />
        </RenderIf>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={() => {
        onBack();
      }}
      style={[
        styles.mainContainer,
        {
          backgroundColor: scheme === 'dark' ? Colors.BLACK : Colors.WHITE,
        },
      ]}>
      <NavBar
        title={`${t('account.title.newReturnOrder')} ${orderNumber}`}
        hideBack={true}
      />
      <FlatList
        ListHeaderComponent={<HeaderComponent />}
        data={rmaFormData?.items ? rmaFormData?.items : []}
        renderItem={Items}
        style={[
          styles.listContainer,
          {backgroundColor: scheme === 'dark' ? Colors.BLACK : Colors.WHITE},
        ]}
        keyExtractor={item => item.item_id.toString()}
        ListFooterComponent={footerComponent()}
      />
    </Modal>
  );
}
