import React from 'react';
import {Mixins} from '@app/styles';
import {
  TYPE_PAGE,
  TYPE_BLOCK,
  TYPE_URL,
  TYPE_PLP,
  FACEBOOK,
  TYPE_BLANK,
  FOOTER_TYPE,
  IS_IOS,
} from '@app/helpers/Constants';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import MenuFooter from '@app/components/Footer/atoms/MenuFooter';
import SocialMediaButton from '@app/_modules/auth_signin/atoms/SocialMediaButton';

const FooterSection = ({socialSection, node}) => {
  const title = node.children[0].children[0].data;
  const childrenSection = node.children[1].children;
  let sectionData = [];

  if (socialSection) {
    childrenSection.map(child => {
      const href =
        child.children[0]?.children[0]?.attribs?.href ||
        child.children[0]?.attribs?.href;
      const type = child.children[0]?.children[0]?.attribs?.['data-social'];
      const img = {
        uri: child.children[0]?.children[0]?.attribs?.src,
        width: child.children[0]?.children[0]?.attribs?.width,
      };

      const pushData = {
        type: type,
        icon: type === FACEBOOK ? 'facebook-f' : type,
        url: href,
        img,
      };
      sectionData.push(pushData);
    });
  }

  if (!socialSection) {
    childrenSection.map(child => {
      if (child.children) {
        const label = child.children[0]?.children[0]?.data;
        const href = child.children[0]?.attribs.href;
        let dataType = child.children[0]?.attribs?.['data-type'];
        if (child.children[0]?.attribs?.['data-type']) {
          dataType = child.children[0]?.attribs?.['data-type'];
        } else if (FOOTER_TYPE.find(e => e.identifier === href.slice(1))) {
          dataType = FOOTER_TYPE.find(
            e => e.identifier === href.slice(1),
          )?.dataType;
        } else if (child.children[0]?.attribs.target === TYPE_BLANK) {
          dataType = TYPE_URL;
        }
        const cmsType = (() => {
          if (dataType) {
            if (dataType === TYPE_PAGE || dataType === TYPE_BLOCK) {
              return dataType;
            }
            return null;
          }
          return null;
        })();

        const identifier = (() => {
          if (dataType) {
            if (child.children[0].attribs.target === TYPE_BLANK) {
              return null;
            }
            if (dataType === TYPE_PAGE || dataType === TYPE_BLOCK) {
              return href.slice(1);
            }
            return null;
          }
          return null;
        })();

        const url = (() => {
          if (dataType) {
            if (dataType === TYPE_URL) {
              return href;
            }
            return null;
          }
          return null;
        })();

        const pushData = {
          label: label,
          dataType: dataType,
          cmsType: cmsType,
          identifier: identifier,
          url: url,
          categoryUrl: dataType && dataType === TYPE_PLP ? href : null,
        };
        sectionData.push(pushData);
      }
    });
  }

  const renderFooterSectionItem = () => {
    return sectionData.map((item, index) => {
      if (socialSection) {
        return <SocialMediaButton key={'menu-footer' + index} item={item} />;
      }
      return <MenuFooter key={'menu-footer' + index} item={item} />;
    });
  };

  return (
    <CustomView horizontalCenter paddingBottom={20} width={Mixins.MAX_WIDTH}>
      <Text bold xlarge style={{marginBottom: 20}}>
        {title.toUpperCase()}
      </Text>
      <CustomView
        flex={IS_IOS ? false : true}
        style={{flexDirection: socialSection ? 'row' : 'column'}}>
        {renderFooterSectionItem()}
      </CustomView>
    </CustomView>
  );
};

export default FooterSection;
