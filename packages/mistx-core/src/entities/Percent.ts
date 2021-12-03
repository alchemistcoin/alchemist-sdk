import { Rounding, _100, BigintIsh} from '../constants'
import { Fraction } from './Fraction'

const _100_PERCENT = new Fraction(_100)

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
 function toPercent(fraction: Fraction): Percent {
  return new Percent(fraction.numerator, fraction.denominator)
}

export class Percent extends Fraction {
  /**
   * This boolean prevents a fraction from being interpreted as a Percent
   */
   public readonly isPercent: true = true

   add(other: Fraction | BigintIsh): Percent {
     return toPercent(super.add(other))
   }
 
   subtract(other: Fraction | BigintIsh): Percent {
     return toPercent(super.subtract(other))
   }
 
   multiply(other: Fraction | BigintIsh): Percent {
     return toPercent(super.multiply(other))
   }
 
   divide(other: Fraction | BigintIsh): Percent {
     return toPercent(super.divide(other))
   }

  public toSignificant(
    significantDigits: number = 5,
    format?: object,
    rounding?: Rounding
  ): string {
    return super.multiply(_100_PERCENT).toSignificant(
      significantDigits,
      format,
      rounding
    )
  }

  public toFixed(
    decimalPlaces: number = 2,
    format?: object,
    rounding?: Rounding
  ): string {
    return super.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding)
  }
}
