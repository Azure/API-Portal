import * as Constants from "./constants";
import { HttpDataProvider } from "./persistence/httpDataProvider";
import { UnsavedChangesRouteGuard } from "./routing/unsavedChangesRouteGuard";
import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConsoleLogger } from "@paperbits/common/logging";
import { ListOfApisModule } from "./components/apis/list-of-apis/ko/listOfApis.module";
import { ListOfApisEditorModule } from "./components/apis/list-of-apis/ko/listOfApisEditor.module";
import { DetailsOfApiModule } from "./components/apis/details-of-api/ko/detailsOfApi.module";
import { DetailsOfApiEditorModule } from "./components/apis/details-of-api/ko/detailsOfApiEditor.module";
import { OperationListModule } from "./components/operations/operation-list/ko/operationList.module";
import { OperationListEditorModule } from "./components/operations/operation-list/ko/operationListEditor.module";
import { OperationDetailsDesignModule } from "./components/operations/operation-details/operationDetails.design.module";
import { App } from "./components/app/app";
import { ValidationSummaryModule } from "./components/users/validation-summary/validationSummary.module";
import { ValidationSummaryDesignModule } from "./components/users/validation-summary/validationSummary.design.module";
import { StaticRoleService } from "./services/roleService";
import { HistoryRouteHandler } from "@paperbits/common/routing";
import { OldContentRouteGuard } from "./routing/oldContentRouteGuard";
import { RemoteObjectStorage } from "./persistence/remoteObjectStorage";
import { RelativePathRouter } from "./routing/relativePathRouter";
import { RemoteBlobStorage } from "./persistence/remoteBlobStorage";
import { PopupDesignModule } from "@paperbits/core/popup";


export class MainDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new ListOfApisEditorModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new DetailsOfApiEditorModule());
        injector.bindModule(new OperationListModule());
        injector.bindModule(new OperationListEditorModule());
        injector.bindModule(new OperationDetailsDesignModule());
        injector.bindModule(new ValidationSummaryDesignModule());
        injector.bindModule(new ValidationSummaryModule());
        injector.bindSingleton("app", App);
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindSingleton("roleService", StaticRoleService);
        injector.bindSingleton("authenticator", DefaultAuthenticator);
        injector.bindSingleton("dataProvider", HttpDataProvider);
        injector.bindSingleton("objectStorage", RemoteObjectStorage);
        injector.bindSingleton("blobStorage", RemoteBlobStorage);
        injector.bindToCollection("routeGuards", OldContentRouteGuard);
        injector.bindToCollection("routeGuards", UnsavedChangesRouteGuard);
        injector.bindInstance("reservedPermalinks", Constants.reservedPermalinks);
        injector.bindSingleton("router", RelativePathRouter);
        injector.bindToCollection("autostart", HistoryRouteHandler);
        injector.bindModule(new PopupDesignModule());
    }
}