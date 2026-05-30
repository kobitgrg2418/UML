export type ShapeType =
  | "rectangle"
  | "rounded-rect"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "cylinder"
  | "hexagon"
  | "text";

export type AnchorPosition = "top" | "right" | "bottom" | "left";

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromAnchor: AnchorPosition;
  toAnchor: AnchorPosition;
  label: string;
  style: "solid" | "dashed";
  stroke: string;
}

export const SHAPE_DEFAULTS: Record<ShapeType, { width: number; height: number }> = {
  rectangle:      { width: 140, height: 80 },
  "rounded-rect": { width: 140, height: 80 },
  ellipse:        { width: 110, height: 80 },
  diamond:        { width: 110, height: 110 },
  triangle:       { width: 110, height: 100 },
  cylinder:       { width: 100, height: 110 },
  hexagon:        { width: 130, height: 90 },
  text:           { width: 120, height: 40 },
};

export const FILL_COLORS = [
  "none",
  "#1e1e26",
  "#111116",
  "#1a1a2e",
  "#162447",
  "#1b4332",
  "#462523",
  "#3d2c5e",
  "#6366f1",
  "#818cf8",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#f87171",
  "#22d3ee",
];

export const STROKE_COLORS = [
  "#a1a1aa",
  "#f4f4f5",
  "#6366f1",
  "#818cf8",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#f87171",
  "#22d3ee",
];

export function getAnchorPoint(shape: Shape, anchor: AnchorPosition) {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  switch (anchor) {
    case "top":    return { x: cx, y: shape.y };
    case "right":  return { x: shape.x + shape.width, y: cy };
    case "bottom": return { x: cx, y: shape.y + shape.height };
    case "left":   return { x: shape.x, y: cy };
  }
}

export function snap(value: number, grid: number = 20): number {
  return Math.round(value / grid) * grid;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function nearestAnchor(shape: Shape, px: number, py: number): AnchorPosition {
  const anchors: AnchorPosition[] = ["top", "right", "bottom", "left"];
  let best = anchors[0];
  let min = Infinity;
  for (const a of anchors) {
    const pt = getAnchorPoint(shape, a);
    const d = Math.hypot(pt.x - px, pt.y - py);
    if (d < min) { min = d; best = a; }
  }
  return best;
}

export function connectionPath(
  from: { x: number; y: number },
  fromAnchor: AnchorPosition,
  to: { x: number; y: number },
  toAnchor: AnchorPosition
): string {
  const cp = Math.min(80, Math.hypot(to.x - from.x, to.y - from.y) * 0.4);
  let c1x = from.x, c1y = from.y, c2x = to.x, c2y = to.y;
  switch (fromAnchor) {
    case "top":    c1y -= cp; break;
    case "bottom": c1y += cp; break;
    case "left":   c1x -= cp; break;
    case "right":  c1x += cp; break;
  }
  switch (toAnchor) {
    case "top":    c2y -= cp; break;
    case "bottom": c2y += cp; break;
    case "left":   c2x -= cp; break;
    case "right":  c2x += cp; break;
  }
  return `M${from.x},${from.y} C${c1x},${c1y} ${c2x},${c2y} ${to.x},${to.y}`;
}

export function shapeSvgPath(type: ShapeType, x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2, cy = y + h / 2;
  switch (type) {
    case "diamond":
      return `M${cx},${y} L${x + w},${cy} L${cx},${y + h} L${x},${cy} Z`;
    case "triangle":
      return `M${cx},${y} L${x + w},${y + h} L${x},${y + h} Z`;
    case "hexagon": {
      const off = w * 0.22;
      return `M${x + off},${y} L${x + w - off},${y} L${x + w},${cy} L${x + w - off},${y + h} L${x + off},${y + h} L${x},${cy} Z`;
    }
    default:
      return "";
  }
}
