import {
  invertObject,
  removeNullishOrUndefinedProperties,
} from "../objects.helper";

describe("Objects Helper", () => {
  it("should invert an object when call invertObject", () => {
    const obj = {
      a: "1",
      b: "2",
      c: "3",
    };

    const inverted = invertObject(obj);

    expect(inverted).toEqual({
      1: "a",
      2: "b",
      3: "c",
    });
  });
});

const testCases: Array<{
  description: string;
  input: Record<string, unknown> | Array<Record<string, unknown>>;
  expected: Record<string, unknown> | Array<Record<string, unknown>>;
  removeNulls: boolean;
}> = [
  {
    description: "should remove undefined properties from object",
    input: [
      {
        a: 1,
        b: undefined,
        c: { d: null, e: 5 },
        f: [{ g: null, h: 6 }, "test"],
        g: [],
      },
    ],
    expected: [
      {
        a: 1,
        c: { d: null, e: 5 },
        f: [{ g: null, h: 6 }, "test"],
        g: [],
      },
    ],
    removeNulls: false,
  },
  {
    description:
      "should remove nullish and undefined properties from object when removeNulls is true",
    input: {
      a: 1,
      b: undefined,
      c: { d: null, e: 5 },
      f: [{ g: null, h: 6 }, "test"],
    },
    expected: { a: 1, c: { e: 5 }, f: [{ h: 6 }, "test"] },
    removeNulls: true,
  },
  {
    description:
      "should return the same object when object is empty or different of object",
    input: "test" as unknown as Record<string, unknown>,
    expected: "test" as unknown as Record<string, unknown>,
    removeNulls: true,
  },
  {
    description:
      "should remove undefined properties when object not have deep array",
    input: {
      a: null,
      b: undefined,
      c: { d: null, e: null },
    },
    expected: { c: {} },
    removeNulls: true,
  },
];

describe("removeNullishOrUndefinedProperties", () => {
  testCases.forEach(({ description, input, expected, removeNulls }) => {
    it(`${description}`, () => {
      const result = removeNulls
        ? removeNullishOrUndefinedProperties(input, removeNulls)
        : removeNullishOrUndefinedProperties(input);

      expect(result).toStrictEqual(expected);
    });
  });
});
