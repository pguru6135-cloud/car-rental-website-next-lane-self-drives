import { differenceInDays, isWeekend, eachDayOfInterval, parseISO } from 'date-fns'

/**
 * Calculate dynamic pricing based on weekday/weekend
 * Weekend = Saturday + Sunday: 1.3x multiplier
 */
export function calculatePrice(car, startDate, endDate) {
  if (!car || !startDate || !endDate) return { total: 0, days: 0, breakdown: [] }

  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const days = eachDayOfInterval({ start, end: new Date(end.getTime() - 1) })

  const basePrice = car.pricePerDay

  let total = 0
  const breakdown = days.map((day) => {
    const isWknd = isWeekend(day)
    const rate = isWknd ? basePrice * 1.3 : basePrice
    total += rate
    return { date: day, rate, isWeekend: isWknd }
  })

  return {
    total: Math.round(total),
    days: days.length,
    breakdown,
    basePrice,
    weekendMultiplier: 1.3,
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getDurationText(days) {
  if (days === 1) return '1 Day'
  if (days < 7) return `${days} Days`
  const weeks = Math.floor(days / 7)
  const rem = days % 7
  return rem ? `${weeks}w ${rem}d` : `${weeks} Week${weeks > 1 ? 's' : ''}`
}
