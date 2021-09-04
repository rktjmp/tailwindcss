export default function reduceCalc(input) {
  let parts = input
    .split(/(calc\(.*\))/)
    .map((section) => (!section.startsWith('calc') ? section : reduce(section)))

  return parts.some((p) => p === null) ? null : parts.join('')
}

let parens = new Set(['(', ')'])
let operations = new Set(['+', '-', '*', '/'])
let precedence = new Map([
  ['+', 1 << 0],
  ['-', 1 << 0],
  ['*', 1 << 1],
  ['/', 1 << 1],
])

let ops = {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => x / y,
}

function calculate(input) {
  // Tokenization
  let tokens = input
    .split(/([)( ])/g)
    .map((value) => {
      value = value.trim()
      if (parens.has(value)) return value
      if (operations.has(value)) return value
      if (value.trim() === '') return null
      return Number(value)
    })
    .filter((v) => v !== null)

  // To reverse polish notation (using shunting-yards)
  let operatorStack = []
  let output = []

  for (let token of tokens) {
    if (operations.has(token)) {
      while (operatorStack.length > 0) {
        let opHead = operatorStack[operatorStack.length - 1]
        if (!operations.has(opHead)) break
        if (precedence.get(opHead) < precedence.get(token)) break

        output.push(operatorStack.pop())
      }

      operatorStack.push(token)
    } else if (token === '(') {
      operatorStack.push(token)
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop())
      }

      if (operatorStack.length <= 0) throw new Error('Unbalanced parens.')

      operatorStack.pop() // Remove opening paren
    } else {
      output.push(token)
    }
  }

  // Move the leftovers from the operatorStack to the outputQueue.
  output.push(...operatorStack.splice(0))

  // Execute
  let stack = []
  for (let token of output) {
    if (operations.has(token)) {
      let result = ops[token](...stack.splice(-2))
      if (isNaN(result)) return null
      stack.push(result)
    } else {
      stack.push(token)
    }
  }

  return stack.pop()
}

function reduce(input) {
  // Contains a CSS variable, we can never simplify this properly since the
  // value can change at runtime. Abort!
  if (input.includes('var(')) return input

  let finalUnit = null
  let allUnitsMatch = true

  let inputWithoutUnits = input
    .replaceAll('calc(', '(')
    .replace(/(-?(?:[\d.])+)([^ )]+)?/g, (_, value, unit) => {
      // No final unit specified yet.
      if (finalUnit === null) {
        finalUnit = unit
      }

      // There is a mismatch in the unit.
      else if (unit !== undefined && finalUnit !== unit) {
        allUnitsMatch = false
      }

      return value
    })

  // When there are units that don't match (e.g.: `calc(100vm - 2rem)`) then
  // we don't really know how to process that because a lot of units are
  // related to specific runtime/browser values (like rems, ems, vw, ...). Abort!
  if (!allUnitsMatch) return input

  // Let's evaluate the math and re-apply the unit.
  let result = calculate(inputWithoutUnits)
  if (result === null) return null
  return result + (finalUnit ?? '')
}
