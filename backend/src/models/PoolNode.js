import mongoose from 'mongoose';

// 3x10 Global Pool Matrix
// Each node: position (level, column), parent ref, children refs
const poolNodeSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    level: { type: Number, required: true },            // 1–10
    position: { type: Number, required: true },         // position in that level (1-based)
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'PoolNode', default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PoolNode' }],
    qualifiedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('PoolNode', poolNodeSchema);
