import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  Button,
  Alert
} from 'react-native'

const PaymentRequest = require('react-native-payments').PaymentRequest;

const DETAILS = {
  id: 'basic-example',
  displayItems: [
    {
      label: 'Movie Ticket',
      amount: { currency: 'USD', value: '15.00' }
    },
    {
      label: 'Grocery',
      amount: { currency: 'USD', value: '5.00' }
    }
  ],
  total: {
    label: 'Enappd Store',
    amount: { currency: 'USD', value: '20.00' }
  }
};

const METHOD_DATA = [{
  supportedMethods: ['apple-pay', 'android-pay'],
  data: {
    merchantIdentifier: 'merchant.apple.test',
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    countryCode: 'FR',
    currencyCode: 'EUR',
    environment: 'TEST', // defaults to production
    paymentMethodTokenizationParameters: {
      tokenizationType: 'NETWORK_TOKEN',
      parameters: {
        publicKey: 'your-pubic-key'
      }
    }
  }
}];

const OPTIONS = {
  //requestPayerName: true,
  //requestPayerPhone: true,
  //requestPayerEmail: true,
  //requestShipping: true
};

const paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS, OPTIONS);

paymentRequest.addEventListener('shippingaddresschange', e => {
  const updatedDetails = getUpdatedDetailsForShippingAddress(paymentRequest.shippingAddress);

  e.updateWith(updatedDetails);
});

paymentRequest.addEventListener('shippingoptionchange', e => {
  const updatedDetails = getUpdatedDetailsForShippingOption(paymentRequest.shippingOption);

  e.updateWith(updatedDetails);
});



const { width, height } = Dimensions.get('window')

export default class App extends Component {

  state = {
    profileIndex: 0,
    style: 'black',
    style2: 'whiteOutline',
    type: 'donate',
  }

  check = () => {
    paymentRequest.canMakePayments().then((canMakePayment) => {
      if (canMakePayment) {
        Alert.alert(
          'Apple Pay',
          'Apple Pay is available in this device'
        );
      }
    })
  }

  pay = () => {

    const paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS, OPTIONS);

    paymentRequest.canMakePayments().then((canMakePayment) => {
      if (canMakePayment) {
        console.log('Can Make Payment')
        paymentRequest.show()
          .then(paymentResponse => {
            // Your payment processing code goes here

            paymentResponse.complete('success');
          }).catch(e => {
            if (e.toString().includes("AbortError")) {
              return new Error("Aborted");
            }

            paymentRequest.abort();
          });
      }
      else {
        console.log('Cant Make Payment')
      }
    })
  }

  nextCard = () => {
    this.setState({ profileIndex: this.state.profileIndex + 1 })
  }

  payCard = () => {
    this.pay();
  }

  render() {
    const { profileIndex } = this.state
    return (
      <View style={{ flex: 1 }}>

        {profiles.slice(profileIndex, profileIndex + 4).reverse().map((profile) => {
          return (
            <Card
              key={profile.id}
              profile={profile}
              onSwipeOff={this.nextCard}
              onSwipe={this.payCard}
            />
          )
        })}

      </View>
    )
  }
}

class Card extends Component {
  UNSAFE_componentWillMount() {
    this.pan = new Animated.ValueXY()

    this.cardPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: this.pan.x, dy: this.pan.y },
      ],
        { useNativeDriver: false }),
      onPanResponderRelease: (e, { dx }) => {
        const absDx = Math.abs(dx)
        const direction = absDx / dx

        if (absDx > 120) {

          console.log("direction", direction);

          if (direction == -1) // left
          {
            Animated.decay(this.pan, {
              velocity: { x: 3 * direction, y: 0 },
              deceleration: 0.995,
              useNativeDriver: true
            }).start(this.props.onSwipeOff)
          }
          else // right
          {
            Animated.spring(this.pan, {
              velocity: { x: 2 * direction, y: 0 },
              deceleration: 2,
              useNativeDriver: true
            }).start(this.props.onSwipe)
          }
        } else { // click
          Animated.spring(this.pan, {
            toValue: { x: 0, y: 0 },
            friction: 4.5,
            useNativeDriver: true
          }).start()
        }
      },
    })
  }

  render() {
    const { name, bio, id, image } = this.props.profile

    const rotateCard = this.pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['10deg', '0deg', '-10deg'],
    })
    const animatedStyle = {
      transform: [
        { translateX: this.pan.x },
        { translateY: this.pan.y },
        { rotate: rotateCard },
      ],
    }

    return (
      <Animated.View
        {...this.cardPanResponder.panHandlers}
        style={[styles.card, animatedStyle]}>
        <Image
          style={{ flex: 1 }}
          source={{ uri: image }}
        />
        <View style={{ margin: 20 }}>
          <Text style={{ fontSize: 20 }}>{name}</Text>
          <Text style={{ fontSize: 15, color: 'darkgrey' }}>{bio}</Text>
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width - 20,
    height: height * 0.7,
    top: (height * 0.3) / 2,
    overflow: 'hidden',
    backgroundColor: 'white',
    margin: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 8,
  },
})

const profiles = [
  {
    id: 1001,
    bio: 'Category 1',
    name: 'Product 1',
    image: 'https://picsum.photos/400?image=780',
    productStock: true,
    productPrice: 17159.389440190174,
    salePrice: 17159.389440190174
  },
  {
    id: 1002,
    bio: 'Category 4',
    name: 'Product 2',
    image: 'https://picsum.photos/400?image=871',
    productStock: true,
    productPrice: 98954.39768138637,
    salePrice: 98954.39768138637
  },
  {
    id: 1003,
    bio: 'Category 3',
    name: 'Product 3',
    image: 'https://picsum.photos/400?image=888',
    productStock: false,
    productPrice: 45217.576607475385,
    salePrice: 9043.515321495077
  },
  {
    id: 1004,
    bio: 'Category 3',
    name: 'Product 4',
    image: 'https://picsum.photos/400?image=430',
    productStock: false,
    productPrice: 66413.98917846696,
    salePrice: 19924.196753540087
  },
  {
    id: 1005,
    bio: 'Category 1',
    name: 'Product 5',
    image: 'https://picsum.photos/400?image=234',
    productStock: false,
    productPrice: 84550.85123747413,
    salePrice: 84550.85123747413
  },
  {
    id: 1006,
    bio: 'Category 2',
    name: 'Product 6',
    image: 'https://picsum.photos/400?image=269',
    productStock: true,
    productPrice: 11993.330587404438,
    salePrice: 1918.93289398471
  },
  {
    id: 1007,
    bio: 'Category 3',
    name: 'Product 7',
    image: 'https://picsum.photos/400?image=293',
    productStock: true,
    productPrice: 84359.34389174462,
    salePrice: 84359.34389174462
  },
  {
    id: 1008,
    bio: 'Category 4',
    name: 'Product 8',
    image: 'https://picsum.photos/400?image=67',
    productStock: true,
    productPrice: 22318.57963606443,
    salePrice: 22318.57963606443
  },
  {
    id: 1009,
    bio: 'Category 1',
    name: 'Product 9',
    image: 'https://picsum.photos/400?image=169',
    productStock: false,
    productPrice: 92026.53746744258,
    salePrice: 18405.30749348852
  },
  {
    id: 1010,
    bio: 'Category 2',
    name: 'Product 10',
    image: 'https://picsum.photos/400?image=714',
    productStock: true,
    productPrice: 13187.6665062836,
    salePrice: 13187.6665062836
  },
  {
    id: 1011,
    bio: 'Category 2',
    name: 'Product 11',
    image: 'https://picsum.photos/400?image=377',
    productStock: true,
    productPrice: 63547.96278598951,
    salePrice: 63547.96278598951
  },
  {
    id: 1012,
    bio: 'Category 2',
    name: 'Product 12',
    image: 'https://picsum.photos/400?image=119',
    productStock: false,
    productPrice: 23209.92207882374,
    salePrice: 8819.77038995302
  },
  {
    id: 1013,
    bio: 'Category 2',
    name: 'Product 13',
    image: 'https://picsum.photos/400?image=533',
    productStock: false,
    productPrice: 16557.33957174835,
    salePrice: 8113.096390156692
  },
  {
    id: 1014,
    bio: 'Category 2',
    name: 'Product 14',
    image: 'https://picsum.photos/400?image=404',
    productStock: true,
    productPrice: 59959.4775879008,
    salePrice: 59959.4775879008
  },
  {
    id: 1015,
    bio: 'Category 2',
    name: 'Product 15',
    image: 'https://picsum.photos/400?image=875',
    productStock: false,
    productPrice: 11365.686813134895,
    salePrice: 11365.686813134895
  },
  {
    id: 1016,
    bio: 'Category 3',
    name: 'Product 16',
    image: 'https://picsum.photos/400?image=111',
    productStock: true,
    productPrice: 53258.237730522706,
    salePrice: 21303.295092209082
  },
  {
    id: 1017,
    bio: 'Category 3',
    name: 'Product 17',
    image: 'https://picsum.photos/400?image=908',
    productStock: false,
    productPrice: 32678.71403678323,
    salePrice: 16012.569878023782
  },
  {
    id: 1018,
    bio: 'Category 1',
    name: 'Product 18',
    image: 'https://picsum.photos/400?image=784',
    productStock: false,
    productPrice: 62978.48717031148,
    salePrice: 62978.48717031148
  },
  {
    id: 1019,
    bio: 'Category 2',
    name: 'Product 19',
    image: 'https://picsum.photos/400?image=62',
    productStock: true,
    productPrice: 84342.45692507038,
    salePrice: 84342.45692507038
  },
  {
    id: 1020,
    bio: 'Category 2',
    name: 'Product 20',
    image: 'https://picsum.photos/400?image=311',
    productStock: false,
    productPrice: 74172.50865971099,
    salePrice: 74172.50865971099
  },
  {
    id: 1021,
    bio: 'Category 3',
    name: 'Product 21',
    image: 'https://picsum.photos/400?image=556',
    productStock: false,
    productPrice: 61614.937545219225,
    salePrice: 61614.937545219225
  },
  {
    id: 1022,
    bio: 'Category 1',
    name: 'Product 22',
    image: 'https://picsum.photos/400?image=602',
    productStock: false,
    productPrice: 21302.722160782716,
    salePrice: 10012.279415567877
  },
  {
    id: 1023,
    bio: 'Category 1',
    name: 'Product 23',
    image: 'https://picsum.photos/400?image=823',
    productStock: true,
    productPrice: 95397.56999982025,
    salePrice: 28619.270999946075
  },
  {
    id: 1024,
    bio: 'Category 4',
    name: 'Product 24',
    image: 'https://picsum.photos/400?image=538',
    productStock: true,
    productPrice: 95427.29425662241,
    salePrice: 20994.00473645693
  },
  {
    id: 1025,
    bio: 'Category 4',
    name: 'Product 25',
    image: 'https://picsum.photos/400?image=924',
    productStock: false,
    productPrice: 48881.26893479991,
    salePrice: 48881.26893479991
  },
  {
    id: 1026,
    bio: 'Category 3',
    name: 'Product 26',
    image: 'https://picsum.photos/400?image=61',
    productStock: true,
    productPrice: 25690.56057954845,
    salePrice: 25690.56057954845
  },
  {
    id: 1027,
    bio: 'Category 1',
    name: 'Product 27',
    image: 'https://picsum.photos/400?image=827',
    productStock: true,
    productPrice: 21973.848068976386,
    salePrice: 2417.1232875874025
  },
  {
    id: 1028,
    bio: 'Category 2',
    name: 'Product 28',
    image: 'https://picsum.photos/400?image=610',
    productStock: false,
    productPrice: 32965.75344574738,
    salePrice: 4944.863016862107
  },
  {
    id: 1029,
    bio: 'Category 2',
    name: 'Product 29',
    image: 'https://picsum.photos/400?image=114',
    productStock: true,
    productPrice: 11580.019362936913,
    salePrice: 11580.019362936913
  },
  {
    id: 1030,
    bio: 'Category 2',
    name: 'Product 30',
    image: 'https://picsum.photos/400?image=924',
    productStock: false,
    productPrice: 48566.88031596842,
    salePrice: 6313.694441075894
  },
  {
    id: 1031,
    bio: 'Category 3',
    name: 'Product 31',
    image: 'https://picsum.photos/400?image=94',
    productStock: false,
    productPrice: 62105.20139374521,
    salePrice: 13042.092292686493
  },
  {
    id: 1032,
    bio: 'Category 1',
    name: 'Product 32',
    image: 'https://picsum.photos/400?image=446',
    productStock: false,
    productPrice: 66322.02028843598,
    salePrice: 66322.02028843598
  },
  {
    id: 1033,
    bio: 'Category 2',
    name: 'Product 33',
    image: 'https://picsum.photos/400?image=573',
    productStock: false,
    productPrice: 82366.13930600711,
    salePrice: 82366.13930600711
  },
  {
    id: 1034,
    bio: 'Category 3',
    name: 'Product 34',
    image: 'https://picsum.photos/400?image=641',
    productStock: false,
    productPrice: 77390.29423017976,
    salePrice: 77390.29423017976
  },
  {
    id: 1035,
    bio: 'Category 3',
    name: 'Product 35',
    image: 'https://picsum.photos/400?image=550',
    productStock: false,
    productPrice: 83184.32365168538,
    salePrice: 34937.41593370786
  },
  {
    id: 1036,
    bio: 'Category 2',
    name: 'Product 36',
    image: 'https://picsum.photos/400?image=96',
    productStock: true,
    productPrice: 43954.903987449514,
    salePrice: 10109.627917113388
  },
  {
    id: 1037,
    bio: 'Category 3',
    name: 'Product 37',
    image: 'https://picsum.photos/400?image=120',
    productStock: false,
    productPrice: 96039.22574707569,
    salePrice: 96039.22574707569
  },
  {
    id: 1038,
    bio: 'Category 4',
    name: 'Product 38',
    image: 'https://picsum.photos/400?image=633',
    productStock: true,
    productPrice: 64129.965454053236,
    salePrice: 26293.285836161824
  },
  {
    id: 1039,
    bio: 'Category 3',
    name: 'Product 39',
    image: 'https://picsum.photos/400?image=855',
    productStock: true,
    productPrice: 59349.667007864155,
    salePrice: 25520.356813381586
  },
  {
    id: 1040,
    bio: 'Category 4',
    name: 'Product 40',
    image: 'https://picsum.photos/400?image=102',
    productStock: false,
    productPrice: 33085.568415037254,
    salePrice: 33085.568415037254
  },
  {
    id: 1041,
    bio: 'Category 1',
    name: 'Product 41',
    image: 'https://picsum.photos/400?image=716',
    productStock: false,
    productPrice: 69723.5368603061,
    salePrice: 69723.5368603061
  },
  {
    id: 1042,
    bio: 'Category 3',
    name: 'Product 42',
    image: 'https://picsum.photos/400?image=391',
    productStock: false,
    productPrice: 34314.8886985897,
    salePrice: 34314.8886985897
  },
  {
    id: 1043,
    bio: 'Category 1',
    name: 'Product 43',
    image: 'https://picsum.photos/400?image=621',
    productStock: true,
    productPrice: 64726.70431201955,
    salePrice: 64726.70431201955
  },
  {
    id: 1044,
    bio: 'Category 1',
    name: 'Product 44',
    image: 'https://picsum.photos/400?image=71',
    productStock: true,
    productPrice: 22827.05297519233,
    salePrice: 22827.05297519233
  },
  {
    id: 1045,
    bio: 'Category 3',
    name: 'Product 45',
    image: 'https://picsum.photos/400?image=953',
    productStock: true,
    productPrice: 15962.766785098545,
    salePrice: 15962.766785098545
  },
  {
    id: 1046,
    bio: 'Category 2',
    name: 'Product 46',
    image: 'https://picsum.photos/400?image=48',
    productStock: true,
    productPrice: 79460.73804228616,
    salePrice: 79460.73804228616
  },
  {
    id: 1047,
    bio: 'Category 4',
    name: 'Product 47',
    image: 'https://picsum.photos/400?image=200',
    productStock: false,
    productPrice: 27846.91607737584,
    salePrice: 6961.72901934396
  },
  {
    id: 1048,
    bio: 'Category 4',
    name: 'Product 48',
    image: 'https://picsum.photos/400?image=681',
    productStock: false,
    productPrice: 93294.05059628988,
    salePrice: 93294.05059628988
  },
  {
    id: 1049,
    bio: 'Category 2',
    name: 'Product 49',
    image: 'https://picsum.photos/400?image=187',
    productStock: true,
    productPrice: 82641.05599219646,
    salePrice: 82641.05599219646
  },
  {
    id: 1050,
    bio: 'Category 1',
    name: 'Product 50',
    image: 'https://picsum.photos/400?image=671',
    productStock: true,
    productPrice: 93141.01543641502,
    salePrice: 93141.01543641502
  },
  {
    id: 1051,
    bio: 'Category 1',
    name: 'Product 51',
    image: 'https://picsum.photos/400?image=554',
    productStock: false,
    productPrice: 63568.37944296003,
    salePrice: 63568.37944296003
  },
  {
    id: 1052,
    bio: 'Category 4',
    name: 'Product 52',
    image: 'https://picsum.photos/400?image=709',
    productStock: true,
    productPrice: 35563.68843222062,
    salePrice: 11380.380298310598
  },
  {
    id: 1053,
    bio: 'Category 3',
    name: 'Product 53',
    image: 'https://picsum.photos/400?image=948',
    productStock: false,
    productPrice: 88400.58616474162,
    salePrice: 19448.128956243156
  },
  {
    id: 1054,
    bio: 'Category 3',
    name: 'Product 54',
    image: 'https://picsum.photos/400?image=719',
    productStock: true,
    productPrice: 63689.531933502636,
    salePrice: 63689.531933502636
  },
  {
    id: 1055,
    bio: 'Category 1',
    name: 'Product 55',
    image: 'https://picsum.photos/400?image=145',
    productStock: false,
    productPrice: 78125.08707606746,
    salePrice: 78125.08707606746
  },
  {
    id: 1056,
    bio: 'Category 1',
    name: 'Product 56',
    image: 'https://picsum.photos/400?image=96',
    productStock: true,
    productPrice: 45848.88692023747,
    salePrice: 10086.755122452243
  },
  {
    id: 1057,
    bio: 'Category 1',
    name: 'Product 57',
    image: 'https://picsum.photos/400?image=628',
    productStock: true,
    productPrice: 16031.524601707197,
    salePrice: 16031.524601707197
  },
  {
    id: 1058,
    bio: 'Category 1',
    name: 'Product 58',
    image: 'https://picsum.photos/400?image=442',
    productStock: false,
    productPrice: 90448.07421573572,
    salePrice: 19898.57632746186
  },
  {
    id: 1059,
    bio: 'Category 4',
    name: 'Product 59',
    image: 'https://picsum.photos/400?image=141',
    productStock: false,
    productPrice: 29256.36741618419,
    salePrice: 4681.01878658947
  },
  {
    id: 1060,
    bio: 'Category 3',
    name: 'Product 60',
    image: 'https://picsum.photos/400?image=506',
    productStock: false,
    productPrice: 83027.7874343131,
    salePrice: 83027.7874343131
  },
  {
    id: 1061,
    bio: 'Category 4',
    name: 'Product 61',
    image: 'https://picsum.photos/400?image=415',
    productStock: true,
    productPrice: 53959.57536371956,
    salePrice: 25900.59617458539
  },
  {
    id: 1062,
    bio: 'Category 4',
    name: 'Product 62',
    image: 'https://picsum.photos/400?image=877',
    productStock: false,
    productPrice: 86962.53640409086,
    salePrice: 32176.13846951362
  },
  {
    id: 1063,
    bio: 'Category 3',
    name: 'Product 63',
    image: 'https://picsum.photos/400?image=300',
    productStock: false,
    productPrice: 17580.964938933932,
    salePrice: 6680.766676794894
  },
  {
    id: 1064,
    bio: 'Category 3',
    name: 'Product 64',
    image: 'https://picsum.photos/400?image=343',
    productStock: false,
    productPrice: 76199.13824456428,
    salePrice: 20573.767326032357
  },
  {
    id: 1065,
    bio: 'Category 2',
    name: 'Product 65',
    image: 'https://picsum.photos/400?image=41',
    productStock: true,
    productPrice: 40530.348928922365,
    salePrice: 14590.925614412052
  },
  {
    id: 1066,
    bio: 'Category 3',
    name: 'Product 66',
    image: 'https://picsum.photos/400?image=135',
    productStock: false,
    productPrice: 40836.33323303478,
    salePrice: 40836.33323303478
  },
  {
    id: 1067,
    bio: 'Category 4',
    name: 'Product 67',
    image: 'https://picsum.photos/400?image=200',
    productStock: true,
    productPrice: 25538.928838314216,
    salePrice: 6384.732209578554
  },
  {
    id: 1068,
    bio: 'Category 3',
    name: 'Product 68',
    image: 'https://picsum.photos/400?image=963',
    productStock: true,
    productPrice: 40727.913906817885,
    salePrice: 14254.76986738626
  },
  {
    id: 1069,
    bio: 'Category 2',
    name: 'Product 69',
    image: 'https://picsum.photos/400?image=147',
    productStock: false,
    productPrice: 77064.68831740021,
    salePrice: 10789.056364436032
  },
  {
    id: 1070,
    bio: 'Category 2',
    name: 'Product 70',
    image: 'https://picsum.photos/400?image=795',
    productStock: false,
    productPrice: 93804.56399620276,
    salePrice: 18760.912799240552
  },
  {
    id: 1071,
    bio: 'Category 1',
    name: 'Product 71',
    image: 'https://picsum.photos/400?image=794',
    productStock: true,
    productPrice: 56403.89080067494,
    salePrice: 56403.89080067494
  },
  {
    id: 1072,
    bio: 'Category 2',
    name: 'Product 72',
    image: 'https://picsum.photos/400?image=874',
    productStock: true,
    productPrice: 16035.327632775658,
    salePrice: 16035.327632775658
  },
  {
    id: 1073,
    bio: 'Category 1',
    name: 'Product 73',
    image: 'https://picsum.photos/400?image=541',
    productStock: true,
    productPrice: 11272.614467186813,
    salePrice: 4058.1412081872527
  },
  {
    id: 1074,
    bio: 'Category 3',
    name: 'Product 74',
    image: 'https://picsum.photos/400?image=611',
    productStock: false,
    productPrice: 42006.17331450585,
    salePrice: 42006.17331450585
  },
  {
    id: 1075,
    bio: 'Category 1',
    name: 'Product 75',
    image: 'https://picsum.photos/400?image=224',
    productStock: false,
    productPrice: 17470.64030655787,
    salePrice: 17470.64030655787
  },
  {
    id: 1076,
    bio: 'Category 2',
    name: 'Product 76',
    image: 'https://picsum.photos/400?image=437',
    productStock: false,
    productPrice: 64784.92241021288,
    salePrice: 30448.913532800052
  },
  {
    id: 1077,
    bio: 'Category 2',
    name: 'Product 77',
    image: 'https://picsum.photos/400?image=609',
    productStock: false,
    productPrice: 29982.918002793733,
    salePrice: 29982.918002793733
  },
  {
    id: 1078,
    bio: 'Category 1',
    name: 'Product 78',
    image: 'https://picsum.photos/400?image=850',
    productStock: true,
    productPrice: 36843.98237146807,
    salePrice: 36843.98237146807
  },
  {
    id: 1079,
    bio: 'Category 1',
    name: 'Product 79',
    image: 'https://picsum.photos/400?image=545',
    productStock: true,
    productPrice: 95849.63039586593,
    salePrice: 95849.63039586593
  },
  {
    id: 1080,
    bio: 'Category 1',
    name: 'Product 80',
    image: 'https://picsum.photos/400?image=834',
    productStock: true,
    productPrice: 50648.45580259398,
    salePrice: 50648.45580259398
  },
  {
    id: 1081,
    bio: 'Category 2',
    name: 'Product 81',
    image: 'https://picsum.photos/400?image=755',
    productStock: true,
    productPrice: 40033.95281452997,
    salePrice: 40033.95281452997
  },
  {
    id: 1082,
    bio: 'Category 3',
    name: 'Product 82',
    image: 'https://picsum.photos/400?image=962',
    productStock: false,
    productPrice: 30814.635432003142,
    salePrice: 30814.635432003142
  },
  {
    id: 1083,
    bio: 'Category 4',
    name: 'Product 83',
    image: 'https://picsum.photos/400?image=614',
    productStock: true,
    productPrice: 52248.72223436399,
    salePrice: 17242.078337340117
  },
  {
    id: 1084,
    bio: 'Category 2',
    name: 'Product 84',
    image: 'https://picsum.photos/400?image=99',
    productStock: true,
    productPrice: 19310.132238469014,
    salePrice: 19310.132238469014
  },
  {
    id: 1085,
    bio: 'Category 3',
    name: 'Product 85',
    image: 'https://picsum.photos/400?image=795',
    productStock: false,
    productPrice: 93906.32296949312,
    salePrice: 13146.885215729038
  },
  {
    id: 1086,
    bio: 'Category 3',
    name: 'Product 86',
    image: 'https://picsum.photos/400?image=851',
    productStock: false,
    productPrice: 39302.70921273502,
    salePrice: 4716.325105528202
  },
  {
    id: 1087,
    bio: 'Category 1',
    name: 'Product 87',
    image: 'https://picsum.photos/400?image=558',
    productStock: true,
    productPrice: 29632.889661537218,
    salePrice: 8297.209105230422
  },
  {
    id: 1088,
    bio: 'Category 4',
    name: 'Product 88',
    image: 'https://picsum.photos/400?image=501',
    productStock: false,
    productPrice: 97186.70281986729,
    salePrice: 97186.70281986729
  },
  {
    id: 1089,
    bio: 'Category 3',
    name: 'Product 89',
    image: 'https://picsum.photos/400?image=419',
    productStock: false,
    productPrice: 23636.117258622515,
    salePrice: 3781.7787613796027
  },
  {
    id: 1090,
    bio: 'Category 2',
    name: 'Product 90',
    image: 'https://picsum.photos/400?image=399',
    productStock: false,
    productPrice: 24514.761041670663,
    salePrice: 24514.761041670663
  },
  {
    id: 1091,
    bio: 'Category 4',
    name: 'Product 91',
    image: 'https://picsum.photos/400?image=532',
    productStock: false,
    productPrice: 53135.82867593095,
    salePrice: 53135.82867593095
  },
  {
    id: 1092,
    bio: 'Category 2',
    name: 'Product 92',
    image: 'https://picsum.photos/400?image=367',
    productStock: false,
    productPrice: 16474.549511597033,
    salePrice: 2800.673416971496
  },
  {
    id: 1093,
    bio: 'Category 1',
    name: 'Product 93',
    image: 'https://picsum.photos/400?image=105',
    productStock: false,
    productPrice: 99450.27029224017,
    salePrice: 32818.58919643926
  },
  {
    id: 1094,
    bio: 'Category 4',
    name: 'Product 94',
    image: 'https://picsum.photos/400?image=291',
    productStock: true,
    productPrice: 68254.57969445636,
    salePrice: 27984.377674727108
  },
  {
    id: 1095,
    bio: 'Category 1',
    name: 'Product 95',
    image: 'https://picsum.photos/400?image=984',
    productStock: false,
    productPrice: 32886.159019251696,
    salePrice: 11839.01724693061
  },
  {
    id: 1096,
    bio: 'Category 4',
    name: 'Product 96',
    image: 'https://picsum.photos/400?image=382',
    productStock: true,
    productPrice: 99366.19693745351,
    salePrice: 30803.521050610587
  },
  {
    id: 1097,
    bio: 'Category 3',
    name: 'Product 97',
    image: 'https://picsum.photos/400?image=875',
    productStock: true,
    productPrice: 46979.344541117585,
    salePrice: 46979.344541117585
  },
  {
    id: 1098,
    bio: 'Category 3',
    name: 'Product 98',
    image: 'https://picsum.photos/400?image=468',
    productStock: true,
    productPrice: 71598.93852977402,
    salePrice: 27923.58602661187
  },
  {
    id: 1099,
    bio: 'Category 4',
    name: 'Product 99',
    image: 'https://picsum.photos/400?image=291',
    productStock: true,
    productPrice: 87015.6593867294,
    salePrice: 40897.35991176282
  },
  {
    id: 1100,
    bio: 'Category 4',
    name: 'Product 100',
    image: 'https://picsum.photos/400?image=967',
    productStock: false,
    productPrice: 62925.37413116373,
    salePrice: 10068.059860986197
  }
]