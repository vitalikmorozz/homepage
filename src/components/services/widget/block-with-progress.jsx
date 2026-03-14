import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useContext, useMemo } from "react";

import { BlockHighlightContext } from "./highlight-context";

import { evaluateHighlight, getHighlightClass } from "utils/highlights";

function getBarColorClass(percent) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 75) return "bg-yellow-500";
  return "bg-green-500";
}

export default function BlockWithProgress({ value, label, field, bar }) {
  const { t } = useTranslation();
  const highlightConfig = useContext(BlockHighlightContext);

  const highlight = useMemo(() => {
    if (!highlightConfig) return null;
    const labels = Array.isArray(label) ? label : [label];
    const candidates = [];
    if (typeof field === "string") candidates.push(field);
    for (const candidateLabel of labels) {
      if (typeof candidateLabel === "string") candidates.push(candidateLabel);
    }

    for (const candidate of candidates) {
      const result = evaluateHighlight(candidate, value, highlightConfig);
      if (result) return result;
    }

    return null;
  }, [field, label, value, highlightConfig]);

  const highlightClass = useMemo(() => {
    if (!highlight?.level) return undefined;
    return getHighlightClass(highlight.level, highlightConfig);
  }, [highlight, highlightConfig]);

  const applyToValueOnly = highlight?.valueOnly === true;

  const barEnabled = bar?.enabled === true;
  const barOrientation = bar?.orientation || "horizontal";

  const percent = useMemo(() => {
    if (!barEnabled) return null;
    const { max, current } = bar;
    if (max == null || current == null) return null;
    if (max === 0) return 0;
    return Math.min(100, Math.max(0, (current / max) * 100));
  }, [barEnabled, bar]);

  const barColorClass = percent !== null ? getBarColorClass(percent) : "bg-green-500";
  const isVertical = barOrientation === "vertical";

  const progressBar =
    barEnabled && percent !== null ? (
      isVertical ? (
        <div className="h-full w-1 min-h-[2rem] bg-theme-800/30 dark:bg-theme-200/20 rounded-full flex flex-col justify-end overflow-hidden">
          <div
            className={classNames(barColorClass, "w-full rounded-full transition-all duration-1000")}
            style={{ height: `${percent}%` }}
          />
        </div>
      ) : (
        <div className="mt-1 w-full bg-theme-800/30 dark:bg-theme-200/20 rounded-full h-1 overflow-hidden">
          <div
            className={classNames(barColorClass, "h-1 rounded-full transition-all duration-1000")}
            style={{ width: `${percent}%` }}
          />
        </div>
      )
    ) : null;

  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex items-center justify-center text-center p-1",
        barEnabled && isVertical ? "flex-row gap-1" : "flex-col",
        value === undefined ? "animate-pulse" : "",
        highlightClass,
        "service-block",
      )}
      data-highlight-level={highlight?.level}
      data-highlight-source={highlight?.source}
    >
      {barEnabled && isVertical && progressBar}
      <div className={classNames("flex flex-col items-center justify-center", barEnabled && isVertical && "flex-1")}>
        <div className="font-thin text-sm">{value === undefined || value === null ? "-" : value}</div>
        <div
          className={classNames(
            "font-bold text-xs uppercase",
            applyToValueOnly && "text-theme-700 dark:text-theme-200",
          )}
        >
          {t(label)}
        </div>
      </div>
      {barEnabled && !isVertical && progressBar}
    </div>
  );
}
