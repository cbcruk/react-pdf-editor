import { useMemo, useState } from 'react'
import { documents } from './documents.ts'
import { Sidebar } from './components/sidebar/sidebar.tsx'
import { Toolbar } from './components/toolbar/toolbar.tsx'
import type { Surface } from './components/toolbar/toolbar.types.ts'
import { PdfPreview } from './components/pdf-preview/pdf-preview.tsx'
import { PropsPanel } from './components/props-panel/props-panel.tsx'
import { MigrateView } from './components/migrate-view/migrate-view.tsx'
import { BuilderView } from './builder/builder-view.tsx'

type View = 'document' | 'migrate' | 'builder'

export function App(): React.ReactElement {
  const [view, setView] = useState<View>('builder')
  const [activeSlug, setActiveSlug] = useState(documents[0]?.slug ?? '')
  const [surface, setSurface] = useState<Surface>('dark')
  const [overrides, setOverrides] = useState<Record<string, Record<string, unknown>>>({})

  const active = documents.find((doc) => doc.slug === activeSlug)
  const activeProps = active ? (overrides[active.slug] ?? active.previewProps) : {}

  const handleSelect = (slug: string): void => {
    setActiveSlug(slug)
    setView('document')
  }

  const handlePropsChange = (next: Record<string, unknown>): void => {
    if (!active) {
      return
    }

    setOverrides((prev) => ({ ...prev, [active.slug]: next }))
  }

  const documentElement = useMemo(
    () => (active ? <active.Component {...activeProps} /> : null),
    [active, activeProps],
  )

  return (
    <div style={styles.shell}>
      <Sidebar
        documents={documents}
        activeSlug={activeSlug}
        onSelect={handleSelect}
        migrateActive={view === 'migrate'}
        onMigrate={() => setView('migrate')}
        builderActive={view === 'builder'}
        onBuilder={() => setView('builder')}
      />
      {view === 'builder' ? (
        <BuilderView />
      ) : view === 'migrate' ? (
        <MigrateView />
      ) : (
        <>
          <main style={styles.preview}>
            {active && documentElement ? (
              <>
                <Toolbar
                  title={active.slug}
                  document={documentElement}
                  fileName={`${active.slug}.pdf`}
                  surface={surface}
                  onToggleSurface={() => setSurface((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                />
                <PdfPreview
                  document={documentElement}
                  background={surface === 'dark' ? '#525659' : '#e5e7eb'}
                />
              </>
            ) : (
              <div style={styles.empty}>No documents found in pdf/</div>
            )}
          </main>
          {active ? (
            <PropsPanel key={active.slug} value={activeProps} onChange={handlePropsChange} />
          ) : null}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
  },
  preview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#525659',
  },
  empty: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d1d5db',
    fontSize: 14,
  },
}
