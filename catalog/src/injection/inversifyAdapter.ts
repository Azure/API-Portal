import { InversifyInjector } from "@paperbits/common/injection";
import { IocAdapter, ClassConstructor, Action } from "routing-controllers";

export class InversifyAdapter implements IocAdapter {
    constructor(private readonly injector: InversifyInjector) { }

    public get<T>(classConstructor: ClassConstructor<T>, action?: Action): T {
        return this.injector["container"].resolve<T>(classConstructor);
    }
}