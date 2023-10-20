<template>
  <div class="wrapper">
    <div class="sku">当前SKU名称：{{ currentSku && currentSku.name }}</div>
    <div class="sku">
      当前SKU-SpecId：{{ currentSku && currentSku.specIds }}
    </div>
    <div class="sku">
      当前SKU库存：{{ currentSku && currentSku.stock }}
    </div>
    <div
      v-for="parent in specs"
      :key="parent.spec_id"
      class="spec-group-section"
    >
      <div class="title" v-if="getSpecOptionsByDisplayedSpecList(parent.sub).length > 0">{{ parent.name }}</div>
      <div class="spec-group">
        <div
          v-for="sub in getSpecOptionsByDisplayedSpecList(parent.sub)"
          :key="sub.spec_id"
          :class="['spec', getSpecStyle(sub.spec_id)]"
          @click="onChangeSpecItem(sub.spec_id)"
        >
          <i v-if="checkSpecSoldOut(sub.spec_id)">售罄</i>
          {{ sub.name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { SkuUtil, Sku, Spec } from "./index.js";
export default {
  data() {
    return {
      skuUtil: null,
      currentSku: null,
    };
  },
  props: {
    skus: {
      type: Array,
      default: () => {
        return [
          {
            sku_id: 114803,
            cover:
              "https://wx4.sinaimg.cn/large/005O6SuGly8h6byjb8hfuj60m80m8q2y02.jpg",
            spec_id: "198615,198621,198625",
            name: "深空黑色,256GB,官方标配",
            price: {
              price: 8899,
              aft_coupon_price: 8899,
            },
            stores: [],
            stock: 1,
            state: 1,
            is_in_ins: false,
            is_soldout: false,
            is_insurance: false,
            best_coupon_id: 0,
            display_btn_title: "",
            activity_list: null,
            activity_tag_list: [],
          },
          {
            sku_id: 114811,
            cover:
              "https://wx4.sinaimg.cn/large/005O6SuGly8h6byjxe8vbj60m80m83yk02.jpg",
            spec_id: "198617,198621,198625",
            name: "金色,256GB,官方标配",
            price: {
              price: 8899,
              aft_coupon_price: 8899,
            },
            stores: [],
            stock: 1,
            state: 1,
            is_in_ins: false,
            is_soldout: false,
            is_insurance: false,
            best_coupon_id: 0,
            display_btn_title: "",
            activity_list: null,
            activity_tag_list: [],
          },
          {
            sku_id: 114814,
            cover:
              "https://wx3.sinaimg.cn/large/005O6SuGly8h6byk4rydfj60m80m8aa302.jpg",
            spec_id: "198618,198620,198625",
            name: "暗紫色,128GB,官方标配",
            price: {
              price: 7999,
              aft_coupon_price: 7999,
            },
            stores: [],
            stock: 0,
            state: 1,
            is_in_ins: false,
            is_soldout: true,
            is_insurance: false,
            best_coupon_id: 0,
            display_btn_title: "",
            activity_list: null,
            activity_tag_list: [],
          },
          {
            sku_id: 114815,
            cover:
              "https://wx2.sinaimg.cn/large/005O6SuGly8h6byk6da6bj60m80m8aa302.jpg",
            spec_id: "198618,198621,198625",
            name: "暗紫色,256GB,官方标配",
            price: {
              price: 8899,
              aft_coupon_price: 8899,
            },
            stores: [],
            stock: 10,
            state: 1,
            is_in_ins: false,
            is_soldout: false,
            is_insurance: false,
            best_coupon_id: 0,
            display_btn_title: "",
            activity_list: null,
            activity_tag_list: [],
          },
          {
            sku_id: 114816,
            cover:
              "https://wx4.sinaimg.cn/large/005O6SuGly8h6byk7rl4zj60m80m8aa302.jpg",
            spec_id: "198618,198622,198625",
            name: "暗紫色,512GB,官方标配",
            price: {
              price: 10699,
              aft_coupon_price: 10699,
            },
            stores: [],
            stock: 0,
            state: 1,
            is_in_ins: false,
            is_soldout: true,
            is_insurance: false,
            best_coupon_id: 0,
            display_btn_title: "",
            activity_list: null,
            activity_tag_list: [],
          },
        ];
      },
    },
    specs: {
      type: Array,
      default: () => {
        return [
          {
            spec_id: 198615,
            name: "颜色",
            pid: 0,
            sub: [
              {
                spec_id: 198615,
                name: "深空黑色",
                pid: 198614,
              },
              {
                spec_id: 198616,
                name: "银色",
                pid: 198614,
              },
              {
                spec_id: 198617,
                name: "金色",
                pid: 198614,
              },
              {
                spec_id: 198618,
                name: "暗紫色",
                pid: 198614,
              },
            ],
          },
          {
            spec_id: 198617,
            name: "尺寸",
            pid: 0,
            sub: [
              {
                spec_id: 198620,
                name: "128GB",
                pid: 198619,
              },
              {
                spec_id: 198621,
                name: "256GB",
                pid: 198619,
              },
              {
                spec_id: 198622,
                name: "512GB",
                pid: 198619,
              },
              {
                spec_id: 198623,
                name: "1TB",
                pid: 198619,
              },
            ],
          },
          {
            spec_id: 198618,
            name: "型号",
            pid: 0,
            sub: [
              {
                spec_id: 198625,
                name: "官方标配",
                pid: 198624,
              },
            ],
          },
        ];
      },
    },
  },
  computed: {
    displayedSpecIdList() {
      return (
        (this.skuUtil && this.currentSku && this.skuUtil.specOptions) || []
      );
    },
  },
  mounted() {
    const skus = this.skus.map(
      (sku) =>
        new Sku(
          sku.sku_id,
          sku.cover,
          sku.spec_id.split(",").map((id) => Number(id)),
          sku.stock,
          sku.name
        )
    );
    const specs = this.specs.map(
      (spec) =>
        new Spec(
          spec.spec_id,
          spec.name,
          spec.pid,
          spec.sub.map((sub) => new Spec(sub.spec_id, sub.name, sub.pid))
        )
    );
    this.skuUtil = new SkuUtil(skus, specs);
    this.currentSku = skus[0];
    this.skuUtil.resetActionableSpecIdsBySelectedList(this.currentSku.specIds);
    console.log("init spec list ", this.displayedSpecIdList);
  },
  created() {},
  destroyed() {},
  methods: {
    getSpecStyle(specId) {
      const isSpecAcvive = this.skuUtil && this.skuUtil.checkSpecAcvive(specId);
      if (isSpecAcvive) {
        return "active";
      }
      return "";
    },
    checkSpecSoldOut(specId) {
      const isSpecSoldOut = this.skuUtil && this.skuUtil.checkSpecOutOfStockBasedOnSpecCombination(specId);
      return isSpecSoldOut
    },
    onChangeSpecItem(specId) {
      const targetSku = this.skuUtil.findTargetSku(specId);
      this.currentSku = targetSku || {};
      console.log("change sku ", this.currentSku);
    },
    getSpecOptionsByDisplayedSpecList(specs) {
        return specs.filter((spec) =>this.displayedSpecIdList.includes(spec.spec_id));
    }
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  padding: 40px 20px;

  .sku {
    font-size: 32px;
  }
  .spec-group-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-top: 20px;
    .title {
      font-style: normal;
      font-size: 32px;
    }
  }
  .spec-group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    .spec {
      font-size: 28px;
      border: 1px solid #333;
      margin-right: 15px;
      padding: 5px 10px;
      position: relative;
      i {
        position: absolute;
        top: -20px;
        right: -10px;
        font-size: 10px;
        background-color: #b1afaf;
        font-style: normal;
        padding: 0 5px;
      }
    }
    .active {
      background: rgba(255, 130, 0, 0.1);
      // border: 1px solid #ff8200;
      color: #ff8200;
      border-color: #ff8200;
    }
  }
}
</style>
  