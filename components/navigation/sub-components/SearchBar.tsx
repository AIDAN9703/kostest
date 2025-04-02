'use client'

import { useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useSearchStore } from '@/store/useSearchStore'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  variant?: 'hero' | 'nav'
}

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const { 
    searchValue, 
    setSearchValue, 
    setAutocompleteRef 
  } = useSearchStore()
  
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      setAutocompleteRef(inputRef as React.RefObject<HTMLInputElement>)
    }
  }, [setAutocompleteRef])

  const styles = {
    container: variant === 'hero' 
      ? "w-full max-w-[90%] md:max-w-[75%] lg:max-w-[50%] mx-auto"
      : "w-full max-w-[300px] md:max-w-[400px]",
    input: variant === 'hero'
      ? "h-12 text-base md:text-lg bg-white rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      : "h-8 text-sm bg-white rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0",
    button: variant === 'hero'
      ? "h-12 w-12 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
      : "h-8 w-8 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
  }

  return (
    <div className={styles.container}>
      <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Where can we take you?"
          className={styles.input}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          autoComplete="off"
          aria-autocomplete="list"
          role="combobox"
        />
        <Button
          type="submit"
          variant="default"
          size={variant === 'hero' ? 'lg' : 'default'}
          className={`${styles.button} bg-gradient-to-r from-sky-300 to-emerald-400 hover:from-sky-400 hover:to-emerald-500`}
        >
          <Search size={variant === 'hero' ? 24 : 16} />
        </Button>
      </form>
    </div>
  )
} 