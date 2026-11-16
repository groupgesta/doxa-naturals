"use client";

import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "right";
  /** Spans the whole row on small screens (use for the main cell). */
  primary?: boolean;
  /** Skip the small caption shown above the cell on small screens. */
  hideLabel?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** CSS grid-template-columns shared by the header and every row. */
  template: string;
  label: string;
  empty?: ReactNode;
  pageSize?: number;
  pageSizes?: number[];
  /** When set, rows become expandable and this renders the open panel. */
  renderDetail?: (row: T) => ReactNode;
};

// 1 … 4 5 6 … 12
function pageList(current: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(pages - 1, current + 1);
  if (from > 2) out.push("gap");
  for (let p = from; p <= to; p++) out.push(p);
  if (to < pages - 1) out.push("gap");
  out.push(pages);
  return out;
}

/**
 * Generic table with paging. To reset the page when a filter changes, give the
 * component a `key` built from the filter values.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  template,
  label,
  empty = "Nothing to show.",
  pageSize = 10,
  pageSizes = [5, 10, 20, 50],
  renderDetail,
}: Props<T>) {
  const [size, setSize] = useState(pageSize);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages); // clamps when rows shrink
  const start = (current - 1) * size;
  const visible = rows.slice(start, start + size);

  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));
  const onKey = (e: KeyboardEvent, k: string) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(k);
    }
  };

  return (
    <div className="dt">
      <div
        className="dt-body"
        role="table"
        aria-label={label}
        style={{ "--cols": template } as CSSProperties}
      >
        <div className="dt-row dt-head" role="row">
          {columns.map((c) => (
            <span
              key={c.id}
              role="columnheader"
              className={c.align === "right" ? "right" : undefined}
            >
              {c.header}
            </span>
          ))}
        </div>

        {visible.length ? (
          visible.map((row) => {
            const k = rowKey(row);
            const isOpen = open === k;
            return (
              <div key={k} className={`dt-item${isOpen ? " open" : ""}`}>
                <div
                  className={`dt-row${renderDetail ? " clickable" : ""}`}
                  role="row"
                  {...(renderDetail && {
                    tabIndex: 0,
                    "aria-expanded": isOpen,
                    onClick: () => toggle(k),
                    onKeyDown: (e: KeyboardEvent) => onKey(e, k),
                  })}
                >
                  {columns.map((c) => (
                    <span
                      key={c.id}
                      role="cell"
                      data-label={c.hideLabel || !c.header ? undefined : c.header}
                      className={
                        [
                          c.align === "right" ? "right" : "",
                          c.primary ? "primary" : "",
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      {c.cell(row)}
                    </span>
                  ))}
                </div>
                {renderDetail && isOpen && (
                  <div className="dt-detail">{renderDetail(row)}</div>
                )}
              </div>
            );
          })
        ) : (
          <p className="dt-empty">{empty}</p>
        )}
      </div>

      {total > 0 && (
        <div className="dt-foot">
          <span className="dt-count">
            Showing {start + 1}–{Math.min(start + size, total)} of {total}
          </span>

          <label className="dt-size">
            Rows
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[...new Set([...pageSizes, pageSize])]
                .sort((a, b) => a - b)
                .map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </select>
          </label>

          {pages > 1 && (
            <nav className="dt-pager" aria-label={`${label} pages`}>
              <button
                aria-label="Previous page"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                ‹
              </button>
              {pageList(current, pages).map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="dt-gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={p === current ? "on" : undefined}
                    aria-label={`Page ${p}`}
                    aria-current={p === current ? "page" : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                aria-label="Next page"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                ›
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
