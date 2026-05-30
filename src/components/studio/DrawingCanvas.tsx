"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Shape, Connection, ShapeType, AnchorPosition,
  SHAPE_DEFAULTS, FILL_COLORS, STROKE_COLORS,
  getAnchorPoint, snap, uid, nearestAnchor, connectionPath, shapeSvgPath,
} from "@/lib/drawing";
import { Trash } from "@/components/ui/Icons";

type Tool = "select" | "connect" | ShapeType;

interface HistoryEntry { shapes: Shape[]; connections: Connection[] }

const GRID = 20;
const MIN_SIZE = 40;

// ── tiny toolbar icons ──────────────────────────────────────────────
function TIcon({ d, ...p }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}

const TOOLS: { key: Tool; label: string; icon: React.ReactNode }[] = [
  { key: "select",       label: "Select (V)",        icon: <TIcon d="M5 3l14 8-6 2-3 6z M12 13l5 7" /> },
  { key: "rectangle",    label: "Rectangle (R)",     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="5" width="18" height="14" rx="1" /></svg> },
  { key: "rounded-rect", label: "Rounded Rect",      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="5" width="18" height="14" rx="5" /></svg> },
  { key: "ellipse",      label: "Ellipse (O)",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><ellipse cx="12" cy="12" rx="9" ry="7" /></svg> },
  { key: "diamond",      label: "Diamond (D)",       icon: <TIcon d="M12 3 L21 12 L12 21 L3 12 Z" /> },
  { key: "triangle",     label: "Triangle",          icon: <TIcon d="M12 4 L21 20 L3 20 Z" /> },
  { key: "cylinder",     label: "Cylinder",          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" opacity=".4" /></svg> },
  { key: "hexagon",      label: "Hexagon",           icon: <TIcon d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" /> },
  { key: "text",         label: "Text (T)",          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4h12M12 4v16M8 20h8" /></svg> },
  { key: "connect",      label: "Connect (C)",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="5" r="2.5" /><path d="M7 17L17 7" /><path d="M14 5h5v5" /></svg> },
];

export default function DrawingCanvas() {
  // ── state ────────────────────────────────────────────────────────
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; orig: Shape } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; fromAnchor: AnchorPosition; mx: number; my: number } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; vx: number; vy: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [viewBox, setViewBox] = useState({ x: -100, y: -100, w: 1400, h: 900 });
  const [spaceHeld, setSpaceHeld] = useState(false);

  // undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([{ shapes: [], connections: [] }]);
  const [histIdx, setHistIdx] = useState(0);

  // drag-and-drop from palette
  const [dropPreview, setDropPreview] = useState<{ type: ShapeType; x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── helpers ──────────────────────────────────────────────────────
  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return {
      x: (clientX - r.left) / r.width  * viewBox.w + viewBox.x,
      y: (clientY - r.top)  / r.height * viewBox.h + viewBox.y,
    };
  }, [viewBox]);

  const pushHistory = useCallback((s: Shape[], c: Connection[]) => {
    setHistory((h) => {
      const next = [...h.slice(0, histIdx + 1), { shapes: s, connections: c }];
      if (next.length > 50) next.shift();
      return next;
    });
    setHistIdx((i) => Math.min(i + 1, 50));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    setShapes(prev.shapes);
    setConnections(prev.connections);
    setHistIdx(histIdx - 1);
  }, [history, histIdx]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    setShapes(next.shapes);
    setConnections(next.connections);
    setHistIdx(histIdx + 1);
  }, [history, histIdx]);

  const selectedShape = shapes.find((s) => selectedIds.includes(s.id));

  // ── keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId) return;
      if (e.key === " ") { e.preventDefault(); setSpaceHeld(true); }
      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "r" || e.key === "R") setTool("rectangle");
      if (e.key === "o" || e.key === "O") setTool("ellipse");
      if (e.key === "d" || e.key === "D") setTool("diamond");
      if (e.key === "t") setTool("text");
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) setTool("connect");
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length) {
        e.preventDefault();
        const ids = new Set(selectedIds);
        const nextShapes = shapes.filter((s) => !ids.has(s.id));
        const nextConns = connections.filter((c) => !ids.has(c.fromId) && !ids.has(c.toId));
        setShapes(nextShapes);
        setConnections(nextConns);
        setSelectedIds([]);
        pushHistory(nextShapes, nextConns);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey)  { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); }
      if (e.key === "Escape") { setSelectedIds([]); setTool("select"); }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " ") setSpaceHeld(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKeyUp); };
  }, [editingId, selectedIds, shapes, connections, pushHistory, undo, redo]);

  // ── mouse handlers ───────────────────────────────────────────────
  const onCanvasDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || spaceHeld) {
      setPanning({ startX: e.clientX, startY: e.clientY, vx: viewBox.x, vy: viewBox.y });
      return;
    }
    const target = (e.target as SVGElement).closest("[data-shape-id]") as SVGElement | null;
    const anchorEl = (e.target as SVGElement).closest("[data-anchor]") as SVGElement | null;
    const handleEl = (e.target as SVGElement).closest("[data-handle]") as SVGElement | null;
    const pt = toSvg(e.clientX, e.clientY);

    // resize handle
    if (handleEl) {
      const shapeId = handleEl.getAttribute("data-shape-id")!;
      const handle = handleEl.getAttribute("data-handle")!;
      const shape = shapes.find((s) => s.id === shapeId);
      if (shape) {
        setResizing({ id: shapeId, handle, startX: pt.x, startY: pt.y, orig: { ...shape } });
      }
      return;
    }

    // anchor (start connection)
    if (anchorEl && tool === "connect") {
      const shapeId = anchorEl.getAttribute("data-shape-id")!;
      const anchor = anchorEl.getAttribute("data-anchor") as AnchorPosition;
      setConnecting({ fromId: shapeId, fromAnchor: anchor, mx: pt.x, my: pt.y });
      return;
    }

    // shape click
    if (target && tool === "select") {
      const id = target.getAttribute("data-shape-id")!;
      if (e.shiftKey) {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
      } else {
        setSelectedIds([id]);
      }
      const shape = shapes.find((s) => s.id === id)!;
      setDragging({ id, ox: pt.x - shape.x, oy: pt.y - shape.y });
      return;
    }

    // connect tool on shape
    if (target && tool === "connect") {
      const id = target.getAttribute("data-shape-id")!;
      const shape = shapes.find((s) => s.id === id)!;
      const anchor = nearestAnchor(shape, pt.x, pt.y);
      setConnecting({ fromId: id, fromAnchor: anchor, mx: pt.x, my: pt.y });
      return;
    }

    // place shape
    if (tool !== "select" && tool !== "connect" && !target) {
      const defaults = SHAPE_DEFAULTS[tool];
      const sx = snap(pt.x - defaults.width / 2);
      const sy = snap(pt.y - defaults.height / 2);
      const newShape: Shape = {
        id: uid(), type: tool, x: sx, y: sy,
        width: defaults.width, height: defaults.height,
        text: tool === "text" ? "Text" : "",
        fill: tool === "text" ? "none" : "#1e1e26",
        stroke: "#a1a1aa",
        strokeWidth: 1.4,
      };
      const next = [...shapes, newShape];
      setShapes(next);
      setSelectedIds([newShape.id]);
      setTool("select");
      pushHistory(next, connections);
      if (tool === "text") {
        setEditingId(newShape.id);
        setEditText("Text");
      }
      return;
    }

    // deselect
    if (!target) {
      setSelectedIds([]);
    }
  }, [tool, shapes, connections, viewBox, spaceHeld, toSvg, pushHistory]);

  const onCanvasMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pt = toSvg(e.clientX, e.clientY);

    if (panning) {
      const svg = svgRef.current!;
      const r = svg.getBoundingClientRect();
      const dx = (e.clientX - panning.startX) / r.width  * viewBox.w;
      const dy = (e.clientY - panning.startY) / r.height * viewBox.h;
      setViewBox({ ...viewBox, x: panning.vx - dx, y: panning.vy - dy });
      return;
    }

    if (dragging) {
      setShapes((prev) => prev.map((s) =>
        s.id === dragging.id ? { ...s, x: snap(pt.x - dragging.ox), y: snap(pt.y - dragging.oy) } : s
      ));
      return;
    }

    if (resizing) {
      const { handle, orig, startX, startY } = resizing;
      const dx = pt.x - startX;
      const dy = pt.y - startY;
      setShapes((prev) => prev.map((s) => {
        if (s.id !== resizing.id) return s;
        let { x, y, width: w, height: h } = orig;
        if (handle.includes("e")) w = Math.max(MIN_SIZE, snap(w + dx));
        if (handle.includes("w")) { const nw = Math.max(MIN_SIZE, snap(w - dx)); x = snap(orig.x + (w - nw)); w = nw; }
        if (handle.includes("s")) h = Math.max(MIN_SIZE, snap(h + dy));
        if (handle.includes("n")) { const nh = Math.max(MIN_SIZE, snap(h - dy)); y = snap(orig.y + (h - nh)); h = nh; }
        return { ...s, x, y, width: w, height: h };
      }));
      return;
    }

    if (connecting) {
      setConnecting({ ...connecting, mx: pt.x, my: pt.y });
      return;
    }

    // hover detection
    const target = (e.target as SVGElement).closest("[data-shape-id]");
    setHoveredId(target ? target.getAttribute("data-shape-id") : null);
  }, [dragging, resizing, connecting, panning, toSvg, viewBox]);

  const onCanvasUp = useCallback(() => {
    if (dragging) {
      pushHistory(shapes, connections);
      setDragging(null);
    }
    if (resizing) {
      pushHistory(shapes, connections);
      setResizing(null);
    }
    if (connecting) {
      // find target shape under cursor
      const target = shapes.find((s) =>
        s.id !== connecting.fromId &&
        connecting.mx >= s.x && connecting.mx <= s.x + s.width &&
        connecting.my >= s.y && connecting.my <= s.y + s.height
      );
      if (target) {
        const toAnchor = nearestAnchor(target, connecting.mx, connecting.my);
        const newConn: Connection = {
          id: uid(),
          fromId: connecting.fromId,
          toId: target.id,
          fromAnchor: connecting.fromAnchor,
          toAnchor,
          label: "",
          style: "solid",
          stroke: "#a1a1aa",
        };
        const next = [...connections, newConn];
        setConnections(next);
        pushHistory(shapes, next);
      }
      setConnecting(null);
    }
    if (panning) setPanning(null);
  }, [dragging, resizing, connecting, panning, shapes, connections, pushHistory]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.08 : 0.93;
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    setViewBox((vb) => {
      const nw = Math.max(400, Math.min(6000, vb.w * factor));
      const nh = Math.max(300, Math.min(4500, vb.h * factor));
      return {
        x: vb.x + (vb.w - nw) * mx,
        y: vb.y + (vb.h - nh) * my,
        w: nw,
        h: nh,
      };
    });
  }, []);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as SVGElement).closest("[data-shape-id]");
    if (!target) return;
    const id = target.getAttribute("data-shape-id")!;
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;
    setEditingId(id);
    setEditText(shape.text);
    setSelectedIds([id]);
  }, [shapes]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const next = shapes.map((s) => s.id === editingId ? { ...s, text: editText } : s);
    setShapes(next);
    pushHistory(next, connections);
    setEditingId(null);
  }, [editingId, editText, shapes, connections, pushHistory]);

  // ── drag-and-drop from palette ────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const shapeType = e.dataTransfer.types.includes("application/shape-type")
      ? dropPreview?.type
      : null;
    if (!shapeType) return;
    const pt = toSvg(e.clientX, e.clientY);
    const defaults = SHAPE_DEFAULTS[shapeType];
    setDropPreview({
      type: shapeType,
      x: snap(pt.x - defaults.width / 2),
      y: snap(pt.y - defaults.height / 2),
    });
  }, [toSvg, dropPreview?.type]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData("application/shape-type") as ShapeType;
    if (!shapeType || !SHAPE_DEFAULTS[shapeType]) { setDropPreview(null); return; }
    const pt = toSvg(e.clientX, e.clientY);
    const defaults = SHAPE_DEFAULTS[shapeType];
    const newShape: Shape = {
      id: uid(), type: shapeType,
      x: snap(pt.x - defaults.width / 2),
      y: snap(pt.y - defaults.height / 2),
      width: defaults.width, height: defaults.height,
      text: shapeType === "text" ? "Text" : "",
      fill: shapeType === "text" ? "none" : "#1e1e26",
      stroke: "#a1a1aa", strokeWidth: 1.4,
    };
    const next = [...shapes, newShape];
    setShapes(next);
    setSelectedIds([newShape.id]);
    setTool("select");
    pushHistory(next, connections);
    setDropPreview(null);
    if (shapeType === "text") {
      setEditingId(newShape.id);
      setEditText("Text");
    }
  }, [toSvg, shapes, connections, pushHistory]);

  const onDragLeave = useCallback(() => {
    setDropPreview(null);
  }, []);

  const onPaletteDragStart = useCallback((e: React.DragEvent, shapeType: ShapeType) => {
    e.dataTransfer.setData("application/shape-type", shapeType);
    e.dataTransfer.effectAllowed = "copy";
    setDropPreview({ type: shapeType, x: 0, y: 0 });
    // custom drag image: small transparent pixel so the browser default ghost is minimal
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);

  // ── property updates ─────────────────────────────────────────────
  const updateSelected = useCallback((patch: Partial<Shape>) => {
    const ids = new Set(selectedIds);
    const next = shapes.map((s) => ids.has(s.id) ? { ...s, ...patch } : s);
    setShapes(next);
    pushHistory(next, connections);
  }, [selectedIds, shapes, connections, pushHistory]);

  // ── render helpers ───────────────────────────────────────────────
  function renderShape(s: Shape) {
    const isSelected = selectedIds.includes(s.id);
    const isHovered = hoveredId === s.id;
    const showAnchors = (isSelected || isHovered) && (tool === "connect" || tool === "select");

    const common = {
      fill: s.fill === "none" ? "transparent" : s.fill,
      stroke: isSelected ? "#6366f1" : s.stroke,
      strokeWidth: isSelected ? 2 : s.strokeWidth,
      style: { cursor: tool === "select" ? "move" : "crosshair" } as React.CSSProperties,
    };

    let shapeEl: React.ReactNode;
    switch (s.type) {
      case "rectangle":
        shapeEl = <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={2} {...common} />;
        break;
      case "rounded-rect":
        shapeEl = <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={14} {...common} />;
        break;
      case "ellipse":
        shapeEl = <ellipse cx={s.x + s.width / 2} cy={s.y + s.height / 2} rx={s.width / 2} ry={s.height / 2} {...common} />;
        break;
      case "cylinder": {
        const ry = s.height * 0.12;
        shapeEl = (
          <g {...common}>
            <path d={`M${s.x},${s.y + ry} L${s.x},${s.y + s.height - ry} A${s.width / 2},${ry} 0 0,0 ${s.x + s.width},${s.y + s.height - ry} L${s.x + s.width},${s.y + ry}`}
              fill={common.fill} stroke={common.stroke} strokeWidth={common.strokeWidth} />
            <ellipse cx={s.x + s.width / 2} cy={s.y + ry} rx={s.width / 2} ry={ry}
              fill={common.fill} stroke={common.stroke} strokeWidth={common.strokeWidth} />
            <ellipse cx={s.x + s.width / 2} cy={s.y + s.height - ry} rx={s.width / 2} ry={ry}
              fill="transparent" stroke={common.stroke} strokeWidth={common.strokeWidth} strokeDasharray="4 3" opacity={0.4} />
          </g>
        );
        break;
      }
      case "text":
        shapeEl = <rect x={s.x} y={s.y} width={s.width} height={s.height} fill="transparent" stroke="transparent" strokeWidth={0} />;
        break;
      default:
        shapeEl = <path d={shapeSvgPath(s.type, s.x, s.y, s.width, s.height)} {...common} />;
    }

    const textY = s.y + s.height / 2;
    const textX = s.x + s.width / 2;

    return (
      <g key={s.id} data-shape-id={s.id}>
        {shapeEl}
        {s.text && editingId !== s.id && (
          <text x={textX} y={textY} textAnchor="middle" dominantBaseline="central"
            fill="#f4f4f5" fontSize={s.type === "text" ? 16 : 13} fontFamily="Geist, system-ui, sans-serif"
            pointerEvents="none" fontWeight={s.type === "text" ? 500 : 400}>
            {s.text}
          </text>
        )}

        {/* anchor points */}
        {showAnchors && (["top", "right", "bottom", "left"] as AnchorPosition[]).map((a) => {
          const pt = getAnchorPoint(s, a);
          return (
            <circle key={a} data-anchor={a} data-shape-id={s.id}
              cx={pt.x} cy={pt.y} r={5}
              fill="#6366f1" stroke="#fff" strokeWidth={1.5}
              style={{ cursor: "crosshair" }} opacity={0.9} />
          );
        })}

        {/* resize handles */}
        {isSelected && tool === "select" && (
          <>
            {[
              { h: "nw", x: s.x,           y: s.y,            cur: "nwse-resize" },
              { h: "ne", x: s.x + s.width,  y: s.y,            cur: "nesw-resize" },
              { h: "sw", x: s.x,           y: s.y + s.height,  cur: "nesw-resize" },
              { h: "se", x: s.x + s.width,  y: s.y + s.height,  cur: "nwse-resize" },
              { h: "n",  x: s.x + s.width / 2, y: s.y,           cur: "ns-resize" },
              { h: "s",  x: s.x + s.width / 2, y: s.y + s.height, cur: "ns-resize" },
              { h: "w",  x: s.x,               y: s.y + s.height / 2, cur: "ew-resize" },
              { h: "e",  x: s.x + s.width,      y: s.y + s.height / 2, cur: "ew-resize" },
            ].map(({ h, x, y, cur }) => (
              <rect key={h} data-handle={h} data-shape-id={s.id}
                x={x - 4} y={y - 4} width={8} height={8} rx={1.5}
                fill="#111116" stroke="#6366f1" strokeWidth={1.5}
                style={{ cursor: cur }} />
            ))}
          </>
        )}
      </g>
    );
  }

  function renderConnection(c: Connection) {
    const from = shapes.find((s) => s.id === c.fromId);
    const to = shapes.find((s) => s.id === c.toId);
    if (!from || !to) return null;
    const fp = getAnchorPoint(from, c.fromAnchor);
    const tp = getAnchorPoint(to, c.toAnchor);
    const path = connectionPath(fp, c.fromAnchor, tp, c.toAnchor);
    return (
      <g key={c.id}>
        <path d={path} fill="none" stroke={c.stroke} strokeWidth={1.6}
          strokeDasharray={c.style === "dashed" ? "6 4" : undefined}
          markerEnd="url(#arrowhead)" />
        {c.label && (
          <text x={(fp.x + tp.x) / 2} y={(fp.y + tp.y) / 2 - 8}
            textAnchor="middle" fill="#a1a1aa" fontSize={11} fontFamily="Geist, system-ui, sans-serif">
            {c.label}
          </text>
        )}
      </g>
    );
  }

  // ── editing overlay position ─────────────────────────────────────
  const editShape = editingId ? shapes.find((s) => s.id === editingId) : null;
  let editPos = { left: 0, top: 0, width: 0 };
  if (editShape && svgRef.current) {
    const r = svgRef.current.getBoundingClientRect();
    editPos = {
      left: r.left + ((editShape.x + editShape.width / 2 - viewBox.x) / viewBox.w) * r.width - 60,
      top:  r.top  + ((editShape.y + editShape.height / 2 - viewBox.y) / viewBox.h) * r.height - 14,
      width: 120,
    };
  }

  // ── zoom level ───────────────────────────────────────────────────
  const zoomPct = Math.round(1400 / viewBox.w * 100);
  const zoomIn  = () => setViewBox((vb) => ({ ...vb, w: Math.max(400, vb.w * 0.9), h: Math.max(300, vb.h * 0.9) }));
  const zoomOut = () => setViewBox((vb) => ({ ...vb, w: Math.min(6000, vb.w * 1.1), h: Math.min(4500, vb.h * 1.1) }));
  const zoomFit = () => setViewBox({ x: -100, y: -100, w: 1400, h: 900 });

  return (
    <div className="flex-1 flex flex-col bg-bg-1 overflow-hidden min-h-0 relative">
      {/* property bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-bg/50 text-[11.5px] min-h-[34px] overflow-x-auto scrollbar-hide">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-fg-mute shrink-0">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span className="text-fg-mute shrink-0">Draw</span>
        <span className="text-fg-faint mx-1 hidden sm:inline">·</span>
        <span className="text-fg-mute hidden sm:inline shrink-0">{shapes.length} shapes</span>

        {selectedShape && (
          <>
            <span className="w-px h-4 bg-border mx-1" />
            <span className="text-fg-mute shrink-0">Fill</span>
            <div className="flex gap-0.5">
              {FILL_COLORS.slice(0, 10).map((c) => (
                <button key={c} onClick={() => updateSelected({ fill: c })}
                  className="w-4 h-4 rounded-sm border cursor-pointer hover:scale-125 transition-transform shrink-0"
                  style={{
                    background: c === "none" ? "transparent" : c,
                    borderColor: selectedShape.fill === c ? "#6366f1" : "rgba(255,255,255,0.1)",
                    backgroundImage: c === "none" ? "linear-gradient(45deg, #f87171 50%, transparent 50%)" : undefined,
                  }}
                  title={c === "none" ? "No fill" : c} />
              ))}
            </div>
            <span className="text-fg-mute shrink-0 ml-1">Stroke</span>
            <div className="flex gap-0.5">
              {STROKE_COLORS.slice(0, 7).map((c) => (
                <button key={c} onClick={() => updateSelected({ stroke: c })}
                  className="w-4 h-4 rounded-sm border cursor-pointer hover:scale-125 transition-transform shrink-0"
                  style={{
                    background: c,
                    borderColor: selectedShape.stroke === c ? "#6366f1" : "rgba(255,255,255,0.1)",
                  }}
                  title={c} />
              ))}
            </div>
            <span className="w-px h-4 bg-border mx-1" />
            <button onClick={() => {
              const ids = new Set(selectedIds);
              const nextS = shapes.filter((s) => !ids.has(s.id));
              const nextC = connections.filter((c) => !ids.has(c.fromId) && !ids.has(c.toId));
              setShapes(nextS); setConnections(nextC); setSelectedIds([]);
              pushHistory(nextS, nextC);
            }}
              className="p-1 rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-bad transition-colors shrink-0">
              <Trash size={13} />
            </button>
          </>
        )}
        <span className="flex-1" />
        <span className="text-fg-faint hidden md:inline shrink-0">
          {tool === "select" ? "Click to select · Drag to move · Drag shapes from palette" :
           tool === "connect" ? "Click shape to start connection" :
           "Click canvas to place · or drag from palette"}
        </span>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* shape palette */}
        <div className="w-11 shrink-0 border-r border-border bg-bg flex flex-col gap-0.5 p-1 overflow-y-auto scrollbar-hide">
          {TOOLS.map((t) => {
            const isShape = t.key !== "select" && t.key !== "connect";
            return (
              <button key={t.key} title={t.label} onClick={() => setTool(t.key)}
                draggable={isShape}
                onDragStart={isShape ? (e) => onPaletteDragStart(e, t.key as ShapeType) : undefined}
                className={`w-9 h-9 rounded-md border-0 flex items-center justify-center transition-all duration-100 ${
                  tool === t.key ? "bg-accent/20 text-accent-2" : "bg-transparent text-fg-mute hover:text-fg-dim hover:bg-bg-3"
                } ${isShape ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}>
                {t.icon}
              </button>
            );
          })}

          <div className="flex-1" />
          <div className="w-7 h-px bg-border mx-auto my-1" />
          <button title="Undo (Ctrl+Z)" onClick={undo} disabled={histIdx <= 0}
            className="w-9 h-9 rounded-md border-0 bg-transparent text-fg-mute flex items-center justify-center cursor-pointer hover:text-fg-dim disabled:opacity-30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={histIdx >= history.length - 1}
            className="w-9 h-9 rounded-md border-0 bg-transparent text-fg-mute flex items-center justify-center cursor-pointer hover:text-fg-dim disabled:opacity-30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        {/* SVG canvas drop zone */}
        <div ref={canvasWrapRef} className="flex-1 relative min-w-0 min-h-0"
          onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave}>
        <svg ref={svgRef} className="w-full h-full outline-none block"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          onMouseDown={onCanvasDown}
          onMouseMove={onCanvasMove}
          onMouseUp={onCanvasUp}
          onMouseLeave={onCanvasUp}
          onDoubleClick={onDoubleClick}
          onWheel={onWheel}
          style={{ cursor: spaceHeld || panning ? "grab" : tool === "select" ? "default" : "crosshair" }}
        >
          <defs>
            <pattern id="draw-grid" x="0" y="0" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <circle cx={GRID / 2} cy={GRID / 2} r="0.8" fill="rgba(255,255,255,0.06)" />
            </pattern>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
              <polygon points="0 0, 10 3.5, 0 7" fill="#a1a1aa" />
            </marker>
          </defs>

          <rect x={viewBox.x - 2000} y={viewBox.y - 2000} width={viewBox.w + 4000} height={viewBox.h + 4000}
            fill="url(#draw-grid)" />

          {connections.map(renderConnection)}
          {shapes.map(renderShape)}

          {/* active connection line */}
          {connecting && (() => {
            const from = shapes.find((s) => s.id === connecting.fromId);
            if (!from) return null;
            const fp = getAnchorPoint(from, connecting.fromAnchor);
            return (
              <line x1={fp.x} y1={fp.y} x2={connecting.mx} y2={connecting.my}
                stroke="#6366f1" strokeWidth={1.6} strokeDasharray="6 4"
                pointerEvents="none" markerEnd="url(#arrowhead)" />
            );
          })()}

          {/* drop preview ghost */}
          {dropPreview && (() => {
            const { type, x, y } = dropPreview;
            const defaults = SHAPE_DEFAULTS[type];
            const w = defaults.width, h = defaults.height;
            const ghostProps = { fill: "rgba(99,102,241,0.08)", stroke: "#6366f1", strokeWidth: 1.6, strokeDasharray: "6 4", pointerEvents: "none" as const, opacity: 0.7 };
            switch (type) {
              case "rectangle":    return <rect x={x} y={y} width={w} height={h} rx={2} {...ghostProps} />;
              case "rounded-rect": return <rect x={x} y={y} width={w} height={h} rx={14} {...ghostProps} />;
              case "ellipse":      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...ghostProps} />;
              case "text":         return <rect x={x} y={y} width={w} height={h} {...ghostProps} strokeDasharray="4 4" />;
              default:             return <path d={shapeSvgPath(type, x, y, w, h)} {...ghostProps} />;
            }
          })()}
        </svg>
        </div>
      </div>

      {/* inline text editor */}
      {editingId && editShape && (
        <input ref={inputRef} value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
          className="fixed z-50 px-2 py-1 rounded bg-bg-3 border border-accent text-fg text-sm text-center font-sans focus:outline-none"
          style={{ left: editPos.left, top: editPos.top, width: editPos.width }}
        />
      )}

      {/* zoom controls */}
      <div className="absolute right-3 bottom-3 flex bg-bg-2 border border-border rounded-md overflow-hidden">
        <button onClick={zoomOut} className="h-[26px] px-2 bg-transparent border-0 border-r border-border text-fg-mute text-sm cursor-pointer hover:bg-bg-3">−</button>
        <span className="font-mono text-[11px] text-fg-dim self-center px-2 min-w-[40px] text-center">{zoomPct}%</span>
        <button onClick={zoomIn} className="h-[26px] px-2 bg-transparent border-0 border-l border-border text-fg-mute text-sm cursor-pointer hover:bg-bg-3">+</button>
        <button onClick={zoomFit} className="h-[26px] px-2 bg-transparent border-0 border-l border-border text-fg-mute text-[10px] font-mono cursor-pointer hover:bg-bg-3">FIT</button>
      </div>

      {/* keyboard hints */}
      <div className="absolute left-14 bottom-3 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-2 border border-border rounded-md text-[10.5px] text-fg-mute">
        <span className="kbd text-[9px]">V</span>select
        <span className="text-fg-faint mx-0.5">·</span>
        <span className="kbd text-[9px]">R</span>rect
        <span className="text-fg-faint mx-0.5">·</span>
        <span className="kbd text-[9px]">C</span>connect
        <span className="text-fg-faint mx-0.5">·</span>
        <span className="kbd text-[9px]">Space</span>pan
        <span className="text-fg-faint mx-0.5">·</span>
        <span className="kbd text-[9px]">Del</span>delete
      </div>
    </div>
  );
}
