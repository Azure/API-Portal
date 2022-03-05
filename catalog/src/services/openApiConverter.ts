import { OpenApiOperation } from "./../contracts/openapi/openApiOperation";
import { OpenApiMediaType } from "../contracts/openapi/openApiMediaType";
import { OpenApiParameter } from "../contracts/openapi/openApiParameter";
import { RepresentationContract } from "./../contracts/representation";
import { ResponseContract } from "./../contracts/response";
import { ParameterContract } from "../contracts/parameter";
import { RequestContract } from "../contracts/request";
import { OperationContract } from "./../contracts/operation";
import { ApiContract } from "../contracts/api";
import { Schema } from "../models/schema";
import { TypeDefinition } from "../models/typeDefinition";
import { OpenApiSpec30 } from "../contracts/openapi/openApi";
import { OpenApiResponse } from "../contracts/openapi/openApiResponse";
import { Bag } from "@paperbits/common";

const defaultApiServerHost = "api.contoso.com";

export class OpenApiConverter {
    public convertParameter(openApiParameter: OpenApiParameter): ParameterContract {
        const parameter: ParameterContract = {
            name: openApiParameter.name,
            description: openApiParameter.description,
            in: openApiParameter.in,
            type: openApiParameter.schema?.type,
            defaultValue: openApiParameter.default,
            values: [],
            examples: openApiParameter.examples,
            required: openApiParameter.required
        };

        return parameter;
    }

    public convertRequest(spec: OpenApiSpec30, openApiOperation: OpenApiOperation): RequestContract {
        const request: RequestContract = {
            description: openApiOperation.description
        };

        if (openApiOperation.parameters) {
            request.queryParameters = openApiOperation.parameters
                ? openApiOperation.parameters
                    .filter(parameter => parameter.in === "query")
                    .map(parameter => this.convertParameter(parameter))
                : [];

            request.headers = openApiOperation.parameters
                ? openApiOperation.parameters
                    .filter(parameter => parameter.in === "header")
                    .map(parameter => this.convertParameter(parameter))
                : [];
        }

        if (openApiOperation.requestBody) {
            request.representations = this.convertRepresentations(spec, openApiOperation.requestBody.content);
        }

        return request;
    }

    public getTypeNameFromRef($ref: string): string {
        return $ref && $ref.split("/").pop();
    }

    public convertRepresentation(spec: OpenApiSpec30, contentType: string, mediaType: OpenApiMediaType): RepresentationContract {
        const representation: RepresentationContract = {
            contentType: contentType,
            typeName: this.getTypeNameFromRef(mediaType.schema?.$ref),
            schemaId: `${spec.info.title}`,
            examples: mediaType.examples
        };

        return representation;
    }

    public convertRepresentations(spec: OpenApiSpec30, representationObjects: Bag<OpenApiMediaType>): RepresentationContract[] {
        const mediaTypes = Object.keys(representationObjects);

        const representations = mediaTypes.map(mediaType =>
            this.convertRepresentation(spec, mediaType, representationObjects[mediaType]));

        return representations;
    }

    private convertHeaders(headersObject: Bag<OpenApiParameter>): ParameterContract[] {
        const parameters: ParameterContract[] = [];

        for (const headerKey of Object.keys(headersObject)) {
            const headerObject = headersObject[headerKey];

            const header: ParameterContract = {
                name: headerKey,
                description: headerObject.description,
                in: headerObject.in,
                type: headerObject.schema?.type,
                defaultValue: headerObject.default,
                values: [],
                examples: headerObject.examples,
                required: headerObject.required
            };

            parameters.push(header);
        }

        return parameters;
    }

    public convertResponse(spec: OpenApiSpec30, statusCode: number, responseObject: OpenApiResponse): ResponseContract {
        const response: ResponseContract = {
            statusCode: statusCode,
            description: responseObject.description
        };

        const headersObject = responseObject.headers;

        if (headersObject) {
            response.headers = this.convertHeaders(headersObject);
        }

        const contentObject = responseObject.content;

        if (contentObject) {
            response.representations = this.convertRepresentations(spec, contentObject);
        }

        return response;
    }

    public convertPaths(spec: OpenApiSpec30): OperationContract[] {
        const pathsObject = spec.paths;
        const operations: OperationContract[] = [];

        for (const pathKey of Object.keys(pathsObject)) {
            const methodsObject = pathsObject[pathKey];
            const methodKeys = Object.keys(methodsObject);

            for (const methodKey of methodKeys) {
                const methodObject = methodsObject[methodKey];
                const operationId = `${methodKey}-${pathKey}`
                    .replace(/\W/g, "-")
                    .replace(/\-{1,}/g, "-")
                    .toLowerCase();

                const operation: OperationContract = {
                    id: operationId,
                    name: operationId,
                    properties: {
                        displayName: methodObject.summary || operationId,
                        description: methodObject.description,
                        urlTemplate: pathKey,
                        templateParameters: methodObject.parameters
                            ? methodObject.parameters
                                .filter(parameter => parameter.in === "template")
                                .map(parameter => this.convertParameter(parameter))
                            : [],
                        method: methodKey.toUpperCase(),
                        version: "",
                        request: this.convertRequest(spec, methodObject)
                    }
                };

                const responsesObject = methodObject.responses;

                if (responsesObject) {
                    const responseContracts: ResponseContract[] = [];

                    for (const responseKey of Object.keys(responsesObject)) {
                        const statusCode = parseInt(responseKey);

                        if (!statusCode) {
                            continue;
                        }

                        const responseContract = this.convertResponse(spec, statusCode, responsesObject[responseKey]);
                        responseContracts.push(responseContract);
                    }
                    operation.properties.responses = responseContracts;
                }

                operations.push(operation);
            }
        }

        return operations;
    }

    public getApi(spec: OpenApiSpec30): ApiContract {
        const apiContract: ApiContract = {
            name: spec.info.title,
            properties: {
                displayName: spec.info.title,
                description: spec.info.description,
                subscriptionRequired: false,
                protocols: ["http", "https"],
                thumbnail: spec.info["x:thumbnail"]
            }
        };

        return apiContract;
    }

    public getOperations(spec: OpenApiSpec30): OperationContract[] {
        const operations = this.convertPaths(spec);
        return operations;
    }

    public getHostnames(spec: OpenApiSpec30): string[] {
        if (!spec.servers || spec.servers.length === 0) {
            return [defaultApiServerHost];
        }

        return spec.servers?.map(server =>
            server.url.startsWith("http://") || server.url.startsWith("https://")
                ? new URL(server.url).hostname
                : defaultApiServerHost);
    }

    public getSchema(spec: OpenApiSpec30): Schema {
        const schemasObject = spec?.components?.schemas;

        if (!schemasObject) {
            return null;
        }

        const definitions = Object
            .keys(schemasObject)
            .map(definitionName => {
                return new TypeDefinition(definitionName, schemasObject[definitionName], {});
            });

        const schema = new Schema();
        schema.definitions = definitions;

        return schema;
    }
}