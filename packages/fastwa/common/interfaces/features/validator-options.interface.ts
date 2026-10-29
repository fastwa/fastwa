/**
 * Options passed to class-validator's `validate()`, declared here so fastwa's
 * types do not require class-validator to be installed
 */
export interface ValidatorOptions {
  enableDebugMessages?: boolean;
  skipUndefinedProperties?: boolean;
  skipNullProperties?: boolean;
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  groups?: string[];
  always?: boolean;
  strictGroups?: boolean;
  dismissDefaultMessages?: boolean;
  validationError?: {
    target?: boolean;
    value?: boolean;
  };
  forbidUnknownValues?: boolean;
  stopAtFirstError?: boolean;
}
