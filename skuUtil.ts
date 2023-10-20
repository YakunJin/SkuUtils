import Spec from './spec';
import Sku from './sku';
export type SpecsType = Array<Spec>;
export type SkusType = Array<Sku>;

const highLevelSpecGroupIndex = 0;
export default class SkuUtil {
    specs: SpecsType = []; //spec数组
    skus: SkusType = []; //Sku数组
    specsGraph: Map<String, Array<Spec>> = new Map(); //存储spec的有向图结构
    public specOptions: Array<Number> = []; //当前获取到的可展示spec列表
    public currentSelectedSpecIds: Array<Number> = []; //当前选择的Spec ID列表
    
    constructor(skus: SkusType, specs: SpecsType) {
        this.skus = skus;
        this.specs = specs;
        this.initSpecMatrix();
    }

    // 初始化图
    private initSpecMatrix(): void {
        this.skus.forEach(sku => {
            const specIds = sku.specIds;
            //双指针遍历当前sku下的spec id列表，生成各路径可达节点，如果已有同样key的路径则追加可达节点，举例如下：
            // SKU1: A-B-C1-D, 生成的图结构为 {'A': [B], 'A;B': [C1], 'A;B;C1': [D]}
            // SKU2: A-B-C2-D, 生成的图结构为 {'A': [B], 'A;B': [C1,C2], 'A;B;C2': [D]}
            let key = ''
            for(let i= 0; i< specIds.length; i++) {
                let left = i;
                let right = left+1;
                key = `${specIds[left]}`; 
                while(right < specIds.length) {
                    let value: Array<Spec> = [];
                    const rightSpecId = specIds[right];
                    const childSpecs = this.specs.flatMap(spec => spec.sub);
                    const rightSpec = childSpecs.find(spec => spec.specId === rightSpecId);
                    if(rightSpec) {
                        value.push(rightSpec);
                    }
                    if(this.specsGraph.has(key)) { //如果已经有，追加路径
                        const origin = this.specsGraph.get(key) as SpecsType;
                        const values = [...origin, ...value];
                        this.specsGraph.set(key, values)
                    } else {
                        this.specsGraph.set(key, value);   
                    }
                    key += `;${specIds[right]}`;
                    right ++;
                }
            }
        })
        // this.specsMatrix = Array(Number(this.specsCount) * Number(this.specsCount)).fill(0); //矩阵中每一个先设置为0
        // this.initEdges();
        // console.log('spec matrix', this.specsMatrix);
    }

    // 根据可选的每个sku，初始化有向图
    // 以sku: A-B-C-D为例，矩阵中AB，BC, CD节点会被设置为1
    // private initEdges(): void {
    //     this.skus.forEach(sku => {
    //         const specIds = sku.specIds;
    //         specIds.forEach((specId, index) => {
    //             const specIndex = this.specs.findIndex(spec => spec.specId === specId);
    //             const nextSpecId = specIds[index+1];
    //             if(nextSpecId) {
    //                 const nextSpecIndex = this.specs.findIndex(spec => spec.specId === nextSpecId);
    //                 this.specsMatrix[specIndex * Number(this.specsCount) + nextSpecIndex] = 1;
    //             }
    //         })
    //     })
    // }

    public resetActionableSpecIdsBySelectedList(specIds: Array<Number>): void {
        this.currentSelectedSpecIds = specIds;
        let specList: Array<Number> = [];
        // const specIds = sku.specIds; 
        let specPath = `${specIds[0]}`;
        specIds.forEach((skuSpecId, index) => { //循环给定sku下的spec选项
            if(index > 0) {
                specPath += `;${skuSpecId}`;
            }
            const mainSpecIndex = this.specs.findIndex(spec => spec.sub.some(sub => sub.specId === skuSpecId)); //根据skuSpecId查找对应的parent spec index
            if(mainSpecIndex === highLevelSpecGroupIndex) { //如果是第一个Spec Group
                const subSpecs = this.specs[mainSpecIndex].sub.map(sub => sub.specId); //获取第一个spec group下的所有spec
                specList = specList.concat(subSpecs); //第一个spec group下的所有spec都是可操作的
            }
            
            const reachAbleSpecIds = this.specsGraph.get(specPath); //根据skuSpecId，从图中查找该节点可达的节点
            if(reachAbleSpecIds) {
                specList = specList.concat(reachAbleSpecIds.map(spec => spec.specId))
            }
        })
        this.specOptions = [...new Set(specList)]; //去重
    }

    public checkSpecAcvive(specId: Number) {
        const specIds = this.currentSelectedSpecIds;
        return specIds && specIds.includes(specId);
    }

    public checkSpecOutOfStockBasedOnSku(specId: Number) {
        const specMatchSkus = this.skus.filter(sku => sku.specIds.includes(specId)); //根据specId查找匹配的sku
        return specMatchSkus.every(sku => sku.stock === 0); //是否所有sku都是售罄
    }

    public checkSpecOutOfStockBasedOnSpecCombination(specId: Number) {
        const specGroupIndex = this.specs.findIndex(parent => parent.sub.some(sub=> sub.specId === specId));
        if(specGroupIndex === 0) {
            return this.checkSpecOutOfStockBasedOnSku(specId);
        }
        let specIds = [...this.currentSelectedSpecIds];
        specIds[specGroupIndex] = specId; //对应group的spec切换为新的
        const specMatchSkus = this.skus.filter(sku => sku.specIds.every(id => specIds.includes(id))); //根据specId查找匹配的sku
        return specMatchSkus.length === 0 || specMatchSkus.every(sku => sku.stock === 0); //是否所有sku都是售罄
    }

    public findTargetSku(specId: Number): Sku | undefined {
        const specGroupIndex = this.specs.findIndex(parent => parent.sub.some(sub=> sub.specId === specId));
        let specIds = [...this.currentSelectedSpecIds]; 
        specIds[specGroupIndex] = specId; //对应group的spec切换为新的
        let targetSku = this.skus.find(sku => sku.specIds.every(id => specIds.includes(id)))
        let specPath = specIds.slice(0, specGroupIndex+1).join(';');
        if(!targetSku) {
            this.BFS(specIds, specPath, specGroupIndex+1);
            targetSku = this.skus.find(sku => sku.specIds.every(id => specIds.includes(id))) as Sku
        }
        this.resetActionableSpecIdsBySelectedList(specIds);
        return targetSku; //根据spec id列表找到对应sku
    }
    
    //广度优先遍历图，找到可达路径
    private BFS(specIds: Array<Number>, specPath: String, deep: number): void {
        const reachAbleSpecs = this.specsGraph.get(specPath); //根据skuSpecId，从图中查找该节点可达的节点
        if(reachAbleSpecs && reachAbleSpecs.length > 0) {
            reachAbleSpecs.forEach(reachAbleSpec => { //广度优先遍历可达节点
                if(reachAbleSpec.specId === specIds[deep]) { //如果当前遍历的可达节点就是可选节点里的，遍历下一层
                    this.BFS(specIds,`${specPath};${reachAbleSpec.specId}`, deep+1)
                } else { //如果当前遍历的可达节点和已选节点列表中的不一致，遍历同级下一个节点
                    return;
                }
            })
            if(reachAbleSpecs[0]) {
                const firstReachAbleSpecId = reachAbleSpecs[0].specId;
                specIds[deep] = firstReachAbleSpecId; //如果当前节点遍历后都不在已选节点列表中，替换节点列表中的对应节点作为新的已选节点
                this.BFS(specIds, `${specPath};${firstReachAbleSpecId}`, deep+1);
            }
        }
    }
}
