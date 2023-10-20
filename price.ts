export default class Price {
    price: Number = 0;
    afterCouponPrice: Number = 0;
    constructor(price: Number, afterCouponPrice: Number) {
        this.price = price;
        this.afterCouponPrice = afterCouponPrice;
    }
}