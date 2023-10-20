export default class Spec {
    specId: Number = 0;
    name: String = '';
    pid: Number = 0;
    sub: Array<Spec> = [];

    constructor(specId: Number, name: String, pid: Number, sub: Array<Spec> = []) {
        this.specId = specId;
        this.name = name;
        this.pid = pid;
        this.sub = sub;
    }
}