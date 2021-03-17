import { OpenApiParameter } from "./openApiParameter";
import { OpenApiResponses } from "./openApiResponses";
import { OpenApiRequestBody } from "./openApiRequestBody";


export interface OpenApiOperation {
    operationId: string;
    description: string;
    parameters: OpenApiParameter[];
    responses: OpenApiResponses;
    summary: string;
    consumes?: string[];
    produces?: string[];
    requestBody?: OpenApiRequestBody;
}
