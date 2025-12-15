import z, { ZodObject, ZodRawShape } from "zod";

interface EnvOptions {
    source?: NodeJS.ProcessEnv;
    serviceName?: string;
}

/**
 * Helper type to infer the output type of the Zod schema.
 */
type SchemaOutput<TSchema extends ZodRawShape> = z.output<ZodObject<TSchema>>;


export const createEnv = <TSchema extends ZodRawShape>(
    schema: ZodObject<TSchema>,
    options: EnvOptions = {}
): SchemaOutput<TSchema> => {
    // Default to process.env and "service" if options are not provided
    const { source = process.env, serviceName = "service" } = options;

    // Attempt to parse the source object against the schema
    const parsed = schema.safeParse(source);

    // If validation fails, format the errors and throw a descriptive exception
    if (!parsed.success) {
        const formatedErrors = parsed.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
        throw new Error(
            `[${serviceName}] Environment variable validation failed: ${JSON.stringify(formatedErrors)}`
        );
    }

    // Return the successfully parsed and typed data
    return parsed.data;
};

export type EnvSchema<TShape extends ZodRawShape> = ZodObject<TShape>;