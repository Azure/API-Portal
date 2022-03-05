import { Bag } from "@paperbits/common";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { OperationDetailsModel } from "./operationDetailsModel";

export class OperationDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationDetails",
            category: "Operations",
            displayName: "Operation: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new OperationDetailsModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): Bag<StyleDefinition> {
        return {
            operationDetails: {
                displayName: "operationDetails",
                plugins: ["margin", "padding", "typography"],
                components: {
                    tryItButton: {
                        displayName: "Try it button",
                        plugins: ["typography"],
                        defaults: {
                            typography: {
                                fontSize: 100
                                
                            }
                        }
                    }
                }
            }
        };
    }
}