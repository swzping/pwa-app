import Controller from '@app/_modules/cart/_controller';
import ControllerCartOneStepCheckout from '@app/_modules/cart_checkout_onestep';

import {modules} from '@root/swift.config';

let CartController = Controller;
if (modules.cart_checkout_onestep.enable) {
  CartController = ControllerCartOneStepCheckout;
}

export default CartController;
