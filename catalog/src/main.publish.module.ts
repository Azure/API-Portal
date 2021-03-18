import { OpenApiPublisher } from "./publishing/openApiPublisher";
import * as fs from "fs";
import * as path from "path";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConsoleLogger } from "@paperbits/common/logging";
import { MapiClient } from "./services/mapiClient";
import { ListOfApisModule } from "./components/apis/list-of-apis/ko/listOfApis.module";
import { DetailsOfApiModule } from "./components/apis/details-of-api/ko/detailsOfApi.module";
import { StaticRouter } from "./components/staticRouter";
import { StaticUserService } from "./services/userService";
import { StaticAuthenticator } from "./components/staticAuthenticator";
import { OperationListModule } from "./components/operations/operation-list/ko/operationList.module";
import { OperationDetailsPublishModule } from "./components/operations/operation-details/operationDetails.publish.module";
import { IdentityService } from "./services/identityService";
import { ValidationSummaryModule } from "./components/users/validation-summary/validationSummary.module";
import { BackendService } from "./services/backendService";
import { StaticRoleService } from "./services/roleService";
import { OAuthService } from "./services/oauthService";
import { FileSystemBlobStorage } from "./components/fileSystemBlobStorage";
import { FileSystemDataProvider } from "./persistence/fileSystemDataProvider";
import { FileSystemObjectStorage } from "./persistence/fileSystemObjectStorage";
import { openapiSpecsPathSettingName, dataPathSettingName, mediaPathSettingName, websiteContentFileName } from "./constants";

export class MainPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new OperationListModule());
        injector.bindModule(new OperationDetailsPublishModule());
        injector.bindModule(new ValidationSummaryModule());
        injector.bindSingleton("backendService", BackendService);
        injector.bindSingleton("userService", StaticUserService);
        injector.bindSingleton("roleService", StaticRoleService);
        injector.bindSingleton("identityService", IdentityService);
        injector.bindSingleton("router", StaticRouter);
        injector.bindSingleton("authenticator", StaticAuthenticator);
        injector.bindSingleton("mapiClient", MapiClient);
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindSingleton("oauthService", OAuthService);

        const configPath = path.resolve(__dirname, "config.json");
        const configRaw = fs.readFileSync(configPath, "utf8");
        const config = JSON.parse(configRaw);
        const mediaFolder = config[mediaPathSettingName];
        const contentFolder = config[dataPathSettingName];
        const openapiSpecsFolder = config[openapiSpecsPathSettingName];

        const basePath = path.dirname(__filename);
        const contentFilePath = path.resolve(basePath, contentFolder, websiteContentFileName);
        const specsFolderPath = path.resolve(basePath, openapiSpecsFolder);
        const mediaFolderPath = path.resolve(basePath, mediaFolder);

        injector.bindInstance("specsBlobStorage", new FileSystemBlobStorage(specsFolderPath));
        injector.bindInstance("blobStorage", new FileSystemBlobStorage(mediaFolderPath));
        injector.bindInstance("dataProvider", new FileSystemDataProvider(contentFilePath));
        injector.bindInstance("objectStorage", new FileSystemObjectStorage(contentFilePath));
        injector.bindInstance("outputBlobStorage", new FileSystemBlobStorage(path.resolve("../website")));

        injector.bindToCollection("publishers", OpenApiPublisher);
    }
}
