import { InversifyInjector } from "@paperbits/common/injection";
import { CoreRuntimeModule } from "@paperbits/core/core.runtime.module";
import { MainRuntimeModule } from "./main.runtime.module";


const injector = new InversifyInjector();
injector.bindModule(new CoreRuntimeModule());
injector.bindModule(new MainRuntimeModule());

document.addEventListener("DOMContentLoaded", () => {
    injector.resolve("autostart");
});