import React from 'react';
import { cn } from './cn';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

/**
 * Data table.
 *   columns: [{ key, header, render?(row), className?, align? }]
 *   data:    array of row objects
 * Handles loading (skeleton rows) and empty states, and scrolls horizontally on mobile.
 */
export default function Table({ columns, data, loading, rowKey = 'id', emptyTitle = 'No records', emptyMessage, onRowClick, className }) {
  const align = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={cn('w-full overflow-x-auto rounded-sm border border-neutral-200 bg-white', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500', align[c.align] || 'text-left')}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10">
                <EmptyState title={emptyTitle} message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50', onRowClick && 'cursor-pointer')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 text-neutral-800', align[c.align] || 'text-left', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
