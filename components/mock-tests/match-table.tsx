type MatchItem = { text: string; textHindi?: string };

/** Two-column "Match the following" table (List-I lettered A, B, C… / List-II numbered 1, 2, 3…). */
export function MatchTable({
  left = [],
  right = [],
  compact = false,
}: {
  left?: MatchItem[];
  right?: MatchItem[];
  compact?: boolean;
}) {
  const rows = Math.max(left.length, right.length);
  if (rows === 0) return null;
  const cell = compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-surface-line">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-tint text-left">
            <th className={`${cell} w-1/2 font-semibold text-ink border-r border-surface-line`}>
              List-I <span className="font-normal text-ink-faint">/ सूची-I</span>
            </th>
            <th className={`${cell} w-1/2 font-semibold text-ink`}>
              List-II <span className="font-normal text-ink-faint">/ सूची-II</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-surface-line align-top">
              <td className={`${cell} text-ink border-r border-surface-line`}>
                {left[i] && (
                  <>
                    <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                    {left[i].text}
                    {left[i].textHindi && <span className="block text-ink-faint text-[0.85em] mt-0.5">{left[i].textHindi}</span>}
                  </>
                )}
              </td>
              <td className={`${cell} text-ink`}>
                {right[i] && (
                  <>
                    <span className="font-semibold mr-1.5">{i + 1}.</span>
                    {right[i].text}
                    {right[i].textHindi && <span className="block text-ink-faint text-[0.85em] mt-0.5">{right[i].textHindi}</span>}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
