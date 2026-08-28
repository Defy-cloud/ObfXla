export type VmType = "none" | "stack" | "register";
export type VmLevel = "debug" | "normal" | "max";

export interface ObfuscationOptions {
  renameLocals: boolean;
  preserveGlobals: boolean;
  encodeStrings: boolean;
  encodeNumbers: boolean;
  scramble: boolean;
  oneLine: boolean;
  vmType: VmType;
  vmLevel: VmLevel;
}

export const DEFAULT_OPTIONS: ObfuscationOptions = {
  renameLocals: true,
  preserveGlobals: true,
  encodeStrings: true,
  encodeNumbers: true,
  scramble: true,
  oneLine: false,
  vmType: "register",
  vmLevel: "max",
};

export interface ValidationStats {
  tokens: number;
  statements: number;
  functions: number;
  locals: number;
  globals: string[];
  features: string[];
}

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  stats: ValidationStats;
}

export const EXAMPLE_SCRIPT = `-- Paste your Luau source here, or try this example.
local message = "Hello, world!"
print(message)

local function square(n)
	return n * n
end

print("Square of 5 is: " .. tostring(square(5)))
`;
