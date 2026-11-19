import CustomView from '@app/components/CustomView';
import React, { useEffect, useMemo, useState } from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import { GET_PRODUCT_REVIEWS } from '@app/_modules/product_detail/services/schema';
import NavBar from '@app/components/NavBar';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@app/styles';
import Rating from '@app/components/Rating';
import { MD2Colors as ColorsPaper } from 'react-native-paper';
import RenderIf from '@app/components/RenderIf';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProductReviewsPage = props => {
  const { skuProduct } = props.route.params;
  const [tempReviewData, setTempReviewData] = useState([]);
  const [totalReview, setTotalReview] = useState(0);
  const [productReviews, setProductReviews] = useState([]); // 设置评价数据
  const [currentPageReview, setCurrentPageReview] = useState(1); // load more page index
  const [sortType, setSortType] = useState('Comprehensive'); //Recent
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState([]);

  const pageSizeReview = 20;

  const { data: productReviewsData, onRefetchData: refetchProductReviews } =
    useCustomQuery({
      schema: GET_PRODUCT_REVIEWS,
      useInitData: false,
      variables: {
        sku: skuProduct,
        currentPage: currentPageReview,
        pageSize: pageSizeReview,
      },
    });

  const getMoreReviews = async () => {
    const availablePageReview = totalReview / pageSizeReview;
    if (availablePageReview > currentPageReview) {
      const newCurrentPageReview = currentPageReview + 1;
      const reviewsData = await refetchProductReviews({
        params: {
          sku: skuProduct,
          currentPage: newCurrentPageReview,
          pageSize: pageSizeReview,
        },
        paramsOpt: { isReturn: true },
      });
      const newProductReviews = productReviews.concat(
        reviewsData?.data?.getProductReviews?.items,
      );
      setCurrentPageReview(newCurrentPageReview);
      setProductReviews(newProductReviews);
    }
  };

  useEffect(() => {
    if (productReviewsData && productReviewsData?.data) {
      setProductReviews(
        productReviewsData?.data?.getProductReviews?.items || [],
      );
      setTempReviewData(
        productReviewsData?.data?.getProductReviews?.items || [],
      );
    }
    setTotalReview(
      productReviewsData?.data?.getProductReviews?.totalCount || 0,
    );
    // }
    // mokeData();
  }, [productReviewsData]);

  useEffect(() => {
    console.log('skuProduct', skuProduct);
    if (skuProduct) {
      refetchProductReviews({
        params: {
          sku: skuProduct,
          currentPage: currentPageReview,
          pageSize: pageSizeReview,
        },
      });
    }
  }, [skuProduct]);

  useEffect(() => {
    console.log('setSortType:' + sortType);
    if (sortType === 'Recent') {
      setProductReviews(
        [...productReviews].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );
    } else if (sortType === 'Comprehensive') {
      setProductReviews([...tempReviewData]);
    }
  }, [sortType]);

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: tempReviewData.filter(item => {
        // 检查 ratings 是否为数组且不为空
        return (
          Array.isArray(item.ratings) &&
          item.ratings.length > 0 &&
          item.ratings[0] === stars
        );
      }).length,
    }));
  }, [tempReviewData]);

  const toggleRating = stars => {
    setSelectedRatings(prevState =>
      prevState.includes(stars)
        ? prevState.filter(rating => rating !== stars)
        : [...prevState, stars],
    );
  };

  const filterStarProductView = () => {
    if (selectedRatings.length === 0) {
      return productReviews;
    }
    return tempReviewData.filter(
      item =>
        Array.isArray(item.ratings) &&
        item.ratings.length > 0 &&
        selectedRatings.includes(item.ratings[0]),
    );
  };

  const clickApply = () => {
    setProductReviews(filterStarProductView);
    setFilterVisible(false);
  };

  // const mokeData = () => {
  //   const moreReview = [];
  //   for (let rating = 5; rating > 0; rating--) {
  //     for (let i = 0; i < 2; i++) {
  //       moreReview.push({
  //         entity_pk_value: 26866 + i, // 唯一的主键值
  //         id: i + (rating - 1) * 10, // 唯一的ID
  //         nickname: 'nickname' + i,
  //         created_at: '2022-01-0' + (i + 1) + ' 08:12:00',
  //         ratings: [rating],
  //         detail: 'review detail' + i,
  //         title: 'moke data review title' + i,
  //       });
  //     }
  //   }
  //   console.log('moreReview', moreReview);
  //   setProductReviews([...productReviews, ...moreReview]);
  //   setTempReviewData([...productReviews, ...moreReview]);
  // };

  const formatDateNative = dateString => {
    const date = new Date(dateString);
    const day = date.getDate(); // 获取日
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[date.getMonth()]; // 获取月份并转换为英文缩写
    const year = date.getFullYear(); // 获取年

    return `${day} ${month} ${year}`; // 返回格式化后的日期
  };

  const itmeReview = ({ review }) => {
    return (
      <CustomView paddingVertical={5}>
        <CustomView row spaceBetween>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>
            {review.nickname}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.GRAY_DARK }}>
            {formatDateNative(review.created_at)}
          </Text>
        </CustomView>
        <CustomView row marginVertical={8}>
          <CustomView marginRight={5}>
            <Rating sizeIcon={12} count={review.ratings[0].value} />
          </CustomView>
          <Text style={{ color: Colors.BLACK, fontSize: 12, marginLeft: 5 }}>
            {review.ratings[0].value}
          </Text>
        </CustomView>
        <Text style={{ color: Colors.GRAY_DARK, fontSize: 14 }} numberOfLines={3}>
          {review.detail}
        </Text>
        <CustomView
          style={{
            borderColor: ColorsPaper.grey200,
            borderBottomWidth: 1,
            marginTop: 10,
          }}
        />
      </CustomView>
    );
  };

  const clickSort = () => {
    if (!sortVisible) {
      setSortVisible(true);
    }
  };
  const closeSortModal = () => {
    setSortVisible(false);
  };

  const clickFilter = () => {
    if (!filterVisible) {
      setFilterVisible(true);
    }
  };
  const closeFilterModal = () => {
    setFilterVisible(false);
  };

  const changeFilterType = SortType => {
    setSortType(SortType);
    closeSortModal();
  };

  const renderSortModalContent = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            backgroundColor: Colors.WHITE,
            padding: 16,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 23,
            }}>
            <Text
              style={{
                flex: 1,
                color: Colors.BLACK,
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Sorting
            </Text>
            <TouchableOpacity
              onPress={closeSortModal}
              style={{ alignItems: 'flex-end' }}>
              <Image
                source={require('@app/assets/images/delete.png')}
                style={{ width: 14, height: 14 }}
              />
            </TouchableOpacity>
          </View>

          <CustomView
            style={{
              borderColor: ColorsPaper.grey200,
              borderBottomWidth: 1,
              marginTop: 10,
            }}
          />
          <TouchableOpacity onPress={() => changeFilterType('Recent')}>
            <CustomView
              row
              verticalCenter
              horizontalCenter
              spaceBetween
              height={33}>
              <Text
                style={{
                  color: sortType === 'Recent' ? Colors.PRIMARY : Colors.BLACK,
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Recent
              </Text>
              <RenderIf condition={sortType === 'Recent'}>
                <Image
                  source={require('@app/assets/images/right.png')}
                  style={{ width: 14, height: 14, alignSelf: 'flex-end' }}
                />
              </RenderIf>
            </CustomView>
          </TouchableOpacity>
          <CustomView
            style={{
              borderColor: ColorsPaper.grey200,
              borderBottomWidth: 1,
              marginTop: 10,
            }}
          />
          <TouchableOpacity onPress={() => changeFilterType('Comprehensive')}>
            <CustomView
              row
              horizontalCenter
              verticalCenter
              spaceBetween
              marginBottom={10}
              height={33}>
              <Text
                style={{
                  color:
                    sortType === 'Comprehensive'
                      ? Colors.PRIMARY
                      : Colors.BLACK,
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Comprehensive
              </Text>
              <RenderIf condition={sortType === 'Comprehensive'}>
                <Image
                  source={require('@app/assets/images/right.png')}
                  style={{ width: 14, height: 14, alignSelf: 'flex-end' }}
                />
              </RenderIf>
            </CustomView>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSortUI = () => {
    return (
      <TouchableOpacity onPress={clickSort}>
        <CustomView
          row
          borderRadius={15}
          paddingRight={10}
          backgroundColor={Colors.GRAY_LIGHT}
          height={32}>
          <CustomView row horizontalCenter marginLeft={10}>
            <Text style={{ fontSize: 12, color: Colors.BLACK }}>
              Sort:{sortType}
            </Text>
            <Image
              source={require('@app/assets/images/arrow_down_black.png')}
              style={{ width: 14, height: 14 }}
            />
          </CustomView>
        </CustomView>
      </TouchableOpacity>
    );
  };

  const renderFilterUI = () => {
    return (
      <TouchableOpacity onPress={clickFilter}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={require('@app/assets/images/filter_horizontal.png')}
            style={{ width: 24, height: 24 }}
          />
          <Text
            style={{
              fontSize: 14,
              paddingLeft: 5,
              color: Colors.PRIMARY,
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
            Filter
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModalUI = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            backgroundColor: Colors.WHITE,
            padding: 16,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 23,
            }}>
            <Text
              style={{
                flex: 1,
                color: Colors.BLACK,
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Filter
            </Text>
            <TouchableOpacity
              onPress={closeFilterModal}
              style={{ alignItems: 'flex-end' }}>
              <Image
                source={require('@app/assets/images/delete.png')}
                style={{ width: 14, height: 14 }}
              />
            </TouchableOpacity>
          </View>
          <CustomView
            style={{
              borderColor: ColorsPaper.grey200,
              borderBottomWidth: 1,
              marginTop: 10,
            }}
          />
          <Text style={{ fontSize: 14, marginTop: 10 }}>Star</Text>
          {ratingCounts.map(rating => (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                marginTop: 10,
              }}
              onPress={() => {
                toggleRating(rating.stars);
              }}>
              <Image
                source={
                  selectedRatings.includes(rating.stars)
                    ? require('@app/assets/images/checkbox_checked.png')
                    : require('@app/assets/images/checkbox_uncheck.png')
                }
                style={{ width: 24, height: 24 }}
              />
              {[...Array(rating.stars)].map((_, index) => (
                <Image
                  source={require('@app/assets/images/star_full.png')}
                  style={{ width: 12, height: 12, marginLeft: 10 }}
                  key={index}
                />
              ))}
              <Text style={{ fontSize: 14, marginLeft: 10 }}>{rating.count}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <CustomView
              onPress={() => setSelectedRatings([])}
              flex
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: Colors.PRIMARY,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
                height: 48,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: Colors.PRIMARY,
                }}>
                Clear All
              </Text>
            </CustomView>

            <CustomView
              onPress={() => clickApply()}
              flex
              style={{
                backgroundColor: Colors.PRIMARY,
                borderWidth: 1,
                borderColor: Colors.PRIMARY,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
                height: 48,
              }}>
              <Text
                style={{ color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' }}>
                Apply
              </Text>
            </CustomView>
          </View>
        </View>
      </View>
    );
  };

  return (
    <CustomView>
      <NavBar
        useWhite
        useShadow={false}
        useBack
        center={true}
        title={'Review(' + totalReview + ')'}
      />
      <CustomView
        row
        verticalCenter
        horizontalCenter
        spaceBetween
        style={{ paddingRight: 10, paddingLeft: 10, height: 48 }}>
        {renderSortUI()}
        {renderFilterUI()}
      </CustomView>
      <FlatList
        data={productReviews}
        renderItem={({ item }) => itmeReview({ review: item })}
        onEndReached={getMoreReviews}
        onEndReachedThreshold={0.5}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
      />
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={sortVisible}
        onRequestClose={closeSortModal}>
        {renderSortModalContent()}
      </Modal>
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={filterVisible}
        onRequestClose={closeFilterModal}>
        {renderFilterModalUI()}
      </Modal>
    </CustomView>
  );
};

export default ProductReviewsPage;
