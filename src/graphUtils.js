export const GRID_SIZE = 20
export const NODE_WIDTH = 140
export const NODE_HEIGHT = 60
export const DECISION_NODE_WIDTH = 180
export const DECISION_NODE_HEIGHT = 100
export const CIRCLE_NODE_SIZE = 160
export const ROUNDED_RADIUS = 12
export const DELETE_TAB_WIDTH = 32
export const DELETE_TAB_HEIGHT = 26
export const LABEL_WRAP_CHAR_LIMIT = 18
export const NODE_LABEL_FONT_SIZE = 14
export const NODE_LABEL_LINE_HEIGHT = 16
export const NODE_LABEL_CHAR_WIDTH = 8
export const NODE_LABEL_PAD_X = 6
export const NODE_LABEL_BOX_VERTICAL_PAD = 8
export const NODE_CONNECT_ICON_SIZE = 14
export const NODE_CONNECT_ICON_GAP = 6
export const NODE_TEXT_BLOCK_OUTER_PAD = 8
export const NODE_LAYOUT_CHAR_STEP = 4
export const DIAMOND_TEXT_EDGE_PAD = 8
export const DIAMOND_FIT_RATIO = 0.92
export const RESET_ZOOM_TOP_PADDING = 80
export const NODE_CONTENT_INSET = 10

export const NODE_SHAPES = {
  rounded: { label: "Start/End", mermaid: "()" },
  rectangle: { label: "Process", mermaid: "[]" },
  diamond: { label: "Decision", mermaid: "{}" },
  circle: { label: "Connector", mermaid: "(())" },
  stadium: { label: "Stadium", mermaid: "([])" },
}

export const NODE_BASE_LABELS = {
  rectangle: "Process",
  rounded: "Start",
  diamond: "Decision",
  circle: "Connector",
  stadium: "Stadium",
}

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE

export const getShapeSize = (shape) => {
  if (shape === "diamond") return { width: DECISION_NODE_WIDTH, height: DECISION_NODE_HEIGHT }
  if (shape === "circle") return { width: CIRCLE_NODE_SIZE, height: CIRCLE_NODE_SIZE }
  return { width: NODE_WIDTH, height: NODE_HEIGHT }
}

export const indexToAlphaId = (index) => {
  let n = Math.max(1, Number(index) || 1)
  let out = ""
  while (n > 0) {
    n -= 1
    out = String.fromCharCode(65 + (n % 26)) + out
    n = Math.floor(n / 26)
  }
  return out
}

export const getNextAvailableNodeId = (nodes) => {
  const used = new Set(nodes.map((n) => String(n.id)))
  let next = 1
  while (used.has(indexToAlphaId(next))) next += 1
  return indexToAlphaId(next)
}

export const normalizeMermaidLabel = (label) => String(label ?? "")

export const autoLayoutByDirection = (nodes, edges, direction) => {
  if (!nodes.length) return nodes
  const dir = String(direction || "TD").toUpperCase()
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const indegree = new Map(nodes.map((n) => [n.id, 0]))
  const children = new Map(nodes.map((n) => [n.id, []]))

  for (const e of edges) {
    if (!byId.has(e.from) || !byId.has(e.to)) continue
    indegree.set(e.to, (indegree.get(e.to) || 0) + 1)
    children.get(e.from).push(e.to)
  }

  const queue = []
  for (const n of nodes) {
    if ((indegree.get(n.id) || 0) === 0) queue.push(n.id)
  }
  if (!queue.length && nodes[0]) queue.push(nodes[0].id)

  const levelById = new Map()
  for (const id of queue) levelById.set(id, 0)

  const processed = new Set()
  while (queue.length) {
    const id = queue.shift()
    if (processed.has(id)) continue
    processed.add(id)
    const curLevel = levelById.get(id) || 0
    for (const childId of children.get(id) || []) {
      const nextLevel = curLevel + 1
      if (!levelById.has(childId) || nextLevel > levelById.get(childId)) {
        levelById.set(childId, nextLevel)
      }
      const nextIn = (indegree.get(childId) || 0) - 1
      indegree.set(childId, nextIn)
      if (nextIn === 0) queue.push(childId)
    }
  }

  for (const n of nodes) {
    if (!levelById.has(n.id)) levelById.set(n.id, 0)
  }

  const groups = new Map()
  for (const n of nodes) {
    const lv = levelById.get(n.id) || 0
    if (!groups.has(lv)) groups.set(lv, [])
    groups.get(lv).push(n)
  }

  const levels = Array.from(groups.keys()).sort((a, b) => a - b)
  const maxLevel = levels.length ? levels[levels.length - 1] : 0
  const majorGap = 180
  const minorGap = 220
  const originX = 140
  const originY = 120

  return nodes.map((n) => {
    const rawLevel = levelById.get(n.id) || 0
    const level = dir === "BT" || dir === "RL" ? maxLevel - rawLevel : rawLevel
    const row = groups.get(rawLevel) || [n]
    const idx = row.findIndex((r) => r.id === n.id)
    const count = row.length
    const offset = idx - (count - 1) / 2

    let centerX = 0
    let centerY = 0

    if (dir === "LR" || dir === "RL") {
      centerX = snapToGrid(originX + level * majorGap)
      centerY = snapToGrid(originY + offset * minorGap)
    } else {
      centerX = snapToGrid(originX + offset * minorGap)
      centerY = snapToGrid(originY + level * majorGap)
    }

    return {
      ...n,
      x: centerX - n.width / 2,
      y: centerY - n.height / 2,
    }
  })
}

export const getWrappedLineCount = (label, maxCharsPerLine = LABEL_WRAP_CHAR_LIMIT) => {
  const text = String(label ?? "")
  if (!text) return 1
  const safeLimit = Math.max(1, maxCharsPerLine)
  return text.split("\n").reduce((count, segment) => {
    const len = segment.length
    return count + Math.max(1, Math.ceil(len / safeLimit))
  }, 0)
}

export const getBaseCharsPerLineForShape = (shape) => {
  const base = getShapeSize(shape)
  const baseInnerWidth =
    shape === "circle"
      ? Math.max(44, base.width / 1.25 - NODE_CONTENT_INSET * 2)
      : Math.max(44, base.width - NODE_CONTENT_INSET * 2)
  return Math.max(
    1,
    Math.floor((baseInnerWidth - NODE_LABEL_PAD_X * 2) / NODE_LABEL_CHAR_WIDTH)
  )
}

export const getAdaptiveLabelLayout = (label, shape) => {
  const text = String(label ?? "")
  const baseChars = getBaseCharsPerLineForShape(shape)
  const longestSegmentLength = text
    .split("\n")
    .reduce((maxLen, segment) => Math.max(maxLen, segment.length), 0)
  // Start from a tighter fit so short labels don't render as overly wide boxes.
  let charsPerLine = clamp(Math.max(3, longestSegmentLength || 1), 3, baseChars)
  let lineBudget = 1
  let growWidthNext = true
  let renderedLineCount = getWrappedLineCount(text, charsPerLine)
  let guard = 0

  while (renderedLineCount > lineBudget && guard < 512) {
    if (growWidthNext) {
      charsPerLine += NODE_LAYOUT_CHAR_STEP
    } else {
      lineBudget += 1
    }
    growWidthNext = !growWidthNext
    renderedLineCount = getWrappedLineCount(text, charsPerLine)
    guard += 1
  }

  return {
    charsPerLine,
    lineCount: Math.max(1, renderedLineCount),
    chipWidth:
      NODE_LABEL_PAD_X * 2 + Math.max(18, charsPerLine * NODE_LABEL_CHAR_WIDTH),
    labelHeight: Math.max(
      24,
      Math.max(1, renderedLineCount) * NODE_LABEL_LINE_HEIGHT + NODE_LABEL_BOX_VERTICAL_PAD
    ),
  }
}

export const canDiamondFitLabel = (nodeWidth, nodeHeight, chipWidth, labelHeight) => {
  const usableHalfW = Math.max(1, nodeWidth / 2 - DIAMOND_TEXT_EDGE_PAD)
  const usableHalfH = Math.max(1, nodeHeight / 2 - DIAMOND_TEXT_EDGE_PAD)
  const halfChip = chipWidth / 2
  const halfLabel = labelHeight / 2

  if (halfChip > usableHalfW || halfLabel > usableHalfH) return false
  return halfChip / usableHalfW + halfLabel / usableHalfH <= DIAMOND_FIT_RATIO
}

export const getDiamondRenderChipLayout = (label, nodeWidth, nodeHeight) => {
  let charsPerLine = getBaseCharsPerLineForShape("diamond")
  let lineCount = 1
  let labelHeight = 24
  let maxChipWidth = Math.max(24, nodeWidth - DIAMOND_TEXT_EDGE_PAD * 2)

  for (let i = 0; i < 24; i += 1) {
    lineCount = getWrappedLineCount(label, charsPerLine)
    labelHeight = Math.max(24, lineCount * NODE_LABEL_LINE_HEIGHT + NODE_LABEL_BOX_VERTICAL_PAD)

    const usableHalfW = Math.max(1, nodeWidth / 2 - DIAMOND_TEXT_EDGE_PAD)
    const usableHalfH = Math.max(1, nodeHeight / 2 - DIAMOND_TEXT_EDGE_PAD)
    const halfLabel = labelHeight / 2
    const widthFactor = 1 - halfLabel / usableHalfH
    const allowedHalfW = widthFactor > 0 ? usableHalfW * widthFactor * DIAMOND_FIT_RATIO : 0
    maxChipWidth = Math.max(24, allowedHalfW * 2)

    const nextChars = Math.max(
      1,
      Math.floor((maxChipWidth - NODE_LABEL_PAD_X * 2) / NODE_LABEL_CHAR_WIDTH)
    )
    if (nextChars === charsPerLine) break
    charsPerLine = nextChars
  }

  const desiredChipWidth =
    NODE_LABEL_PAD_X * 2 + Math.max(18, charsPerLine * NODE_LABEL_CHAR_WIDTH)

  return {
    lineCount,
    labelHeight,
    chipWidth: clamp(desiredChipWidth, 24, maxChipWidth),
  }
}

export const getNodeSizeForLabel = (label, shape) => {
  const base = getShapeSize(shape)
  const layout = getAdaptiveLabelLayout(label, shape)
  // Include container padding + connector icon block so wrapped labels can grow vertically.
  const desiredHeight =
    layout.labelHeight + NODE_CONNECT_ICON_SIZE + NODE_CONNECT_ICON_GAP + NODE_TEXT_BLOCK_OUTER_PAD * 2

  if (shape === "circle") {
    // Circle uses r = width/2.5 and inner diameter ~= width/1.25; keep it square.
    const neededInner = Math.max(
      layout.chipWidth,
      layout.labelHeight + NODE_CONNECT_ICON_SIZE + NODE_CONNECT_ICON_GAP + NODE_TEXT_BLOCK_OUTER_PAD
    ) + NODE_CONTENT_INSET * 2
    const needed = snapToGrid(neededInner * 1.25)
    const size = Math.max(base.width, needed)
    return { width: size, height: size }
  }
  if (shape === "diamond") {
    let width = Math.max(base.width, snapToGrid(layout.chipWidth + NODE_CONTENT_INSET * 2))
    let height = Math.max(base.height, snapToGrid(desiredHeight))
    let growWidthNext = true
    let guard = 0

    while (!canDiamondFitLabel(width, height, layout.chipWidth, layout.labelHeight) && guard < 200) {
      if (growWidthNext) width = snapToGrid(width + GRID_SIZE)
      else height = snapToGrid(height + GRID_SIZE)
      growWidthNext = !growWidthNext
      guard += 1
    }

    return { width, height }
  }

  return {
    width: Math.max(base.width, snapToGrid(layout.chipWidth + NODE_CONTENT_INSET * 2)),
    height: Math.max(base.height, snapToGrid(desiredHeight)),
  }
}

export const getAutoNodeLabel = (shape, nodes) => {
  const base = NODE_BASE_LABELS[shape] || "Node"
  const countForShape = nodes.filter((n) => n.shape === shape).length + 1
  return countForShape === 1 ? base : `${base} ${countForShape}`
}

