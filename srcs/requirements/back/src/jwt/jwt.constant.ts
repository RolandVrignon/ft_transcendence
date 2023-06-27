import { randomBytes } from 'crypto'

const generateSecretKey = (length: number): string => { return randomBytes(length).toString('hex') }
export const jwtConstants = { secret: generateSecretKey(32) }
