import { Bag } from "@paperbits/common/bag";
import { OpenApiExample } from "./openApiExample";

export interface OpenApiParameter {
    name: string;
    in: string;
    required: boolean;
    description: string;
    type?: string;
    schema?: any;
    default?: string;
    enum: string[];
    examples: Bag<OpenApiExample>;
}
