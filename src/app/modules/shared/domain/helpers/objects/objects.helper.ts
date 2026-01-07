/**
 * Inverts the keys and values of an object, creating a new object where the original
 * values become keys and the original keys become values. The function ensures type
 * safety by requiring the input object to have string values.
 *
 * @typeParam TObject - The type of the input object, where all values must be strings.
 *
 * @param obj - The object to be inverted.
 *
 * @returns A new object where the keys are the values of the input object, and the values
 * are the corresponding keys from the input object.
 *
 * @example
 * ```typescript
 * const original = { a: "1", b: "2", c: "3" };
 * const inverted = invertObject(original);
 *  Result: { "1": "a", "2": "b", "3": "c" }
 * ```
 */
export function invertObject<
  TObject extends { [Key in keyof TObject]: string },
>(
  obj: TObject,
): {
  [Value in TObject[keyof TObject]]: {
    [Key in keyof TObject]: TObject[Key] extends Value ? Key : never;
  }[keyof TObject];
} {
  const result = {} as {
    [Value in TObject[keyof TObject]]: {
      [Key in keyof TObject]: TObject[Key] extends Value ? Key : never;
    }[keyof TObject];
  };

  for (const key in obj) {
    const value = obj[key];
    result[value as TObject[keyof TObject]] = key as {
      [Key in keyof TObject]: TObject[Key] extends TObject[keyof TObject]
        ? Key
        : never;
    }[keyof TObject];
  }

  return result;
}

type NullablePartial<Object> = {
  [K in keyof Object]?: Object[K] | null;
};

/**
 * Removes nullish (null or undefined) properties from an object or array.
 * If `removeNulls` is true, it also removes properties with null values.
 * Returns a new object or array with the cleaned properties.
 *
 * @param obj - The object or array to clean.
 * @param removeNulls - Whether to remove null values as well (default: false).
 * @returns A new object or array with nullish and optionally null properties removed.
 */
export function removeNullishOrUndefinedProperties<Object>(
  obj: NullablePartial<Object> | Array<NullablePartial<Object>>,
  removeNulls?: boolean,
): Object;

export function removeNullishOrUndefinedProperties<Object>(
  obj: NullablePartial<Object> | Array<NullablePartial<Object>>,
  removeNulls = false,
): unknown {
  if (Array.isArray(obj)) {
    return cleanArray(obj, removeNulls);
  }

  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  return cleanObject(obj, removeNulls);
}

function cleanArray<T>(
  arr: Array<NullablePartial<T>>,
  removeNulls: boolean,
): Array<unknown> {
  return arr
    .map((item) =>
      typeof item === "object" && item !== null
        ? removeNullishOrUndefinedProperties(item, removeNulls)
        : item,
    )
    .filter((item) => item !== undefined && (!removeNulls || item !== null));
}

function cleanObject<T>(
  obj: NullablePartial<T>,
  removeNulls: boolean,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (shouldSkip(value, removeNulls)) continue;

    if (Array.isArray(value)) {
      result[key] = value.length
        ? cleanArray(value as Array<NullablePartial<unknown>>, removeNulls)
        : value;
    } else if (typeof value === "object" && value !== null) {
      result[key] = removeNullishOrUndefinedProperties(value, removeNulls);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function shouldSkip(value: unknown, removeNulls: boolean): boolean {
  return value === undefined || (removeNulls && value === null);
}
