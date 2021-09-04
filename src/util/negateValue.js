import reduceCalc from './reduceCalc'

export default function (value) {
  return reduceCalc(`calc(${value} * -1)`) ?? value
}
