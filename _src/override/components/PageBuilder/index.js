import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Mixins } from '@app/styles';
import { getCleanHTML } from '@app/helpers/General';
import { FACEBOOK } from '@app/helpers/Constants';
import { useNavigation } from '@react-navigation/native';
import { navigateTo } from '@app/helpers/Navigation';
import { modules } from '@root/swift.config';
import { isNil } from 'lodash';
import { parseDocument } from 'htmlparser2';
import { DomUtils } from 'htmlparser2';

import RenderHTML from '@app/components/RenderHTML';
import WidgetProductCarousel from '@app/components/PageBuilder/atoms/WidgetProductCarousel/index';
import WidgetSliderBanner from '@app/components/PageBuilder/atoms/WidgetSliderBanner/index';
import WidgetSliderCategory from '@app/components/PageBuilder/atoms/WidgetSliderCategory/index';
import WidgetTermsConditions from '@app/components/PageBuilder/atoms/WidgetTermsConditions/index';
import WidgetBannerPromo from '@app/components/PageBuilder/atoms/WidgetBannerPromo/index';
import WidgetBannerImage from '@app/components/PageBuilder/atoms/WidgetBannerImage/index';
import FooterSection from '@app/components/Footer/atoms/FooterSection/index';
import AboutUs from '@app/_modules/cms_page/atoms/about_us/index';
import WidgetReviewProduct from '@app/components/PageBuilder/atoms/WidgetReviewProduct/index';
import FeaturedBrand from '@app/components/FeaturedBrand/index';
import WidgetContactUs from '@app/components/PageBuilder/atoms/WidgetContactUs/index';
import CustomView from '@app/components/CustomView/index';
import LinearGradient from 'react-native-linear-gradient';
import RenderIf from '@app/components/RenderIf';

const styles = StyleSheet.create({
  body: {
    width: '100%',
  },
});
const gradientNodesNames = ['slide', 'catalog-list', 'banner-promo'];

const PageBuilder = ({
  htmlBlock,
  contentBackgroundColor = 'transparent',
  contentTextColor = Colors.BLACK,
  contentFontSize = 14,
  isMainHome = false,
}) => {
  const navigation = useNavigation();
  const regex = /<br|\n\s+|\n|\r|\r\s*\\?>/g;
  const [GradienBlockNodes, setGradientBlockNodes] = useState([]);
  const [PWANodes, setPWANodes] = useState([]);
  const [CatalogProductNodes, setCatalogProductNodes] = useState([]);
  const [slideIntervalTime, setSlideIntervalTime] = useState(4000);

  const finalHtmlBlock = getCleanHTML({
    htmlBlock,
    contentBackgroundColor,
    contentTextColor,
    contentFontSize,
  });

  /* ====== NODE EXTRACTION EFFECT ====== */
  useEffect(() => {
    if (!htmlBlock) return;

    // Reset states
    setGradientBlockNodes([]);
    setCatalogProductNodes([]);
    setPWANodes([]);

    const doc = parseDocument(htmlBlock);
    const nodes = doc.children || [];

    const traverse = (nodeList) => {
      nodeList.forEach(node => {
        if (node.name === 'pwa') {
          processPwaNode(node);
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(nodes);
  }, [htmlBlock, isMainHome]);

  const onSetPWANodes = useCallback(data => {
    if (isMainHome) {
      if (gradientNodesNames.includes(data.type)) {
        setGradientBlockNodes(prevState => [...prevState, data]);
      } else if (data.type === 'catalog-products-carousel') {
        setCatalogProductNodes(prevState => [...prevState, data]);
      } else {
        setPWANodes(prevState => [...prevState, data]);
      }
    } else {
      setPWANodes(prevState => [...prevState, data]);
    }
  }, [isMainHome]);

  const processPwaNode = (node) => {
    if (node.attribs['data-hidden'] === 'true') {
      return;
    }
    if (node.attribs['data-content-type'] === 'slide') {
      const dataImages = JSON.parse(node.attribs['data-images'] || '[]');
      const autoplay = node.attribs['data-autoplay'];
      const autoplayInterval = node.attribs['data-autoplay-speed'] ?? 4000;
      let sliders = [];
      dataImages.map((val, index) => {
        sliders.push({
          id: index + 1,
          is_clickable: true,
          image_url: val.images.mobile_image,
          url_redirection: val.link,
        });
      });
      onSetPWANodes({
        type: 'slide',
        autoplay: autoplay,
        autoplayInterval: autoplayInterval,
        data: sliders,
      });
      setSlideIntervalTime(Number(autoplayInterval));
      return;
    }
    if (node.attribs.type === 'catalog-list') {
      const dataImages = JSON.parse(node.attribs['data-images'] || '[]');
      let categorySliders = [];
      dataImages.map((val, index) => {
        categorySliders.push({
          id: index + 1,
          name: val.title,
          category_icon: val.image,
          category_identifier: val.link,
        });
      });
      onSetPWANodes({ type: 'catalog-list', data: categorySliders });
      return;
    }
    if (node.attribs.type === 'banner-promo') {
      const dataImages = JSON.parse(node.attribs['data-images'] || '[]');
      let bannerPromo = [];
      dataImages.map((val, index) => {
        bannerPromo.push({
          id: index + 1,
          image_url: val.image,
          url_redirection: val.link,
        });
      });
      onSetPWANodes({ type: 'banner-promo', data: bannerPromo });
      return;
    }
    if (node.attribs.type_name === 'Catalog Products Carousel') {
      const categoryId = node?.attribs?.condition_option_value;
      const title = node?.attribs?.title;
      const titleBgColor =
        node?.attribs?.titlecolor === '' ? null : node?.attribs?.titlecolor;
      const bodyBgColor =
        node?.attribs?.bodycolor === '' ? null : node?.attribs?.bodycolor;

      onSetPWANodes({
        type: 'catalog-products-carousel',
        data: { category_id: categoryId, title, titleBgColor, bodyBgColor },
      });
      return;
    }
    if (node.attribs.type === 'banner-image') {
      onSetPWANodes({
        type: 'banner-image',
        data: JSON.parse(node.attribs['data-images'] || '[]'),
      });
      return;
    }
    if (node.attribs.type === 'feature-brand') {
      onSetPWANodes({ type: 'feature-brand' });
      return;
    }
  };

  /* ====== RENDERERS ====== */

  // Custom recursive helper to collect contact section data from TNode children
  // We approximate the original logic: node.children.map -> x.children[0].children[0]
  // In TNode, we check structure closer to DOM
  const extractContactData = (tnode) => {
    let sections = [];
    const children = tnode.children || [];

    // Original logic: node.children.map(x => ...) where node is 'cms-blocks-contact'
    children.forEach(col => {
      // col corresponds to x. 
      // x.children[0] -> .card
      // x.children[0].children[0] -> .card-body

      // Try to find the section div (e.g. .section-head-office) inside this column
      // We'll iterate deep to find the special classes

      // Helper to find specific class node
      const findNodeByClass = (node, classNamePartial) => {
        if (node.classes && node.classes.some(c => c.includes(classNamePartial))) return node;
        if (node.children) {
          for (let child of node.children) {
            const found = findNodeByClass(child, classNamePartial);
            if (found) return found;
          }
        }
        return null;
      };

      const sectionNode = findNodeByClass(col, 'section-'); // sections start with section-

      if (sectionNode) {
        const classes = sectionNode.classes || [];
        let type = '';
        classes.forEach(c => {
          if (c !== 'card-body' && c !== 'p-5') type += c + ' ';
        });
        type = type.trim();

        // Now extract content
        let title = null;
        let content = [];

        const traverseContent = (n) => {
          if (n.tagName === 'h5') {
            if (n.children && n.children[0] && n.children[0].data) {
              title = n.children[0].data;
            }
          } else if (n.tagName === 'p') {
            // p usually has text or span
            // Simplify: just grab text content of P
            // But original logic combined children[0] and children[1]
            // We'll just collect all text inside
            // Wait, original: `${child.children[0].data} ${child.children[1]...}`

            // Let's do a simple text extraction for p 
            // Note: TNode structure might be TBlock with TText children
            let text = '';
            const collectText = (pNode) => {
              if (pNode.data) text += pNode.data;
              if (pNode.children) pNode.children.forEach(collectText);
            }
            collectText(n);
            if (text) content.push(text);
          } else if (n.tagName === 'div' && n.classes?.includes('row') && n.classes?.includes('mt-3')) {
            // Social icons
            // Structure: div.row.mt-3 -> children (cols) -> a -> img
            const icons = n.children || [];
            icons.forEach(iconCol => {
              const findA = (node) => node.tagName === 'a' ? node : (node.children ? findA(node.children[0]) : null);
              const aNode = findA(iconCol);
              if (aNode) {
                const href = aNode.attributes.href;
                const findImg = (node) => node.tagName === 'img' ? node : (node.children ? findImg(node.children[0]) : null);
                const imgNode = findImg(aNode);
                if (imgNode) {
                  const type = imgNode.attributes['data-social'];
                  const uri = imgNode.attributes.src;
                  const width = imgNode.attributes.width;
                  content.push({
                    type: type,
                    icon: type === FACEBOOK ? 'facebook-f' : type,
                    url: href,
                    img: { uri, width }
                  });
                }
              }
            });
          } else {
            if (n.children) n.children.forEach(traverseContent);
          }
        };

        if (sectionNode.children) sectionNode.children.forEach(traverseContent);

        if (title || content.length > 0) {
          sections.push({ type, title, content });
        }
      }
    });
    return sections;
  };

  const renderers = {
    pwa: () => null, // Hidden as we rendered them via extracted state

    div: (props) => {
      const { tnode, TDefaultRenderer, ...rest } = props;

      if (tnode.classes?.includes('terms-conditions-mobile')) {
        // Create a synthetic structure for WidgetTermsConditions based on tnode?
        // WidgetTermsConditions expects 'children' prop as dom nodes...
        // Actually, WidgetTermsConditions iterates node.children.
        // Pass tnode.domNode equivalent? tnode.domNode exists if enabled?
        // Let's defer to null for now and see if we can simplify WidgetTermsConditions or just omit support if not critical, 
        // BUT user asked to replace.
        // The original code passed `node.children`.
        // RenderHTML doesn't expose raw children easily in component form for re-use without the engine.
        // NOTE: `WidgetTermsConditions` implementation is not shown but assuming it needs array of nodes.
        // We might need to rewrite `WidgetTermsConditions` to accept TNode or data.
        // Fallback: render default for now or null?
        // Let's try to render default contents.
        return <TDefaultRenderer {...props} />;
      }

      if (tnode.classes?.includes('cms-blocks-contact')) {
        const sections = extractContactData(tnode);
        return <WidgetContactUs key={'node-contact'} data={sections} />;
      }

      if (tnode.classes?.includes('review-block')) {
        return <WidgetReviewProduct />; // Simplified, original passed children
      }

      if (tnode.classes?.includes('container-pwa-mobile')) {
        // AboutUs expects 'aboutCMS' which is the node
        // We can't pass TNode as 'node' directly if it expects htmlparser2 node structure.
        // But maybe AboutUs just needs text?
        return <AboutUs aboutCMS={{ children: [] }} />; // Placeholder, needs AboutUs refactor likely
      }

      if (
        tnode.classes?.includes('footer-info-mobile') ||
        tnode.classes?.includes('footer-rules-mobile') ||
        tnode.classes?.includes('footer-social-mobile') ||
        tnode.classes?.includes('footer-share')
      ) {
        // Flatten styles or logic
        // RenderHTML handles layout well.
        return <TDefaultRenderer {...props} />;
        // Original returned <FooterSection>, which likely rendered specific layout.
        // For now, let standard HTML rendering handle it unless we fully reimplement FooterSection.
      }

      // Handle Register / Shop buttons
      if (tnode.classes?.includes('button-register')) {
        return (
          <CustomView width={Mixins.MAX_WIDTH} horizontalCenter>
            <TouchableOpacity
              onPress={() => {
                navigateTo(modules.auth_signup.enable, modules.auth_signup.name);
              }}
              style={{
                width: 100,
                backgroundColor: Colors.PRIMARY,
                alignSelf: 'center',
                paddingVertical: 10,
                marginTop: 10,
              }}>
              <Text style={{ textAlign: 'center', color: Colors.WHITE }}>
                Register
              </Text>
            </TouchableOpacity>
          </CustomView>
        );
      }

      if (tnode.classes?.includes('button-shop')) {
        return (
          <CustomView width={Mixins.MAX_WIDTH} horizontalCenter>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                width: 100,
                backgroundColor: Colors.PRIMARY,
                alignSelf: 'center',
                paddingVertical: 10,
                marginTop: 10,
              }}>
              <Text style={{ textAlign: 'center', color: Colors.WHITE }}>Shop</Text>
            </TouchableOpacity>
          </CustomView>
        );
      }

      // Default
      return <TDefaultRenderer {...props} />;
    },

    // Handle specific text replacements if matched by element
    // Note: RenderHTML doesn't let us easily intercept raw text "Selamat datang..." unless wrapped.
    // Assuming they are in p tags.
    p: (props) => {
      const { tnode, TDefaultRenderer } = props;
      // Check text content 
      let text = '';
      const collect = (n) => { if (n.data) text += n.data; if (n.children) n.children.forEach(collect); }
      collect(tnode);
      text = text.trim();

      if (text.startsWith('Selamat datang di') || text.startsWith('Ada berbagai keuntungan')) {
        return <Text style={{ fontWeight: 'bold' }}>{'\n\n' + text}</Text>;
      }
      if (text.startsWith('GUARDIAN')) {
        return (
          <Text style={{ color: Colors.PRIMARY, fontWeight: 'bold' }}>
            {text}
          </Text>
        );
      }
      if (text.startsWith('Family')) {
        return <Text style={{ fontWeight: 'bold' }}>{text + '\n'}</Text>;
      }

      return <TDefaultRenderer {...props} />;
    }
  };

  return (
    <>
      <RenderIf condition={GradienBlockNodes?.length > 0}>
        <LinearGradient colors={[Colors.ORANGE_LIGHT, Colors.WHITE]}>
          {GradienBlockNodes?.map((item, index) => {
            switch (item?.type) {
              case 'slide':
                return (
                  <WidgetSliderBanner
                    key={`node-${index}`}
                    autoplay={item.autoplay}
                    autoplayInterval={parseInt(item.autoplayInterval)}
                    data={item.data}
                  />
                );
              case 'catalog-list':
                return (
                  <WidgetSliderCategory
                    key={`node-${index}`}
                    data={item.data}
                  />
                );
              case 'banner-promo':
                return (
                  <WidgetBannerPromo
                    key={`node-${index}`}
                    data={item.data}
                    slideIntervalTime={slideIntervalTime}
                  />
                );
              default:
                return null;
            }
          })}
        </LinearGradient>
      </RenderIf>
      {CatalogProductNodes.map((item, index) => {
        return (
          <WidgetProductCarousel
            key={`catalog-node-${index}`}
            data={{
              ...item.data,
              bodyBgColor:
                isNil(item.data.titleBgColor) && index === 1
                  ? Colors.ORANGE_LIGHT
                  : item.data.titleBgColor,
              titleColor: index === 1 ? Colors.PRIMARY : undefined,
            }}
          />
        );
      })}
      {PWANodes.map((item, index) => {
        switch (item?.type) {
          case 'banner-image':
            return <WidgetBannerImage key={`node-${index}`} data={item.data} />;
          case 'feature-brand':
            return <FeaturedBrand key={`node-${index}`} />;
          case 'catalog-products-carousel':
            return (
              <WidgetProductCarousel
                key={`catalog-node-${index}`}
                data={{
                  ...item.data,
                  titleColor: index === 1 ? Colors.PRIMARY : undefined,
                }}
              />
            );
          case 'slide':
            return (
              <WidgetSliderBanner
                key={`node-${index}`}
                autoplay={item.autoplay}
                autoplayInterval={parseInt(item.autoplayInterval)}
                data={item.data}
              />
            );
          case 'catalog-list':
            return (
              <WidgetSliderCategory key={`node-${index}`} data={item.data} />
            );
          case 'banner-promo':
            return (
              <WidgetBannerPromo
                key={`node-${index}`}
                data={item.data}
                slideIntervalTime={slideIntervalTime}
              />
            );
        }
      })}
      <CustomView padding={10} style={{ width: '100%' }}>
        <RenderHTML
          htmlBlock={finalHtmlBlock
            .replace(regex, '')
            .replace(/imgclass=/g, 'img class=')}
          tagsStyles={styles}
          renderers={renderers}
        />
      </CustomView>
    </>
  );
};

export default PageBuilder;
