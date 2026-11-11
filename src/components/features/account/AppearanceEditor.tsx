import { Segmented } from '@/components/ui/Segmented'
import { BRAND_THEMES, brandName, type ColorMode } from '@/utils/helpers/brand'

export interface AppearanceValue {
  brandTheme?: string
  colorMode?: ColorMode
}

/** A partial change; `null` clears the choice so the inherited value applies. */
export type AppearancePatch = { brandTheme?: string | null; colorMode?: ColorMode | null }

interface AppearanceEditorProps {
  value: AppearanceValue
  onChange: (patch: AppearancePatch) => void
  /** What applies when nothing is chosen here, e.g. the workspace default. */
  inherited: { label: string; brandTheme: string; colorMode: ColorMode | null }
  disabled?: boolean
}

const INHERIT = '__inherit'

/** Brand colour and light/dark mode, each with an "inherit" option. */
export function AppearanceEditor({ value, onChange, inherited, disabled }: AppearanceEditorProps) {
  const selected = value.brandTheme ?? INHERIT
  const inheritedTheme = BRAND_THEMES.find((t) => t.id === inherited.brandTheme) ?? BRAND_THEMES[0]
  const tiles = [
    { id: INHERIT, name: inherited.label, description: `Uses ${brandName(inherited.brandTheme)}.`, rgb: inheritedTheme.rgb, shades: inheritedTheme.shades, inherit: true },
    ...BRAND_THEMES.map((t) => ({ ...t, inherit: false })),
  ]
  const mode = value.colorMode ?? INHERIT
  return (
    <fieldset disabled={disabled}>
      <div className="fw-medium fs-sm mb-2">Colour theme</div>
      <div className="brand-picker mb-5" role="radiogroup" aria-label="Colour theme">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected === t.id}
            className={`brand-option${t.inherit ? ' is-inherit' : ''}`}
            style={{ ['--swatch-rgb' as string]: t.rgb }}
            onClick={() => onChange({ brandTheme: t.id === INHERIT ? null : t.id })}
          >
            <span className="brand-swatch" aria-hidden="true">
              {t.shades.map((c) => <span key={c} style={{ background: c }} />)}
            </span>
            <span className="brand-option-name">
              {t.inherit ? <span><i className="ri-links-line me-1" />{t.name}</span> : t.name}
              {selected === t.id && <i className="ri-checkbox-circle-fill" aria-hidden="true" />}
            </span>
            <small>{t.description}</small>
          </button>
        ))}
      </div>
      <div className="fw-medium fs-sm mb-2">Light or dark</div>
      <Segmented<string>
        ariaLabel="Light or dark mode"
        value={mode}
        onChange={(v) => onChange({ colorMode: v === INHERIT ? null : (v as ColorMode) })}
        options={[
          { value: INHERIT, label: inherited.colorMode ? `${inherited.label} (${inherited.colorMode})` : inherited.label, icon: 'ri-links-line' },
          { value: 'light', label: 'Light', icon: 'ri-sun-line' },
          { value: 'dark', label: 'Dark', icon: 'ri-moon-line' },
        ]}
      />
    </fieldset>
  )
}
