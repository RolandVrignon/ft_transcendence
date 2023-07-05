import { randomBytes } from 'crypto'

// const generateSecretKey = (length: number): string => { return randomBytes(length).toString('hex') }
export const jwtConstants = { secret: process.env.JWT_CONSTANT_SECRET }