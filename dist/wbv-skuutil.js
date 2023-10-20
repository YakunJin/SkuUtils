"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.Price=class{constructor(s,e){this.price=0,this.afterCouponPrice=0,this.price=s,this.afterCouponPrice=e}},exports.Sku=class{constructor(s,e,t,c,i){this.skuId=0,this.cover="",this.specIds=[],this.stock=0,this.name="",this.skuId=s,this.cover=e,this.specIds=t,this.stock=c,this.name=i}},exports.SkuUtil=class{constructor(s,e){this.specs=[],this.skus=[],this.specsGraph=new Map,this.specOptions=[],this.currentSelectedSpecIds=[],this.skus=s,this.specs=e,this.initSpecMatrix()}initSpecMatrix(){this.skus.forEach((s=>{const e=s.specIds;let t="";for(let s=0;s<e.length;s++){let c=s+1;for(t=`${e[s]}`;c<e.length;){let s=[];const i=e[c],h=this.specs.flatMap((s=>s.sub)).find((s=>s.specId===i));if(h&&s.push(h),this.specsGraph.has(t)){const e=[...this.specsGraph.get(t),...s];this.specsGraph.set(t,e)}else this.specsGraph.set(t,s);t+=`;${e[c]}`,c++}}}))}resetActionableSpecIdsBySelectedList(s){this.currentSelectedSpecIds=s;let e=[],t=`${s[0]}`;s.forEach(((s,c)=>{c>0&&(t+=`;${s}`);const i=this.specs.findIndex((e=>e.sub.some((e=>e.specId===s))));if(0===i){const s=this.specs[i].sub.map((s=>s.specId));e=e.concat(s)}const h=this.specsGraph.get(t);h&&(e=e.concat(h.map((s=>s.specId))))})),this.specOptions=[...new Set(e)]}checkSpecAcvive(s){const e=this.currentSelectedSpecIds;return e&&e.includes(s)}checkSpecOutOfStockBasedOnSku(s){return this.skus.filter((e=>e.specIds.includes(s))).every((s=>0===s.stock))}checkSpecOutOfStockBasedOnSpecCombination(s){const e=this.specs.findIndex((e=>e.sub.some((e=>e.specId===s))));if(0===e)return this.checkSpecOutOfStockBasedOnSku(s);let t=[...this.currentSelectedSpecIds];t[e]=s;const c=this.skus.filter((s=>s.specIds.every((s=>t.includes(s)))));return 0===c.length||c.every((s=>0===s.stock))}findTargetSku(s){const e=this.specs.findIndex((e=>e.sub.some((e=>e.specId===s))));let t=[...this.currentSelectedSpecIds];t[e]=s;let c=this.skus.find((s=>s.specIds.every((s=>t.includes(s))))),i=t.slice(0,e+1).join(";");return c||(this.BFS(t,i,e+1),c=this.skus.find((s=>s.specIds.every((s=>t.includes(s)))))),this.resetActionableSpecIdsBySelectedList(t),c}BFS(s,e,t){const c=this.specsGraph.get(e);if(c&&c.length>0&&(c.forEach((c=>{c.specId===s[t]&&this.BFS(s,`${e};${c.specId}`,t+1)})),c[0])){const i=c[0].specId;s[t]=i,this.BFS(s,`${e};${i}`,t+1)}}},exports.Spec=class{constructor(s,e,t,c=[]){this.specId=0,this.name="",this.pid=0,this.sub=[],this.specId=s,this.name=e,this.pid=t,this.sub=c}};
