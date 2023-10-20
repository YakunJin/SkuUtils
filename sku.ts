
export default class Sku {
    skuId: Number = 0;
    cover: String = '';
    specIds: Array<Number> = [];
    stock: Number = 0;
    name: String = '';
    
    constructor(skuId: Number, cover: String, specIds: Array<Number>, stock: Number, name: String) {
        this.skuId = skuId;
        this.cover = cover;
        this.specIds = specIds;
        this.stock = stock;
        this.name = name;
    }
}