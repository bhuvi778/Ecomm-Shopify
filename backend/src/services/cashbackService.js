import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import CashbackEntry from '../models/CashbackEntry.js';

const LEVELS = [0.10, 0.01, 0.01, 0.01, 0.01]; // level1=10%, levels2-5=1% each

/**
 * Distribute referral commission up 5 levels when a purchase is made.
 * @param {ObjectId} buyerId - User who made the purchase
 * @param {ObjectId} orderId - The order
 * @param {Number} purchaseAmount - Net purchase amount
 */
export async function distributeReferralCommission(buyerId, orderId, purchaseAmount) {
  let currentUser = await User.findById(buyerId);
  for (let level = 0; level < LEVELS.length; level++) {
    if (!currentUser?.referredBy) break;
    const referrer = await User.findById(currentUser.referredBy);
    if (!referrer) break;

    const commission = Math.floor(purchaseAmount * LEVELS[level]);
    if (commission > 0) {
      await User.findByIdAndUpdate(referrer._id, { $inc: { walletPoints: commission } });
      await Transaction.create({
        user: referrer._id,
        type: 'referral',
        points: commission,
        description: `Level ${level + 1} referral commission from purchase`,
        reference: orderId,
        refModel: 'Order',
      });
    }
    currentUser = referrer;
  }
}

/**
 * Create cashback schedule for a fresh order (2% × 50 months).
 */
export async function createCashbackSchedule(userId, orderId, orderAmount) {
  const nextPayDate = new Date();
  nextPayDate.setMonth(nextPayDate.getMonth() + 1);
  await CashbackEntry.create({
    user: userId,
    order: orderId,
    orderAmount,
    nextPayDate,
  });
}

/**
 * Process due cashback entries (run monthly via cron or on-demand).
 */
export async function processDueCashbacks() {
  const now = new Date();
  const due = await CashbackEntry.find({ completed: false, nextPayDate: { $lte: now } });
  for (const entry of due) {
    const cashbackAmount = Math.floor(entry.orderAmount * entry.monthlyRate);
    await User.findByIdAndUpdate(entry.user, { $inc: { walletPoints: cashbackAmount } });
    await Transaction.create({
      user: entry.user,
      type: 'cashback',
      points: cashbackAmount,
      description: `Monthly 2% cashback - month ${entry.paidMonths + 1}/${entry.totalMonths}`,
      reference: entry.order,
      refModel: 'Order',
    });
    entry.paidMonths += 1;
    if (entry.paidMonths >= entry.totalMonths) {
      entry.completed = true;
    } else {
      const next = new Date(entry.nextPayDate);
      next.setMonth(next.getMonth() + 1);
      entry.nextPayDate = next;
    }
    await entry.save();
  }
  return due.length;
}

/**
 * Apply 5% monthly ROI on wallet balance (to discourage withdrawal).
 */
export async function applyWalletRoi() {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const users = await User.find({
    walletPoints: { $gt: 0 },
    $or: [{ lastRoiApplied: null }, { lastRoiApplied: { $lte: oneMonthAgo } }],
  });

  for (const user of users) {
    const roi = Math.floor(user.walletPoints * 0.05);
    if (roi > 0) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { walletPoints: roi },
        lastRoiApplied: now,
      });
      await Transaction.create({
        user: user._id,
        type: 'roi',
        points: roi,
        description: '5% monthly ROI on wallet balance',
      });
    }
  }
  return users.length;
}

/**
 * Process agent monthly cashback (10% for 30 months pre-launch / 20 months post).
 */
export async function processAgentCashbacks() {
  const agents = await User.find({
    isAgent: true,
    $expr: { $lt: ['$agentCashbackPaid', '$agentCashbackMonths'] },
  });

  for (const agent of agents) {
    const monthlyAmount = Math.floor(agent.agentFee * 0.10);
    await User.findByIdAndUpdate(agent._id, {
      $inc: { walletPoints: monthlyAmount, agentCashbackPaid: 1 },
    });
    await Transaction.create({
      user: agent._id,
      type: 'agent_cashback',
      points: monthlyAmount,
      description: `Agent 10% monthly cashback - month ${agent.agentCashbackPaid + 1}/${agent.agentCashbackMonths}`,
    });
  }
  return agents.length;
}
