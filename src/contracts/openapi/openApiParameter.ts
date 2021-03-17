export interface OpenApiParameter {
    name: string;
    in: string;
    required: boolean;
    description: string;
    type?: string;
    schema?: any;
    default?: string;
    enum: string[];
}
