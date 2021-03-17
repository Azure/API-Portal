import { Bag } from "@paperbits/common";
import { OpenApiMediaType } from "./openApiMediaType";

/**
 * Describes a single request body.
 */
export interface OpenApiRequestBody {
    /**
     * A brief description of the request body. This could contain examples of use.
     */
    description: string;

    /**
     * Determines if the request body is required in the request. Defaults to false.
     */
    required: boolean;

    /**
     * The content of the request body. The key is a media type or media type range and the value describes it.
     * For requests that match multiple keys, only the most specific key is applicable,
     * e.g. text/plain overrides text/*
     */
    content: Bag<OpenApiMediaType>;
}
