import "@paperbits/core/ko/bindingHandlers/bindingHandlers.activate";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.component";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.focus";
import "@paperbits/core/ko/bindingHandlers/bindingHandlers.scrollable";
import "./bindingHandlers/acceptChange";
import "./bindingHandlers/copyToClipboard";
import "./bindingHandlers/markdown";
import "./bindingHandlers/scrollintoview";
import "./bindingHandlers/syntaxHighlight";
import { DefaultSettingsProvider } from "@paperbits/common/configuration";
import { DefaultEventManager } from "@paperbits/common/events";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConsoleLogger, Logger } from "@paperbits/common/logging";
import { DefaultRouter, HistoryRouteHandler, LocationRouteHandler } from "@paperbits/common/routing";
import { ViewStack } from "@paperbits/common/ui/viewStack";
import { VisibilityGuard } from "@paperbits/common/user";
import { BalloonBindingHandler, ResizableBindingHandler } from "@paperbits/core/ko/bindingHandlers";
import { KnockoutRegistrationLoaders } from "@paperbits/core/ko/knockout.loaders";
import { DefaultSessionManager } from "./authentication/defaultSessionManager";
import { ApiDetails } from "./components/apis/details-of-api/ko/runtime/api-details";
import { ApiList, ApiListDropdown, ApiListTiles } from "./components/apis/list-of-apis/ko/runtime";
import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { FileInput } from "./components/file-input/file-input";
import { CodeSampleViewModel } from "./components/operations/operation-details/ko/runtime/code-sample";
import { OperationConsole } from "./components/operations/operation-details/ko/runtime/operation-console";
import { OperationDetails } from "./components/operations/operation-details/ko/runtime/operation-details";
import { TypeDefinitionViewModel } from "./components/operations/operation-details/ko/runtime/type-definition";
import { OperationList } from "./components/operations/operation-list/ko/runtime/operation-list";
import { TagInput } from "./components/tag-input/tag-input";
import { ValidationSummary } from "./components/users/validation-summary/ko/runtime/validation-summary";
import { UnhandledErrorHandler } from "./errors/unhandledErrorHandler";
import "./polyfills";
import { RouteHelper } from "./routing/routeHelper";
import { StaticUserService } from "./services";
import { ApiService } from "./services/apiService";
import { BackendService } from "./services/backendService";
import { MapiClient } from "./services/mapiClient";
import { OAuthService } from "./services/oauthService";
import { TagService } from "./services/tagService";

export class MainRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindModule(new KnockoutRegistrationLoaders());
        injector.bindSingleton("eventManager", DefaultEventManager);
        injector.bindToCollection("autostart", UnhandledErrorHandler);
        injector.bindToCollection("autostart", BalloonBindingHandler);
        injector.bindToCollection("autostart", ResizableBindingHandler);
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
    }
}