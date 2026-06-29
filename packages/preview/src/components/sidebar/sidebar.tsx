import type { SidebarProps } from "./sidebar.types.ts";

export function Sidebar({
  documents,
  activeSlug,
  onSelect,
  migrateActive,
  onMigrate,
}: SidebarProps): React.ReactElement {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>react-pdf-editor</div>
      <div style={styles.sectionLabel}>Documents</div>
      <nav style={styles.nav}>
        {documents.map((doc) => {
          const isActive = !migrateActive && doc.slug === activeSlug;

          return (
            <button
              key={doc.slug}
              type="button"
              onClick={() => onSelect(doc.slug)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : null),
              }}
            >
              {doc.slug}
            </button>
          );
        })}
      </nav>
      <div style={styles.sectionLabel}>Tools</div>
      <nav style={styles.nav}>
        <button
          type="button"
          onClick={onMigrate}
          style={{
            ...styles.navItem,
            ...(migrateActive ? styles.navItemActive : null),
          }}
        >
          Migrate from HTML
        </button>
      </nav>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    borderRight: "1px solid #e5e7eb",
    padding: 16,
    boxSizing: "border-box",
    background: "#ffffff",
  },
  brand: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#9ca3af",
    margin: "12px 0 6px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  navItem: {
    appearance: "none",
    border: "none",
    background: "none",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
  },
  navItemActive: {
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: 600,
  },
};
