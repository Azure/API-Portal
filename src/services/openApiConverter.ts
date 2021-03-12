import { RepresentationContract } from "./../contracts/representation";
import { ResponseContract } from "./../contracts/response";
import { ParameterContract } from "../contracts/parameter";
import { RequestContract } from "../contracts/request";
import { OperationContract } from "./../contracts/operation";
import { ApiContract } from "../contracts/api";

export class OpenApiConverter {
    public convertParameter(parameterObject: object): ParameterContract {
        const parameter: ParameterContract = {
            name: parameterObject["name"],
            description: parameterObject["description"],
            in: parameterObject["in"],
            type: parameterObject["schema"]
                ? parameterObject["schema"]["type"]
                : null,
            values: [],
            required: parameterObject["required"]
        };

        return parameter;
    }

    // public convertRequest(requestObject: object): RequestContract {

    //     const request: RequestContract = {
    //         description: "",
    //         queryParameters: ParameterContract[];
    //         headers: ParameterContract[];
    //         representations: RepresentationContract[];
    //     }
    // }

    public convertResponse(statusCode: number, responseObject: object): ResponseContract {
        const response: ResponseContract = {
            statusCode: statusCode,
            // representations?: RepresentationContract[];
            description: responseObject["description"]
        };

        const headersObject = responseObject["headers"];

        if (headersObject) {
            const headers: ParameterContract[] = [];

            for (const headerKey of Object.keys(headersObject)) {
                const headerObject = headersObject[headerKey];

                const header: ParameterContract = {
                    name: headerKey,
                    description: headerObject["description"],
                    in: headerObject["in"],
                    type: headerObject["schema"]
                        ? headerObject["schema"]["type"]
                        : null
                };

                headers.push(header);
            }

            response.headers = headers;
        }

        const contentObject = responseObject["content"];

        if (contentObject) {
            const representations: RepresentationContract[] = [];

            for (const representationKey of Object.keys(contentObject)) {
                const representationObject = contentObject[representationKey];

                const representation: RepresentationContract = {
                    contentType: representationKey,
                    sample: representationObject.examples?.["response"]
                    // generatedSample?: string;
                    // schemaId?: string;
                    // typeName?: string;
                    // formParameters?: ParameterContract[];
                };

                const representationExamplesObject = representationObject.examples;

                if (representationExamplesObject) {
                    const exampleKeys = Object.keys(representationExamplesObject);

                    if (exampleKeys.length > 0) {
                        representation.sample = JSON.stringify(representationExamplesObject[exampleKeys[0]]);
                    }
                }


                representations.push(representation);
            }

            response.representations = representations;
        }

        return response;
    }

    public convertPaths(pathsObject: object): OperationContract[] {
        const operations: OperationContract[] = [];

        for (const pathKey of Object.keys(pathsObject)) {
            const methodsObject = pathsObject[pathKey];
            const methodKeys = Object.keys(methodsObject);

            for (const methodKey of methodKeys) {
                const methodObject = methodsObject[methodKey];

                const operation: OperationContract = {
                    id: methodObject.operationId,
                    name: methodObject.operationId,
                    properties: {
                        displayName: methodObject.summary || methodObject.operationId,
                        description: methodObject.description,
                        urlTemplate: pathKey,
                        templateParameters: methodObject.parameters
                            ? methodObject.parameters
                                .filter(x => x["in"] === "template")
                                .map(x => this.convertParameter(x))
                            : [],
                        method: methodKey.toUpperCase(),
                        version: "",
                        request: null, // RequestContract;
                    }
                };

                const responsesObject = methodObject["responses"];

                if (responsesObject) {
                    const responses: ResponseContract[] = [];

                    for (const responseKey of Object.keys(responsesObject)) {
                        const statusCode = parseInt(responseKey);

                        if (!statusCode) {
                            continue;
                        }

                        const response = this.convertResponse(statusCode, responsesObject[responseKey]);
                        responses.push(response);
                    }
                    operation.properties.responses = responses;
                }

                operations.push(operation);
            }
        }

        return operations;
    }

    public getApi(spec: any): ApiContract {
        const api: ApiContract = {
            name: spec.info.title,
            properties: {
                displayName: spec.info.title,
                description: spec.info.description,
                subscriptionRequired: false,
                protocols: ["http", "https"],
                thumbnail: spec.info["x:thumbnail"] || "https://repository-images.githubusercontent.com/168243877/bc582a00-838e-11e9-82cd-708afc2d2a11"
            }
        };

        return api;
    }

    public getOperations(spec: any): OperationContract[] {
        const operations = this.convertPaths(spec.paths);
        return operations;
    }

    public getHostnames(spec: any): string[] {
        return spec.servers?.map(x => new URL(x.url).hostname) || [];
    }
}