import { StaticSettingsProvider } from "./components/staticSettingsProvider";
import { AzureBlobStorage } from "@paperbits/azure";
import "./polyfills";
import "./bindingHandlers/scrollintoview";
import "./bindingHandlers/copyToClipboard";
import "./bindingHandlers/syntaxHighlight";
import "./bindingHandlers/markdown";
import "./bindingHandlers/acceptChange";
import "./themes/website/scripts";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.component";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.focus";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.activate";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.scrollable";
import { RouteHelper } from "./routing/routeHelper";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { DefaultEventManager } from "@paperbits/common/events";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { DefaultSettingsProvider } from "@paperbits/common/configuration";
import { DefaultRouter, LocationRouteHandler, HistoryRouteHandler } from "@paperbits/common/routing";
import { ConsoleLogger } from "@paperbits/common/logging";
import { KnockoutRegistrationLoaders } from "@paperbits/core/ko/knockout.loaders";
import { ApiList, ApiListDropdown, ApiListTiles } from "./components/apis/list-of-apis/ko/runtime";
import { ApiService } from "./services/apiService";
import { TagService } from "./services/tagService";
import { ApiDetails } from "./components/apis/details-of-api/ko/runtime/api-details";
import { OperationDetails } from "./components/operations/operation-details/ko/runtime/operation-details";
import { OperationConsole } from "./components/operations/operation-details/ko/runtime/operation-console";
import { FileInput } from "./components/file-input/file-input";
import { MapiClient } from "./services/mapiClient";
import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { Spinner } from "./components/spinner/spinner";
import { OperationList } from "./components/operations/operation-list/ko/runtime/operation-list";
import { BackendService } from "./services/backendService";
import { UnhandledErrorHandler } from "./errors/unhandledErrorHandler";
import { ValidationSummary } from "./components/users/validation-summary/ko/runtime/validation-summary";
import { TypeDefinitionViewModel } from "./components/operations/operation-details/ko/runtime/type-definition";
import { CodeSampleViewModel } from "./components/operations/operation-details/ko/runtime/code-sample";
import { VisibilityGuard } from "@paperbits/common/user";
import { StaticUserService } from "./services";
import { BalloonBindingHandler, ResizableBindingHandler } from "@paperbits/core/ko/bindingHandlers";
import { TagInput } from "./components/tag-input/tag-input";
import { ViewStack } from "@paperbits/common/ui/viewStack";
import { OAuthService } from "./services/oauthService";
import { DefaultSessionManager } from "./authentication/defaultSessionManager";

export class MainRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new KnockoutRegistrationLoaders());
        injector.bindSingleton("eventManager", DefaultEventManager);
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindCollection("autostart");
        injector.bindToCollection("autostart", UnhandledErrorHandler);
        injector.bindToCollection("autostart", BalloonBindingHandler);
        injector.bindToCollection("autostart", ResizableBindingHandler);
        injector.bindCollection("routeGuards");
        injector.bindToCollection("autostart", VisibilityGuard);
        injector.bindSingleton("router", DefaultRouter);
        injector.bind("apiList", ApiList);
        injector.bind("apiListDropdown", ApiListDropdown);
        injector.bind("apiListTiles", ApiListTiles);
        injector.bind("apiDetails", ApiDetails);
        injector.bind("operationDetails", OperationDetails);
        injector.bind("operationConsole", OperationConsole);
        injector.bind("typeDefinition", TypeDefinitionViewModel);
        injector.bind("codeSample", CodeSampleViewModel);
        injector.bind("fileInput", FileInput);
        injector.bind("apiService", ApiService);
        injector.bind("tagService", TagService);
        injector.bind("validationSummary", ValidationSummary);
        injector.bind("operationList", OperationList);
        injector.bind("operationDetails", OperationDetails);
        injector.bind("spinner", Spinner);
        injector.bindSingleton("backendService", BackendService);
        injector.bindSingleton("mapiClient", MapiClient);
        injector.bindSingleton("httpClient", XmlHttpRequestClient);
        injector.bindSingleton("settingsProvider", DefaultSettingsProvider);
        injector.bindSingleton("authenticator", DefaultAuthenticator);
        injector.bindSingleton("routeHelper", RouteHelper);
        injector.bindSingleton("userService", StaticUserService);
        injector.bindSingleton("oauthService", OAuthService);
        injector.bindSingleton("viewStack", ViewStack);
        injector.bindSingleton("sessionManager", DefaultSessionManager);
        injector.bind("tagInput", TagInput);
        injector.bindToCollection("autostart", location.href.includes("designtime=true")
            ? HistoryRouteHandler
            : LocationRouteHandler);

        const azureBlobStorage = new AzureBlobStorage(new StaticSettingsProvider({
            blobStorageUrl: "https://alzaslonstaticwebsite.blob.core.windows.net/specs"
        }));

        injector.bindInstance("azureBlobStorage", azureBlobStorage);
    }
}