import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – Voyago` : 'Voyago – planifică-ți călătoria'
  }, [title])
}
