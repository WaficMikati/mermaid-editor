import { DELETE_TAB_WIDTH, NODE_LABEL_FONT_SIZE, ROUNDED_RADIUS, snapToGrid } from "./graphUtils"

export function getNodeCenter(nodes, nodeId) {
  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 }
}

export function getNodeConnectionPoint(node, toward, outward = 0) {
  if (!node) return { x: toward?.x ?? 0, y: toward?.y ?? 0 }
  const cx = node.x + node.width / 2
  const cy = node.y + node.height / 2
  const vx = (toward?.x ?? cx) - cx
  const vy = (toward?.y ?? cy) - cy
  const len = Math.hypot(vx, vy) || 1
  const ux = vx / len
  const uy = vy / len

  let t = 1
  if (node.shape === "circle") {
    const r = node.width / 2.5
    t = r / len
  } else if (node.shape === "diamond") {
    const hw = node.width / 2
    const hh = node.height / 2
    const denom = Math.abs(vx) / hw + Math.abs(vy) / hh
    t = denom > 0 ? 1 / denom : 0
  } else {
    const hw = node.width / 2
    const hh = node.height / 2
    const denom = Math.max(Math.abs(vx) / hw, Math.abs(vy) / hh)
    t = denom > 0 ? 1 / denom : 0
  }

  return {
    x: cx + vx * t + ux * outward,
    y: cy + vy * t + uy * outward,
  }
}

export function rectFromPoints(a, b) {
  const x1 = Math.min(a.x, b.x)
  const y1 = Math.min(a.y, b.y)
  const x2 = Math.max(a.x, b.x)
  const y2 = Math.max(a.y, b.y)
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, x2, y2 }
}

export function rectIntersects(r, n) {
  const nx1 = n.x
  const ny1 = n.y
  const nx2 = n.x + n.width
  const ny2 = n.y + n.height
  return !(nx2 < r.x || nx1 > r.x2 || ny2 < r.y || ny1 > r.y2)
}

export function isPointInHoverExitArea(node, p) {
  const pad = DELETE_TAB_WIDTH * 1.5

  if (node.shape === "circle") {
    const cx = node.x + node.width / 2
    const cy = node.y + node.height / 2
    const r = node.width / 2.5 + pad
    const dx = p.x - cx
    const dy = p.y - cy
    return dx * dx + dy * dy <= r * r
  }

  if (node.shape === "diamond") {
    const cx = node.x + node.width / 2
    const cy = node.y + node.height / 2
    const hw = node.width / 2 + pad
    const hh = node.height / 2 + pad
    return Math.abs(p.x - cx) / hw + Math.abs(p.y - cy) / hh <= 1
  }

  return (
    p.x >= node.x - pad &&
    p.x <= node.x + node.width + pad &&
    p.y >= node.y - pad &&
    p.y <= node.y + node.height + pad
  )
}

export function computeGraphBounds(nodes, padding = 60) {
  if (!nodes.length) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 600, width: 1000, height: 600 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  }
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

export function snapNodeTopLeftToCenterGrid(x, y, width, height) {
  return {
    x: snapToGrid(x + width / 2) - width / 2,
    y: snapToGrid(y + height / 2) - height / 2,
  }
}

export function buildExportSvgString({ nodes, edges, background = "white" }) {
  const bounds = computeGraphBounds(nodes, 60)
  const w = Math.max(1, Math.ceil(bounds.width))
  const h = Math.max(1, Math.ceil(bounds.height))

  const markerId = "arrowhead"

  const escapeXml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

  const nodeSvg = nodes
    .map((node) => {
      const fill = "#f0f9ff"
      const stroke = "#94a3b8"
      const labelX = node.x + node.width / 2
      const labelY = node.y + node.height / 2

      let shapeEl = ""
      if (node.shape === "diamond") {
        const points = `${node.x + node.width / 2},${node.y} ${node.x + node.width},${node.y +
          node.height / 2} ${node.x + node.width / 2},${node.y + node.height} ${node.x},${node.y +
          node.height / 2}`
        shapeEl = `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`
      } else if (node.shape === "circle") {
        const cx = node.x + node.width / 2
        const cy = node.y + node.height / 2
        const r = node.width / 2.5
        shapeEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`
      } else if (node.shape === "stadium") {
        shapeEl = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.height /
          2}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`
      } else if (node.shape === "rounded") {
        shapeEl = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${ROUNDED_RADIUS}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`
      } else {
        shapeEl = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`
      }

      const textEl = `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="#0f172a" font-size="${NODE_LABEL_FONT_SIZE}" font-weight="500" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(
        node.label
      )}</text>`

      return `${shapeEl}${textEl}`
    })
    .join("")

  const edgeSvg = edges
    .map((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)
      const fromCenter = getNodeCenter(nodes, edge.from)
      const toCenter = getNodeCenter(nodes, edge.to)
      const from = fromNode ? getNodeConnectionPoint(fromNode, toCenter, 2) : fromCenter
      const to = toNode ? getNodeConnectionPoint(toNode, fromCenter, 6) : toCenter
      const stroke = "#64748b"

      const line = `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="2" marker-end="url(#${markerId})" />`

      if (!edge.label) return line

      const tx = (from.x + to.x) / 2
      const ty = (from.y + to.y) / 2
      const label = escapeXml(edge.label)
      const labelWidth = Math.max(18, String(edge.label).length * 7 + 10)
      const labelHeight = 18
      const bg = `<rect x="${tx - labelWidth / 2}" y="${ty - labelHeight / 2}" width="${labelWidth}" height="${labelHeight}" rx="4" fill="white" />`
      const text = `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-size="12" font-weight="500" font-family="Segoe UI, system-ui, sans-serif">${label}</text>`

      return `${line}${bg}${text}`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <defs>
    <marker id="${markerId}" markerWidth="12" markerHeight="12" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
    </marker>
  </defs>
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${background}" />
  ${edgeSvg}
  ${nodeSvg}
</svg>`
}

