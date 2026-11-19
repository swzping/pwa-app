// import React, {useEffect, useRef, useState} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
//   Animated,
//   Image,
//   SectionList,
// } from 'react-native';
// import {CmsStyles, Colors} from '@app/styles';
// import {withProfiler} from '@sentry/react-native';
// import CustomView from '@app/components/CustomView';
// import RenderHTML from '@app/components/RenderHTML';
// import RenderIf from '@app/components/RenderIf';
// import {Colors as ColorsPaper} from 'react-native-paper';
// import {normalize} from '@app/styles/mixins';
// import Rating from '@app/components/Rating';
// import AddReviewBlock from '@app/_modules/product_detail/atoms/AddReviewBlock';
// import {navigateTo} from '@app/helpers/Navigation';
// import {modules} from '@root/swift.config';
// import title from 'react-native-paper/src/components/Typography/Title';
//
// const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
//
// const ProductDetailDescription = ({
//   t,
//   product,
//   productReviews,
//   showRecommendation = false,
//   starRatingProduct,
//   totalReview,
//   refetchProductReviews,
// }) => {
//   // const [activeTab, setActiveTab] = useState('description');
//   const [showBackToTop, setShowBackToTop] = useState(false);
//
//   const [expandProductDescription, setExpandProductDescription] =
//     useState(false);
//   const [expandedHowToUseSections, setExpandedHowToUseSections] =
//     useState(false);
//   const [isProductDesriptionShowMore, setIsProductDesriptionShowMore] =
//     useState(false);
//   const [isHowToUseShowMore, setIsHowToUseShowMore] = useState(false);
//
//   const [productDescriptionContent, setProductDescriptionContent] =
//     useState('');
//   const [howToUseContent, setHowToUseContent] = useState('');
//
//   const scrollRef = useRef(null);
//   const tabRef = useRef(null);
//   const descriptionRef = useRef(null);
//   const howToUseRef = useRef(null);
//   const reviewsRef = useRef(null);
//
//   const tabs = [
//     t('product_detail.itemDescription'),
//     t('product_detail.howToUse'),
//     t('product_detail.reviews'),
//     ...(showRecommendation ? ['recommendations'] : []),
//   ];
//
//   const Data = [
//     {
//       title: 'Description',
//       data: [{type: 'description', data: product?.description?.html}],
//     },
//     {
//       title: 'How To Use',
//       data: [{type: 'how to use', data: product?.how_to_use}],
//     },
//     {
//       title: 'Reviews',
//       data: [{type: 'reviews', data: productReviews}],
//     },
//   ];
//
//   // const handleScroll = event => {
//   //   const y = event.nativeEvent.contentOffset.y;
//   //   const thresholds = [
//   //     descriptionRef.current.offsetTop,
//   //     howToUseRef.current.offsetTop,
//   //     reviewsRef.current.offsetTop,
//   //   ];
//   //   const activeIndex = thresholds.findIndex(threshold => y < threshold);
//   //   setActiveTab(activeIndex === -1 ? thresholds.length - 1 : activeIndex);
//   // };
//
//   const scrollToTop = () => {
//     scrollRef.current?.scrollTo({y: 0, animated: true});
//   };
//
//   useEffect(() => {
//     if (
//       product?.description?.html !== null &&
//       product?.description?.html !== ''
//     ) {
//       const descriptionhtmlContent = product?.description?.html;
//
//       const parts = descriptionhtmlContent.split('<br />', 4);
//       if (parts.length > 3) {
//         setIsProductDesriptionShowMore(true);
//       }
//
//       if (parts.length > 3 || isProductDesriptionShowMore) {
//         if (expandProductDescription) {
//           setProductDescriptionContent(descriptionhtmlContent);
//         } else {
//           setProductDescriptionContent(
//             parts.slice(0, 3).join('<br />' + '<br/>...'),
//           );
//         }
//       } else {
//         setProductDescriptionContent(descriptionhtmlContent);
//       }
//     }
//     console.log('product?.description?.html', productDescriptionContent);
//   }, [expandProductDescription, product?.description?.html]);
//
//   useEffect(() => {
//     if (product?.how_to_use !== null && product?.how_to_use !== '') {
//       const howToUseContent = product?.how_to_use;
//
//       const howtoUseparts = howToUseContent.split('<br />', 4);
//       if (howtoUseparts.length > 3) {
//         setIsHowToUseShowMore(true);
//       }
//
//       if (howtoUseparts.length > 3 || isHowToUseShowMore) {
//         if (expandedHowToUseSections) {
//           setHowToUseContent(howToUseContent);
//         } else {
//           setProductDescriptionContent(
//             howtoUseparts.slice(0, 3).join('<br />' + '<br/>...'),
//           );
//         }
//       } else {
//         setHowToUseContent(howToUseContent);
//       }
//     }
//   }, [expandedHowToUseSections, product?.how_to_use]);
//
//   const renderDesriptionContent = () => {
//     return (
//       <CustomView>
//         <RenderHTML
//           tagsStyles={CmsStyles.tagStylesPrivacyPolicy}
//           htmlBlock={productDescriptionContent}
//           classesStyles={CmsStyles.classesStylesPrivacyPolicy}
//         />
//         <RenderIf condition={isProductDesriptionShowMore}>
//           <CustomView
//             onPress={() =>
//               setExpandProductDescription(!expandProductDescription)
//             }
//             flex
//             horizontalCenter
//             paddingHorizontal={10}>
//             {expandProductDescription ? (
//               <CustomView horizontalCenter row>
//                 <Text style={{color: Colors.PRIMARY}}>Show Less</Text>
//                 <Image
//                   style={{width: 16, height: 16}}
//                   source={require('@app/assets/images/arrow_up.png')}
//                 />
//               </CustomView>
//             ) : (
//               <CustomView horizontalCenter row>
//                 <Text style={{color: Colors.PRIMARY}}>Show More</Text>
//                 <Image
//                   style={{width: 16, height: 16}}
//                   source={require('@app/assets/images/arrow_down.png')}
//                 />
//               </CustomView>
//             )}
//           </CustomView>
//         </RenderIf>
//         <CustomView
//           style={{
//             borderColor: ColorsPaper.grey200,
//             borderBottomWidth: normalize(1),
//             marginTop: 10,
//           }}
//         />
//       </CustomView>
//     );
//   };
//
//   const renderHowtoUseContent = () => {
//     return (
//       <CustomView>
//         <RenderHTML
//           tagsStyles={CmsStyles.tagStylesPrivacyPolicy}
//           htmlBlock={howToUseContent}
//           classesStyles={CmsStyles.classesStylesPrivacyPolicy}
//         />
//         <RenderIf condition={isHowToUseShowMore}>
//           <CustomView
//             onPress={() =>
//               setExpandProductDescription(!expandedHowToUseSections)
//             }
//             flex
//             horizontalCenter
//             paddingHorizontal={30}>
//             {expandedHowToUseSections ? (
//               <CustomView row>
//                 <Text style={{color: Colors.PRIMARY}}>Show Less</Text>
//                 <Image
//                   style={{width: 16, height: 16}}
//                   source={require('@app/assets/images/arrow_up.png')}
//                 />
//               </CustomView>
//             ) : (
//               <CustomView row>
//                 <Text style={{color: Colors.PRIMARY}}>Show Less</Text>
//                 <Image
//                   style={{width: 16, height: 16}}
//                   source={require('@app/assets/images/arrow_down.png')}
//                 />
//               </CustomView>
//             )}
//           </CustomView>
//         </RenderIf>
//         <CustomView
//           style={{
//             borderColor: ColorsPaper.grey200,
//             borderBottomWidth: 1,
//             marginTop: 10,
//           }}
//         />
//       </CustomView>
//     );
//   };
//
//   const renderReviewsContent = productReviews => {
//     // console.log('productReviews', productReviews);
//     if (totalReview > 0) {
//       return (
//         <CustomView paddingHorizontal={20} paddingTop={10}>
//           <CustomView spaceBetween row>
//             <Text style={{fontSize: 18, fontWeight: 'bold'}}>
//               {t('product_detail.reviews')}
//             </Text>
//             <RenderIf condition={totalReview > 2}>
//               <TouchableOpacity onPress={goToProductReview}>
//                 <CustomView row horizontalCenter>
//                   <Text
//                     style={{
//                       fontSize: 12,
//                       marginLeft: 5,
//                       color: Colors.GRAY_DARK,
//                     }}>
//                     See More
//                   </Text>
//                   <Image
//                     source={require('@app/assets/images/arrow_right_gray.png')}
//                     style={{width: 16, height: 16}}
//                   />
//                 </CustomView>
//               </TouchableOpacity>
//             </RenderIf>
//           </CustomView>
//           <CustomView flex row horizontalCenter marginVertical={16}>
//             <CustomView marginRight={5}>
//               <Rating sizeIcon={12} count={starRatingProduct} />
//             </CustomView>
//             <Text small color={Colors.BLACK}>
//               {starRatingProduct}
//             </Text>
//             <Text small color={Colors.BLACK} style={{marginLeft: 10}}>
//               {totalReview} {t('product_detail.reviews')}
//             </Text>
//           </CustomView>
//           {renderReviewItem(productReviews)}
//         </CustomView>
//       );
//     } else {
//       return (
//         <CustomView paddingHorizontal={30}>
//           <Text>{t('product_detail.noReviews')}</Text>
//         </CustomView>
//       );
//     }
//   };
//
//   const renderReviewItem = data => {
//     return data.slice(0, 2).map((review, index) => {
//       return (
//         <CustomView paddingVertical={5} key={index}>
//           <CustomView row spaceBetween>
//             <Text style={{fontWeight: 'bold'}}>{review.nickname}</Text>
//             <Text style={{fontSize: 12, color: Colors.GRAY_DARK}}>
//               {formatDateNative(review.created_at)}
//             </Text>
//           </CustomView>
//           <CustomView row marginVertical={8}>
//             <CustomView marginRight={5}>
//               <Rating sizeIcon={12} count={review.ratings[0]?.value} />
//             </CustomView>
//             <Text style={{color: Colors.BLACK, fontSize: 12, marginLeft: 5}}>
//               5 {review.ratings[0]?.value}
//             </Text>
//           </CustomView>
//           <Text style={{color: Colors.GRAY_DARK}} numberOfLines={3}>
//             {review.detail}
//           </Text>
//         </CustomView>
//       );
//     });
//   };
//
//   const formatDateNative = dateString => {
//     const date = new Date(dateString);
//     const day = date.getDate(); // 获取日
//     const months = [
//       'Jan',
//       'Feb',
//       'Mar',
//       'Apr',
//       'May',
//       'Jun',
//       'Jul',
//       'Aug',
//       'Sep',
//       'Oct',
//       'Nov',
//       'Dec',
//     ];
//     const month = months[date.getMonth()]; // 获取月份并转换为英文缩写
//     const year = date.getFullYear(); // 获取年
//
//     return `${day} ${month} ${year}`; // 返回格式化后的日期
//   };
//
//   const goToProductReview = () => {
//     console.log('go to product review, sku :' + product.sku);
//     navigateTo(modules.product_review.enable, modules.product_review.name, {
//       skuProduct: product.sku,
//     });
//   };
//
//   const strickyHeader = title => {
//     return (
//       <View style={{flex: 1, backgroundColor: 'white'}}>
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//           }}>
//           <View
//             style={{
//               flex: 1,
//               padding: 16,
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column',
//             }}>
//             <Text
//               numberOfLines={1}
//               style={{
//                 fontWeight: 'bold',
//                 fontSize: 16,
//                 color: title === 'description' ? Colors.PRIMARY : Colors.BLACK,
//               }}>
//               {t('product_detail.itemDescription')}
//             </Text>
//             <RenderIf condition={title === 'description'}>
//               <View
//                 style={{
//                   height: 2,
//                   width: '100%',
//                   backgroundColor: Colors.PRIMARY,
//                   marginTop: 10,
//                 }}
//               />
//             </RenderIf>
//           </View>
//           <View
//             style={{
//               padding: 16,
//               flex: 1,
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column',
//             }}>
//             <Text
//               numberOfLines={1}
//               style={{
//                 fontWeight: 'bold',
//                 fontSize: 16,
//                 maxlines: 1,
//                 color: title === 'how to use' ? Colors.PRIMARY : Colors.BLACK,
//               }}>
//               {t('product_detail.howToUse')}
//             </Text>
//             <RenderIf condition={title === 'how to use'}>
//               <View
//                 style={{
//                   height: 2,
//                   width: '100%',
//                   backgroundColor: Colors.PRIMARY,
//                   marginTop: 10,
//                 }}
//               />
//             </RenderIf>
//           </View>
//           <View
//             style={{
//               padding: 16,
//               flex: 1,
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column',
//             }}>
//             <Text
//               numberOfLines={1}
//               style={{
//                 fontWeight: 'bold',
//                 fontSize: 16,
//                 color: title === 'reviews' ? Colors.PRIMARY : Colors.BLACK,
//               }}>
//               {t('product_detail.reviews')}
//             </Text>
//             <RenderIf condition={title === 'reviews'}>
//               <View
//                 style={{
//                   height: 2,
//                   width: '100%',
//                   backgroundColor: Colors.PRIMARY,
//                   marginTop: 10,
//                 }}
//               />
//             </RenderIf>
//           </View>
//         </View>
//       </View>
//     );
//   };
//
//   const renderSectionItem = () => {
//     return (
//       <View>
//         <CustomView ref={descriptionRef} paddingTop={15}>
//           {product?.description?.html !== '' ? (
//             renderDesriptionContent()
//           ) : (
//             <CustomView paddingHorizontal={30}>
//               <Text>{t('product_detail.notAvailableYet')}</Text>
//             </CustomView>
//           )}
//         </CustomView>
//
//         <CustomView ref={howToUseRef} paddingTop={15}>
//           {product?.how_to_use !== null ? (
//             renderHowtoUseContent()
//           ) : (
//             <CustomView paddingHorizontal={30}>
//               <Text>{t('product_detail.notAvailableYet')}</Text>
//             </CustomView>
//           )}
//         </CustomView>
//
//         <View ref={reviewsRef}>
//           {renderReviewsContent(productReviews)}
//           <AddReviewBlock
//             t={t}
//             product={product}
//             refetchProductReviews={refetchProductReviews}
//           />
//         </View>
//       </View>
//     );
//   };
//
//   return (
//     <View style={{flex: 1, backgroundColor: 'white'}}>
//       {/*<SectionList*/}
//       {/*  ref={setionListRef}*/}
//       {/*  sections={Data}*/}
//       {/*  keyExtractor={(item, index) => item + index}*/}
//       {/*  renderItem={({item}) => renderSectionItem({item})}*/}
//       {/*  renderSectionHeader={({section: {title}}) => strickyHeader(title)}*/}
//       {/*  stickySectionHeadersEnabled={true}*/}
//       {/*/>*/}
//
//       {strickyHeader()}
//       {renderSectionItem()}
//
//       {/*<ScrollView*/}
//       {/*  ref={scrollRef}*/}
//       {/*  onScroll={handleScroll}*/}
//       {/*  stickyHeaderIndices={[0]}*/}
//       {/*  scrollEventThrottle={16}>*/}
//       {/*  {strickyHeader()}*/}
//
//       {/*  {showRecommendation && (*/}
//       {/*    <View ref={recommendationRef}>*/}
//       {/*      <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>*/}
//       {/*        Recommendations*/}
//       {/*      </Text>*/}
//       {/*      <Text>*/}
//       {/*        Here are some product recommendations based on your browsing*/}
//       {/*        history...*/}
//       {/*      </Text>*/}
//       {/*    </View>*/}
//       {/*  )}*/}
//       {/*</ScrollView>*/}
//       {showBackToTop && (
//         <TouchableOpacity
//           style={{
//             position: 'absolute',
//             right: 20,
//             bottom: 20,
//             backgroundColor: 'rgba(0, 0, 0, 0.7)',
//             borderRadius: 30,
//             width: 60,
//             height: 60,
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//           onPress={scrollToTop}>
//           <Image
//             source={require('@app/assets/images/back_to_top.png')}
//             style={{height: 20, width: 20}}
//           />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };
//
// export default withProfiler(ProductDetailDescription, {
//   name: 'product_detail_description_block',
// });
