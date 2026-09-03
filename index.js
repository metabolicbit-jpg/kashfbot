// ═══════════════════════════════════════════
// 🌱 KashfBot — بات کشف مخاطب واقعی
// ═══════════════════════════════════════════

const BOT_NAME = "کشف";
const CLUB_CHANNEL = "@KashfClub";
const BASE_PRICE = 100;
const COMMISSION_RATE = 0.2;
const RETENTION_HOURS = 48;
const WELCOME_BONUS = 10;
const REWARD_COINS = 4;
const PENALTY_COINS = 8;
const TAGS = ["ورزش","طنز","اخبار","تکنولوژی","فروشگاهی","آموزشی","هنر","آشپزی","بازی","مذهبی"];

// ─── کلاینت API بله ─────────────────────────
async function bale(env, method, payload = {}) {
  const res = await fetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}
const sendMsg = (env, chat_id, text, reply_markup) =>
  bale(env, "sendMessage", { chat_id, text, parse_mode: "HTML", ...(reply_markup ? { reply_markup } : {}) });
const answerCb = (env, id) => bale(env, "answerCallbackQuery", { callback_query_id: id });

// ─── موتور اقتصاد ────────────────────────────
async function getEconomy(db) {
  let e = await db.prepare("SELECT * FROM economy_state WHERE id=1").first();
  if (!e) {
    await db.prepare("INSERT INTO economy_state (id) VALUES (1)").run();
    e = await db.prepare("SELECT * FROM economy_state WHERE id=1").first();
  }
  return e;
}
const circulating = e => Math.max(e.total_minted - e.total_burned - e.total_locked, 0);
const currentPrice = e => { const c = circulating(e); return c > 0 ? Math.max(BASE_PRICE, e.pool_value / c) : BASE_PRICE; };

async function logTx(db, uid, type, amount, after, note = "") {
  await db.prepare("INSERT INTO transactions (user_id,type,amount,balance_after,note) VALUES (?,?,?,?,?)")
    .bind(uid, type, amount, after, note).run();
}

async function mintFromBudget(db, uid, coins) {
  const e = await getEconomy(db);
  const cost = coins * currentPrice(e);
  if (e.reward_budget < cost) return false;
  await db.prepare("UPDATE economy_state SET reward_budget=reward_budget-?, pool_value=pool_value+?, total_minted=total_minted+? WHERE id=1")
    .bind(cost, cost, coins).run();
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins, uid).run();
  const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  await logTx(db, uid, "BUDGET_MINT", coins, u.balance);
  return true;
}

async function payFromEscrow(db, uid, channelId, coins) {
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins, uid).run();
  await db.prepare("UPDATE channels SET budget_coins=budget_coins-?, acquired=acquired+1 WHERE id=?").bind(coins, channelId).run();
  await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(coins).run();
  const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  await logTx(db, uid, "TASK_REWARD", coins, u.balance, `ch#${channelId}`);
}

// ─── کیبوردها ────────────────────────────────
const MAIN_KB = { keyboard: [
  [{text:"🌟 کشف کانال‌های جدید"},{text:"📢 ثبت کمپین رشد"}],
  [{text:"🎯 مأموریت‌های امروز"},{text:"👤 پروفایل و کیف پول"}],
  [{text:"❓ راهنما و پشتیبانی"}]], resize_keyboard: true };

const interestsKB = (sel) => ({ inline_keyboard: [
  ...Array.from({length:5}, (_,i) => TAGS.slice(i*2, i*2+2).map(t => 
    ({text:(sel.includes(t)?"✅ ":"")+t, callback_data:"tag:"+t}))),
  [{text:"✅ ثبت علایق من", callback_data:"tags_done"}]
]});

// ─── هندلر استارت ────────────────────────────
async function handleStart(u, env) {
  const uid = u.message.from.id, db = env.DB;
  const text = u.message.text || "";
  const ref = text.includes("ref_") ? text.split("ref_")[1].trim() : null;

  const exists = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  if (!exists) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)")
      .bind(uid, u.message.from.username || "", u.message.from.first_name || "", code, ref).run();
    await sendMsg(env, uid,
      `🌱 به <b>${BOT_NAME}</b> خوش آمدی!\nاینجا مخاطب واقعی کشف می‌کنی، نه ممبر فیک.\n\nبه چه موضوعاتی علاقه داری؟ (حداکثر ۵)`,
      interestsKB([]));
    return;
  }
  await sendMsg(env, uid, `👋 خوش برگشتی!\n🪙 موجودی: <b>${exists.balance}</b> سکه`, MAIN_KB);
}

// ─── هندلر منو ──────────────────────────────
async function handleMenu(u, env) {
  const t = u.message.text;
  const uid = u.message.from.id;
  if (t === "🌟 کشف کانال‌های جدید") {
    return sendMsg(env, uid, "برای کشف کانال‌های مرتبط با علایقت، دکمه زیر را بزن:",
      {inline_keyboard: [[{text:"🌟 نمایش پیشنهاد", callback_data:"disc"}]]});
  }
  if (t === "👤 پروفایل و کیف پول") {
    const db = env.DB;
    const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    return sendMsg(env, uid,
      `👤 <b>${u.first_name}</b>\n🪙 موجودی: <b>${u.balance}</b> سکه\n🔒 استیک: <b>${u.staked}</b>\n🛡 اعتماد: <b>${u.trust_score}/100</b>\n📊 تسک‌های موفق: <b>${u.total_tasks}</b>\n🔗 کد دعوت: <code>${u.ref_code}</code>`,
      {inline_keyboard: [[{text:"📊 آمار سیستم", callback_data:"stats"}]]});
  }
}

// ─── موتور تطبیق و تسک‌ها ────────────────────
async function showDiscover(q, env, idx) {
  const db = env.DB, uid = q.from.id;
  const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  const my = JSON.parse(u.interests || "[]");
  const chs = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  const match = chs.filter(c => JSON.parse(c.niches||"[]").some(t => my.includes(t)));
  if (!match.length) {
    return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
      text:"😴 فعلاً کمپین فعالی مطابق علایق تو نیست."});
  }
  const ch = match[idx % match.length];
  const overlap = Math.round(JSON.parse(ch.niches).filter(t => my.includes(t)).length / Math.max(my.length,1) * 100);
  await bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
    text:`🌟 <b>${ch.title}</b>\n🎯 تشابه علایق: <b>${overlap}٪</b>\n🪙 پاداش: <b>+${REWARD_COINS} سکه</b> (پس از ۴۸ ساعت ماندگاری)`,
    parse_mode:"HTML",
    reply_markup:{inline_keyboard:[
      [{text:"🚀 شروع مأموریت", callback_data:"mission:"+ch.id}],
      [{text:"⏭ پیشنهاد بعدی", callback_data:"next:"+(idx+1)}]]}});
}

async function handleCb(q, env) {
  const db = env.DB, uid = q.from.id, data = q.data;
  await answerCb(env, q.id);

  if (data === "disc") return showDiscover(q, env, 0);
  if (data.startsWith("next:")) return showDiscover(q, env, parseInt(data.slice(5)));

  if (data.startsWith("tag:")) {
    const t = data.slice(4);
    const kb = q.message.reply_markup.inline_keyboard;
    const sel = kb.flat().filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (sel.includes(t)) sel.splice(sel.indexOf(t),1); else if (sel.length<5) sel.push(t);
    return bale(env, "editMessageReplyMarkup", {chat_id:q.message.chat.id, message_id:q.message.message_id, reply_markup:interestsKB(sel)});
  }

  if (data === "tags_done") {
    const sel = (q.message.reply_markup.inline_keyboard||[]).flat()
      .filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (!sel.length) return;
    await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel), uid).run();
    const ok = await mintFromBudget(db, uid, WELCOME_BONUS);
    await bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
      text:`✅ علایق ثبت شد!${ok?`\n🎁 بونوس خوش‌آمد: <b>+${WELCOME_BONUS} سکه</b>`:""}\n🛡 امتیاز اعتماد: ۵۰\n📢 عضو باش: ${CLUB_CHANNEL}`,
      parse_mode:"HTML"});
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data === "stats") {
    const e = await getEconomy(db);
    return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
      text:`📊 <b>آمار اقتصاد کشف</b>\n💰 پشتوانه: <b>${Math.round(e.pool_value)}</b> تومان\n🪙 کل ضرب‌شده: <b>${e.total_minted}</b>\n🔥 کل سوخته: <b>${e.total_burned}</b>\n💎 قیمت لحظه‌ای سکه: <b>${Math.round(currentPrice(e))}</b> تومان`,
      parse_mode:"HTML"});
  }

  if (data.startsWith("mission:")) {
    const chId = parseInt(data.slice(8));
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();
    if (ch.budget_coins < REWARD_COINS) {
      return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
        text:"⚠️ بودجه این کمپین تمام شده. کانال دیگری را امتحان کن."});
    }
    const r = await db.prepare("INSERT INTO memberships (user_id,channel_id,status) VALUES (?,?, 'assigned')")
      .bind(uid, chId).run();
    return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
      text:`📢 وارد شو و عضو شو:\n<b>@${ch.username}</b>\n\nبعد دکمه زیر را بزن:`,
      parse_mode:"HTML",
      reply_markup:{inline_keyboard:[[{text:"✅ عضو شدم", callback_data:"joined:"+r.meta.last_row_id}]]}});
  }

  if (data.startsWith("joined:")) {
    const mId = parseInt(data.slice(7));
    const m = await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    const res = await bale(env, "getChatMember", {chat_id:"@"+ch.username, user_id:uid});
    if (!res.ok || !["member","creator","administrator"].includes(res.result?.status)) {
      return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
        text:"❌ هنوز عضو نشده‌ای! ابتدا عضو شو.",
        reply_markup:{inline_keyboard:[[{text:"🔄 بررسی دوباره", callback_data:"joined:"+mId}]]}});
    }
    const now = new Date();
    const check = new Date(now.getTime() + RETENTION_HOURS*3600*1000).toISOString();
    await db.prepare("UPDATE memberships SET status='joined', joined_at=?, check_at=? WHERE id=?")
      .bind(now.toISOString(), check, mId).run();
    return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
      text:"✅ عضویت ثبت شد!\n🪙 پاداش ۴ سکه پس از تأیید ماندگاری ۴۸ ساعته واریز می‌شود."});
  }
}

// ─── کرون: نگهبانان اقتصاد ───────────────────
async function runCron(env) {
  const db = env.DB, now = new Date().toISOString();

  // ۱) بررسی ماندگاری ۴۸ ساعته
  const due = (await db.prepare("SELECT * FROM memberships WHERE status='joined' AND check_at<=?").bind(now).all()).results;
  for (const m of due) {
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    if (!ch) continue;
    const res = await bale(env, "getChatMember", {chat_id:"@"+ch.username, user_id:m.user_id});
    const still = ["member","creator","administrator"].includes(res.result?.status);
    if (still) {
      await db.prepare("UPDATE memberships SET status='rewarded' WHERE id=?").bind(m.id).run();
      await payFromEscrow(db, m.user_id, m.channel_id, m.coins);
      await db.prepare("UPDATE users SET trust_score=MIN(100,trust_score+5), total_tasks=total_tasks+1 WHERE user_id=?").bind(m.user_id).run();
      await bale(env, "sendMessage", {chat_id:m.user_id, text:"🎉 ماندگاری تأیید شد! <b>+۴ سکه</b> | 🛡 اعتماد +۵", parse_mode:"HTML"});
    } else {
      await db.prepare("UPDATE memberships SET status='penalized' WHERE id=?").bind(m.id).run();
      await db.prepare("UPDATE users SET balance=MAX(0,balance-?), trust_score=MAX(0,trust_score-10) WHERE user_id=?").bind(PENALTY_COINS, m.user_id).run();
      const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(m.user_id).first();
      await logTx(db, m.user_id, "PENALTY", -PENALTY_COINS, u.balance, "left_early");
      await bale(env, "sendMessage", {chat_id:m.user_id, text:`⚠️ خروج زودهنگام: <b>−${PENALTY_COINS} سکه</b> و اعتماد −۱۰`, parse_mode:"HTML"});
    }
  }

  // ۲) بررسی ادمین بودن ربات در کانال‌های فعال
  const me = await bale(env, "getMe");
  const botId = me.result?.id;
  const actives = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  for (const ch of actives) {
    const adm = await bale(env, "getChatAdministrators", {chat_id:"@"+ch.username});
    const ok = (adm.result||[]).some(a => a.user?.id === botId);
    if (!ok) {
      const v = ch.violations + 1;
      const status = v >= 3 ? "removed" : "paused";
      await db.prepare("UPDATE channels SET violations=?, status=?, bot_is_admin=0 WHERE id=?").bind(v, status, ch.id).run();
      await bale(env, "sendMessage", {chat_id:ch.owner_id,
        text: v>=3 ? "❌ کمپین شما برای همیشه حذف شد (۳ بار حذف ربات از ادمینی)."
                   : "⚠️ ربات دیگر ادمین کانال شما نیست! کمپین متوقف شد."});
    }
  }
}

// ─── مسیر ورودی ─────────────────────────────
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/webhook") {
      const update = await req.json();
      ctx.waitUntil(route(update, env));
      return new Response("ok");
    }
    if (url.pathname === "/health") return new Response("🌱 KashfBot alive");
    return new Response("Not Found", { status: 404 });
  },
  async scheduled(_e, env, ctx) { ctx.waitUntil(runCron(env)); },
};

async function route(u, env) {
  if (u.message?.text?.startsWith("/start")) return handleStart(u, env);
  if (u.message?.text) return handleMenu(u, env);
  if (u.callback_query) return handleCb(u.callback_query, env);
}