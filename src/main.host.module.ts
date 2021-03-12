import * as fs from "fs";
import * as path from "path";
import { StaticSettingsProvider } from "./components/staticSettingsProvider";
import { ContentController } from "./controller/contentController";
import { FileSystemBlobStorage } from "./components/fileSystemBlobStorage";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { UnhandledErrorMiddleware } from "./middlewares/unhandledErrorMiddleware";
import { StaticContentMiddleware } from "./middlewares/staticContentMiddleware";
import { ConsoleLogger } from "@paperbits/common/logging";


export class MainHostModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindSingleton("httpClient", XmlHttpRequestClient);
        injector.bind("errorHandler", UnhandledErrorMiddleware);
        injector.bindSingleton("staticContentMiddleware", StaticContentMiddleware);
        injector.bindSingleton("dataController", ContentController);

        const configPath = path.resolve(__dirname, "config.json");
        const configRaw = fs.readFileSync(configPath, "utf8");
        const config = JSON.parse(configRaw);
        const settingsProvider = new StaticSettingsProvider(config);
        injector.bindInstance("settingsProvider", settingsProvider);

        const designerStorage = new FileSystemBlobStorage(path.resolve(__dirname, "../designer"));
        const websiteStorage = new FileSystemBlobStorage(path.resolve(__dirname, "../website"));
        injector.bindInstance("websiteStorage", websiteStorage);
        injector.bindInstance("designerStorage", designerStorage);
    }
}