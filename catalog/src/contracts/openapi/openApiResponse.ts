import { Bag } from "@paperbits/common";
import { OpenApiMediaType } from "./openApiMediaType";
import { OpenApiParameter } from "./openApiParameter";


export interface OpenApiResponse {
    description: string;
    headers: Bag<OpenApiParameter>;
    content: Bag<OpenApiMediaType>;
}
