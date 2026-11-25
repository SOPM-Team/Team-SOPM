import { useMemo } from 'react'
import { TripContext } from './tripContext.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { toSavedCountry } from '../data/countries.js'

// Starea călătoriei curente, partajată între pagini: destinație, selecții, buget, zbor
export default function TripProvider({ children }) {
  const [country, setCountry] = useLocalStorage('selectedCountry', null)
  const [pois, setPois] = useLocalStorage('selectedPOIs', [])
  const [budget, setBudget] = useLocalStorage('budgetInputs', {})
  const [flight, setFlight] = useLocalStorage('selectedFlight', null)

  const value = useMemo(
    () => ({
      country,
      pois,
      budget,
      flight,
      setPois,
      setBudget,
      setFlight,
      // alegerea unei țări noi șterge selecțiile vechi
      chooseCountry(c) {
        setCountry(toSavedCountry(c))
        setPois([])
      },
    }),
    [country, pois, budget, flight, setCountry, setPois, setBudget, setFlight],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}
