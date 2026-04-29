import PoolNode from '../models/PoolNode.js';
import User from '../models/User.js';

const MAX_LEVELS = 10;
const CHILDREN_PER_NODE = 3;

/**
 * Add agent to global 3x10 matrix pool.
 * Returns the PoolNode created.
 */
export async function addAgentToPool(agentId) {
  // Check not already in pool
  const existing = await PoolNode.findOne({ agent: agentId });
  if (existing) return existing;

  // Find the first node that has <3 children, BFS
  const allNodes = await PoolNode.find().sort({ level: 1, position: 1 });

  let parentNode = null;
  for (const node of allNodes) {
    if (node.level >= MAX_LEVELS) continue;
    if (node.children.length < CHILDREN_PER_NODE) {
      parentNode = node;
      break;
    }
  }

  // Determine level and position
  let level, position;
  if (!parentNode) {
    // First node - root
    level = 1;
    position = 1;
  } else {
    level = parentNode.level + 1;
    const siblingsCount = await PoolNode.countDocuments({ level });
    position = siblingsCount + 1;
  }

  const newNode = await PoolNode.create({
    agent: agentId,
    level,
    position,
    parent: parentNode?._id || null,
  });

  if (parentNode) {
    await PoolNode.findByIdAndUpdate(parentNode._id, { $push: { children: newNode._id } });
  }

  await User.findByIdAndUpdate(agentId, { inGlobalPool: true });
  return newNode;
}

/**
 * Get global pool tree structure (for visualization, max 3 levels deep from root)
 */
export async function getPoolTree() {
  const nodes = await PoolNode.find({ isActive: true })
    .populate('agent', 'name email')
    .sort({ level: 1, position: 1 });
  return nodes;
}
