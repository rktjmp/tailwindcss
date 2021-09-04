import reduceCalc from '../src/util/reduceCalc'

it.each([
  // Basic math
  [`calc(1 + 2)`, `3`],
  [`calc(2 * 3)`, `6`],
  [`calc(3 - 1)`, `2`],
  [`calc(6 / 2)`, `3`],

  // With other strings
  [`before calc(2 * 3)`, `before 6`],
  [`calc(2 * 3) after`, `6 after`],
  [`before calc(2 * 3) after`, `before 6 after`],

  // Math including units
  [`calc(10rem + 5rem)`, `15rem`],
  [`calc(1rem * 1.5)`, `1.5rem`],
  [`calc(1px + 1rem)`, `calc(1px + 1rem)`],

  // Nested calcs
  [`calc(calc(2rem + 5rem) * 2)`, `14rem`],
  [`calc(calc(2rem + 5rem) + calc(1rem + 6rem))`, `14rem`],
  [`calc(calc(calc(1 + 2 + 3 + 4)))`, `10`],
  [`calc(calc(calc(1 + 2) + 3) + 4)`, `10`],

  // Invalid values
  [`calc(auto * -1)`, null],
])('should reduce "%s" to "%s"', (input, output) => {
  expect(reduceCalc(input)).toEqual(output)
})
