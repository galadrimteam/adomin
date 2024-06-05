import { Duration } from 'luxon'
import os from 'node:os'

const LOAD_AVG_TYPES = ['1m', '5m', '15m'] as const

type LoadAvgType = (typeof LOAD_AVG_TYPES)[number]

const LOAD_AVG_BY_TYPE: Record<LoadAvgType, number> = {
  '1m': 0,
  '5m': 1,
  '15m': 2,
}

export const getCpuUsageEstimate = (loadAvgType: LoadAvgType) => {
  const index = LOAD_AVG_BY_TYPE[loadAvgType]
  const loadAvg = os.loadavg()[index]
  const numCpus = os.cpus().length
  const cpuUsagePercentage = (loadAvg / numCpus) * 100

  return roundWithNDigits(cpuUsagePercentage, 2)
}

export const getMemoryUsage = () => {
  const freeMemory = os.freemem()
  const totalMemory = os.totalmem()
  const memoryUsed = totalMemory - freeMemory
  const memoryUsagePercentage = (memoryUsed / totalMemory) * 100

  return {
    used: getGBFromBytes(memoryUsed),
    total: getGBFromBytes(totalMemory),
    percentage: roundWithNDigits(memoryUsagePercentage, 2),
  }
}

export const getUptime = () => {
  const sysUptimeInSeconds = os.uptime()
  const uptimeDuration = Duration.fromObject({ seconds: sysUptimeInSeconds })

  const days = Math.floor(uptimeDuration.as('days'))
  const hours = Math.floor(uptimeDuration.shiftTo('hours').hours % 24)
  const minutes = Math.floor(uptimeDuration.shiftTo('minutes').minutes % 60)

  return {
    days,
    hours,
    minutes,
  }
}

function roundWithNDigits(num: number, n: number) {
  const factor = Math.pow(10, n)
  return Math.round(num * factor) / factor
}

function getGBFromBytes(bytes: number) {
  const BYTES_TO_GB_RATIO = 1_000_000_000
  const value = roundWithNDigits(bytes / BYTES_TO_GB_RATIO, 1)

  return value
}
