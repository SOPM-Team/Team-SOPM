import { fireEvent, render, screen } from '@testing-library/react'
import CountryCard from './CountryCard.jsx'
import { FALLBACK } from '../data/countries.js'

describe('CountryCard', () => {
  it('afișează țara și apelează onSelect la click', () => {
    const onSelect = vi.fn()
    render(<CountryCard country={FALLBACK[0]} selected={false} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Franța' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Alege destinația' }))
    expect(onSelect).toHaveBeenCalledWith(FALLBACK[0])
  })

  it('marchează destinația aleasă', () => {
    render(<CountryCard country={FALLBACK[0]} selected onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /Destinație aleasă/ })).toBeInTheDocument()
  })
})
