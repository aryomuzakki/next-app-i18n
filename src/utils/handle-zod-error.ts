// utils/handle-zod-error.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// Utility function to traverse the Zod error tree and collect error messages
const extractZodError = (errorTree: any): string[] => {
  let errors: string[] = [];

  if (errorTree.errors && errorTree.errors.length > 0) {
    errors = errors.concat(errorTree.errors);
  }

  // If there are child properties (sub-errors), traverse them
  if (errorTree.properties) {
    Object.values(errorTree.properties).forEach((property: any) => {
      errors = errors.concat(extractZodError(property)); // Recursive call for nested errors
    });
  }

  return errors;
};

export const handleZodError = (error: any, fallback?: string | null) => {
  if (error instanceof z.ZodError) {
    const errorMessages = extractZodError(z.treeifyError(error));
    console.log(errorMessages);  // Logs the error messages to the console
    return errorMessages.join(", ")
  } else {
    return error instanceof Error ? error.message : fallback || "An error occurred";
  }
};