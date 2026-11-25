import { createContext, useContext } from 'react'

export const TripContext = createContext(null)
export const useTrip = () => useContext(TripContext)
