'use client';

import { useThemeConfig } from '@/shared/admin/components/active-theme';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

const DEFAULT_THEMES = [
  {
    name: 'Default',
    value: 'default'
  },
  {
    name: 'Gold',
    value: 'gold'
  },
  {
    name: 'Blue',
    value: 'blue'
  },
  {
    name: 'Green',
    value: 'green'
  },
  {
    name: 'Amber',
    value: 'amber'
  }
];

const MONO_THEMES = [
  {
    name: 'Mono',
    value: 'mono'
  }
];

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id='theme-selector'
          className='justify-start gap-2 *:data-[slot=select-value]:w-12 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-hidden'
        >
          <span className='text-muted-foreground hidden sm:block'>
            Select a theme:
          </span>
          <SelectValue placeholder='Select a theme' />
        </SelectTrigger>
        <SelectContent align='end'>
          <SelectGroup>
            <SelectLabel>Default</SelectLabel>
            {DEFAULT_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Monospaced</SelectLabel>
            {MONO_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
