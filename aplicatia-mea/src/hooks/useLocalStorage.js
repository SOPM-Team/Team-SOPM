import { useEffect, useState } from 'react'
import { readStorage, removeStorage, writeStorage } from '../lib/storage.js'

// Ca useState, dar valoarea se păstrează în localStorage (aceleași chei ca site-ul vechi)
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue))

  useEffect(() => {
    if (value === null || value === undefined) removeStorage(key)
    else writeStorage(key, value)
  }, [key, value])

  return [value, setValue]
}
