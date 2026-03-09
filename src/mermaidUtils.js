import {
  autoLayoutByDirection,
  getNextAvailableNodeId,
  normalizeMermaidLabel,
} from "./graphUtils"
import { computeGraphBounds, getNodeCenter } from "./geometryUtils"

export function inferFlowDirection(nodes, edges) {
  if (edges.length > 0) {
    let sumAbsDx = 0
    let sumAbsDy = 0
    let sumDx = 0
    let sumDy = 0

    for (const edge of edges) {
      const from = getNodeCenter(nodes, edge.from)
      const to = getNodeCenter(nodes, edge.to)
      const dx = to.x - from.x
      const dy = to.y - from.y
      sumAbsDx += Math.abs(dx)
      sumAbsDy += Math.abs(dy)
      sumDx += dx
      sumDy += dy
    }

    if (sumAbsDx >= sumAbsDy) return sumDx >= 0 ? "LR" : "RL"
    return sumDy >= 0 ? "TD" : "BT"
  }

  if (nodes.length > 1) {
    const bounds = computeGraphBounds(nodes, 0)
    return bounds.width >= bounds.height ? "LR" : "TD"
  }

  return "TD"
}

export function generateMermaidCode(nodes, edges, directionOverride) {
  const direction = directionOverride || inferFlowDirection(nodes, edges)
  let code = `flowchart ${direction}\n`
  const escapeQuotedLabel = (value) =>
    String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "<br/>")
  const escapeEdgeLabel = (value) =>
    String(value ?? "")
      .replace(/\n/g, " ")
      .replace(/\|/g, "&#124;")
  const shapeText = {
    rectangle: (label) => `["${label}"]`,
    rounded: (label) => `("${label}")`,
    diamond: (label) => `{"${label}"}`,
    circle: (label) => `(("${label}"))`,
    stadium: (label) => `(["${label}"])`,
  }
  const nodeToken = (node) => {
    const mk = shapeText[node.shape] || shapeText.rectangle
    return `${node.id}${mk(escapeQuotedLabel(node.label))}`
  }
  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const connectedIds = new Set()

  for (const edge of edges) {
    connectedIds.add(edge.from)
    connectedIds.add(edge.to)
    const fromNode = nodeById.get(edge.from)
    const toNode = nodeById.get(edge.to)
    const fromToken = fromNode ? nodeToken(fromNode) : edge.from
    const toToken = toNode ? nodeToken(toNode) : edge.to
    const arrow = edge.label ? `-->|${escapeEdgeLabel(edge.label)}|` : "-->"
    code += `    ${fromToken} ${arrow} ${toToken}\n`
  }

  for (const node of nodes) {
    if (connectedIds.has(node.id)) continue
    code += `    ${nodeToken(node)}\n`
  }
  return code
}

export function parseMermaidCode(code) {
  try {
    const directionMatch = code.match(/^\s*flowchart\s+([A-Za-z]{2})/im)
    const parsedDirection = directionMatch ? directionMatch[1].toUpperCase() : "TD"
    const lines = code
      .split("\n")
      .map((raw, idx) => ({ raw, trimmed: raw.trim(), lineNo: idx + 1 }))
      .filter((l) => l.trimmed && !l.trimmed.toLowerCase().startsWith("flowchart"))

    const nodes = []
    const edges = []
    let maxEdgeId = 0
    const modernShapeMap = {
      rect: "rectangle",
      rounded: "rounded",
      diamond: "diamond",
      circle: "circle",
      stadium: "stadium",
    }
    const modernNodeRe =
      /^([A-Za-z0-9_-]+)\s*\[\["([^"]*)"\]\]$|^([A-Za-z0-9_-]+)\s*\(\"([^\"]*)\"\)$|^([A-Za-z0-9_-]+)\s*\{(\"[^\"]*\"|[^}]*)\}$|^([A-Za-z0-9_-]+)\s*\(\(\"([^\"]*)\"\)\)$|^([A-Za-z0-9_-]+)\s*\(\[\"([^"]*)\"\]\)$/

    const parseModernNodeToken = (rawLine) => {
      const m = rawLine.match(modernNodeRe)
      if (!m) return null
      const groups = [
        { id: m[1], label: m[2], shape: "rectangle" },
        { id: m[3], label: m[4], shape: "rounded" },
        { id: m[5], label: m[6], shape: "diamond" },
        { id: m[7], label: m[8], shape: "circle" },
        { id: m[9], label: m[10], shape: "stadium" },
      ]
      const g = groups.find((g) => g.id)
      if (!g) return null
      return { id: g.id, label: g.label ?? "", shape: g.shape }
    }

    const parseLegacyNodeToken = (token) => {
      const m = token.match(
        /^([A-Za-z0-9_-]+)\s*(\(\(.*\)\)|\(\[.*\]\)|\(.+\)|\{.+\}|\[.+\])\s*$/
      )
      if (!m) return null
      const id = m[1]
      const shapeToken = m[2]
      let shape = "rectangle"
      let label = shapeToken
      if (shapeToken.startsWith("((") && shapeToken.endsWith("))")) {
        shape = "circle"
        label = shapeToken.slice(2, -2)
      } else if (shapeToken.startsWith("(") && shapeToken.endsWith(")")) {
        shape = "rounded"
        label = shapeToken.slice(1, -1)
      } else if (shapeToken.startsWith("{") && shapeToken.endsWith("}")) {
        shape = "diamond"
        label = shapeToken.slice(1, -1)
      } else if (shapeToken.startsWith("[") && shapeToken.endsWith("]")) {
        shape = "rectangle"
        label = shapeToken.slice(1, -1)
      }
      return { id, label, shape }
    }

    const decodeMermaidLabel = (value) =>
      normalizeMermaidLabel(value).replace(/<br\/>/g, "\n").replace(/&#124;/g, "|")

    const byId = new Map()
    const upsertParsedNode = ({ id, label, shape }) => {
      const existing = byId.get(id)
      if (existing) {
        existing.label = normalizeMermaidLabel(label || existing.label)
        if (shape) existing.shape = shape
        return existing
      }
      const node = {
        id,
        label: normalizeMermaidLabel(label),
        shape: modernShapeMap[shape] || shape || "rectangle",
      }
      byId.set(id, node)
      nodes.push(node)
      return node
    }

    const addNodeIfMissing = (id) => {
      if (!id) return
      if (!byId.has(id)) {
        upsertParsedNode({ id, label: id, shape: "rectangle" })
      }
    }

    const upsertNodeFromToken = (token) => {
      const modern = parseModernNodeToken(token)
      if (modern) return upsertParsedNode(modern).id
      const legacy = parseLegacyNodeToken(token)
      if (legacy) return upsertParsedNode(legacy).id
      return null
    }

    const edgeRe =
      /^([A-Za-z0-9_-]+)(?:\s+|\s*(?:-->|==>)\s*)(?:\|([^|]+)\|)?\s*([A-Za-z0-9_-]+)$/
    const handled = new Set()

    for (const lineInfo of lines) {
      const line = lineInfo.trimmed
      const m = line.match(edgeRe)
      if (!m) continue
      const [, fromToken, label = "", toToken] = m
      const from = upsertNodeFromToken(fromToken)
      const to = upsertNodeFromToken(toToken)
      if (!from || !to) continue
      maxEdgeId += 1
      edges.push({
        id: `e${maxEdgeId}`,
        from,
        to,
        label: decodeMermaidLabel(label.trim()),
        type: "arrow",
      })
      addNodeIfMissing(from)
      addNodeIfMissing(to)
      handled.add(lineInfo.lineNo)
    }

    for (const lineInfo of lines) {
      const line = lineInfo.trimmed
      const modern = parseModernNodeToken(line)
      if (modern) {
        upsertParsedNode(modern)
        handled.add(lineInfo.lineNo)
        continue
      }
      const nm = line.match(
        /^([A-Za-z0-9_-]+)\s*(\(\(.*\)\)|\(\[.*\]\)|\(.+\)|\{.+\}|\[.+\])\s*$/
      )
      if (!nm) continue
      upsertNodeFromToken(line)
      handled.add(lineInfo.lineNo)
    }

    const ignorable =
      /^(%%|subgraph\b|end\b|classDef\b|class\b|style\b|linkStyle\b|click\b|direction\b)/i
    const unsupported = lines
      .filter((l) => !handled.has(l.lineNo) && !ignorable.test(l.trimmed))
      .map((l) => `${l.lineNo}: ${l.trimmed}`)

    if (unsupported.length) {
      return {
        ok: false,
        error: `Unsupported Mermaid syntax in line(s):\n${unsupported.join("\n")}`,
      }
    }

    if (nodes.length === 0) return { ok: false, error: "No nodes found." }
    const laidOutNodes = autoLayoutByDirection(nodes, edges, parsedDirection)

    return {
      ok: true,
      nodes: laidOutNodes,
      edges,
      flowDirection: parsedDirection,
      nextNodeId: getNextAvailableNodeId(laidOutNodes),
      nextEdgeId: maxEdgeId + 1,
    }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

