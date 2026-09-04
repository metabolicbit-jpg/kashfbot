// ═══════════════════════════════════════════
// 🌱 KashfBot v7 — بات کشف مخاطب واقعی
// ═══════════════════════════════════════════
const BOT_NAME = "کشف", CLUB_CHANNEL = "@KashfClub";
const BOT_USERNAME = "kashfbot"; // برای ساخت لینک دعوت
const BASE_PRICE = 100, COMMISSION_RATE = 0.2, RETENTION_HOURS = 48;
const WELCOME_BONUS = 10, REWARD_COINS = 4, PENALTY_COINS = 8;
const COST_PER_MEMBER = 4, MIN_CAMPAIGN = 25, TOMAN_TO_RIAL = 10;
const TAGS = ["ورزش","طنز","اخبار","تکنولوژی","فروشگاهی","آموزشی","هنر","آشپزی","بازی","مذهبی"];
const PACKAGES = [
  { toman: 30000,  label: "بسته پایه" },
  { toman: 60000,  label: "بسته نقره‌ای" },
  { toman: 120000, label: "بسته طلایی" },
  { toman: 300000, label: "بسته الماس" }
];
// تبدیل اعداد فارسی/عربی به انگلیسی با کد کاراکتر (ضدخطا)
const toEn = s => String(s || "").replace(/[۰-۹٠-٩]/g, d => {
  const c = d.charCodeAt(0);
  if (c >= 1776 && c <= 1785) return c - 1776; // ۰ تا ۹ فارسی
  if (c >= 1632 && c <= 1641) return c - 1632; // ٠ تا ٩ عربی
  return d;
});
const HELP_TEXT = `📚 <b>راهنمای کشف</b>\n\n🪙 <b>کسب سکه:</b> عضویت در کانال‌های پیشنهادی (+۴) | مأموریت‌ها | دعوت دوستان\n⏳ <b>قانون ۴۸ ساعت:</b> خروج زودتر = −۸ سکه و اعتماد −۱۰\n🛡 <b>اعتماد:</b> هرچه بیشتر بمانی، پاداش بیشتر\n💎 <b>قیمت سکه:</b> پویا — با رشد تقاضا بالا می‌رود\n🔒 <b>استیک:</b> قفل سکه = سود روزانه ۲٪ + بلیت قرعه‌کشی\n📢 <b>ثبت کمپین:</b> هر عضو = ۴ سکه (حداقل ۲۵ عضو)`;

// ─── کلاینت API بله ───
async function bale(env, method, payload = {}) {
  const r = await fetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  return await r.json();
}
const sendMsg = (env, chat_id, text, reply_markup) =>
  bale(env, "sendMessage", { chat_id, text, parse_mode: "HTML", ...(reply_markup ? { reply_markup } : {}) });
const answerCb = (env, id) => bale(env, "answerCallbackQuery", { callback_query_id: id });

// ─── موتور اقتصاد ───
async function getEconomy(db) {
  let e = await db.prepare("SELECT * FROM economy_state WHERE id=1").first();
  if (!e) { await db.prepare("INSERT INTO economy_state (id) VALUES (1)").run();
    e = await db.prepare("SELECT * FROM economy_state WHERE id=1").first(); }
  return e;
}
const circulating = e => Math.max(e.total_minted - e.total_burned - e.total_locked, 0);
const currentPrice = e => { const c = circulating(e); return c > 0 ? Math.max(BASE_PRICE, e.pool_value / c) : BASE_PRICE; };

async function logTx(db, uid, type, amount, after, note = "") {
  await db.prepare("INSERT INTO transactions (user_id,type,amount,balance_after,note) VALUES (?,?,?,?,?)")
    .bind(uid, type, amount, after, note).run();
}
async function mintFromBudget(db, uid, coins) {
  const e = await getEconomy(db); const cost = coins * currentPrice(e);
  if (e.reward_budget < cost) return false;
  await db.prepare("UPDATE economy_state SET reward_budget=reward_budget-?, pool_value=pool_value+?, total_minted=total_minted+? WHERE id=1").bind(cost, cost, coins).run();
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins, uid).run();
  const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  await logTx(db, uid, "BUDGET_MINT", coins, u.balance);
  return true;
}
async function mintPurchase(db, uid, amountToman) {
  const e = await getEconomy(db);
  const commission = amountToman * COMMISSION_RATE, backing = amountToman - commission;
  const coins = Math.floor(backing / currentPrice(e));
  await db.prepare("UPDATE economy_state SET pool_value=pool_value+?, weekly_commission=weekly_commission+?, total_minted=total_minted+? WHERE id=1").bind(backing, commission, coins).run();
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins, uid).run();
  const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  await logTx(db, uid, "PURCHASE_MINT", coins, u.balance, `${amountToman}T`);
  return coins;
}
async function payFromEscrow(db, uid, channelId, coins) {
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins, uid).run();
  await db.prepare("UPDATE channels SET budget_coins=budget_coins-?, acquired=acquired+1 WHERE id=?").bind(coins, channelId).run();
  await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(coins).run();
  const u = await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  await logTx(db, uid, "TASK_REWARD", coins, u.balance, `ch#${channelId}`);
}

// ─── ماشین حالت مکالمه ───
async function setState(db, uid, step, data = {}) {
  await db.prepare("INSERT INTO user_states (user_id,step,data) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step, data=excluded.data, updated_at=datetime('now')")
    .bind(uid, step, JSON.stringify(data)).run();
}
const getState = (db, uid) => db.prepare("SELECT * FROM user_states WHERE user_id=?").bind(uid).first();
const clearState = (db, uid) => db.prepare("DELETE FROM user_states WHERE user_id=?").bind(uid).run();

// ─── کیبوردها ───
const MAIN_KB = { keyboard: [
  [{ text: "🌟 کشف کانال‌های جدید" }, { text: "📢 ثبت کمپین رشد" }],
  [{ text: "🎯 مأموریت‌های امروز" }, { text: "👤 پروفایل و کیف پول" }],
  [{ text: "❓ راهنما و پشتیبانی" }]], resize_keyboard: true };
const interestsKB = sel => ({ inline_keyboard: [
  ...Array.from({ length: 5 }, (_, i) => TAGS.slice(i * 2, i * 2 + 2).map(t =>
    ({ text: (sel.includes(t) ? "✅ " : "") + t, callback_data: "tag:" + t }))),
  [{ text: "✅ ثبت علایق من", callback_data: "tags_done" }]] });
const campTagsKB = sel => ({ inline_keyboard: [
  ...Array.from({ length: 5 }, (_, i) => TAGS.slice(i * 2, i * 2 + 2).map(t =>
    ({ text: (sel.includes(t) ? "✅ " : "") + t, callback_data: "ctag:" + t }))),
  [{ text: "✅ ادامه", callback_data: "ctags_done" }],
  [{ text: "❌ انصراف", callback_data: "cancel" }]] });
const CANCEL_KB = { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "cancel" }]] };

// ─── استارت + رفرال خودکار (v7: باگ referred_by حل شد) ───
async function handleStart(u, env) {
  const uid = u.message.from.id, db = env.DB;
  const text = u.message.text || "";
  const ref = text.includes("ref_") ? text.split("ref_")[1].trim() : null;
  const exists = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  if (!exists) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // v7: ابتدا user_id دعوت‌کننده را پیدا کن، نه ref_code
    let refUserId = null;
    if (ref) {
      const r = await db.prepare("SELECT user_id FROM users WHERE ref_code=?").bind(ref).first();
      if (r) refUserId = r.user_id;
    }
    await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)")
      .bind(uid, u.message.from.username || "", u.message.from.first_name || "", code, refUserId).run();
    if (refUserId) {
      const ok = await mintFromBudget(db, refUserId, 15);
      if (ok) await bale(env, "sendMessage", { chat_id: refUserId, text: "🎉 یک دوست با لینک تو عضو شد! <b>+۱۵ سکه</b>", parse_mode: "HTML" });
    }
    return sendMsg(env, uid, `🌱 به <b>${BOT_NAME}</b> خوش آمدی!\nبه چه موضوعاتی علاقه داری؟ (حداکثر ۵)`, interestsKB([]));
  }
  await sendMsg(env, uid, `👋 خوش برگشتی!\n🪙 موجودی: <b>${exists.balance}</b> سکه`, MAIN_KB);
}

// ─── منوی اصلی ───
async function handleMenu(u, env) {
  const t = u.message.text, uid = u.message.from.id, db = env.DB;
  if (t === "🌟 کشف کانال‌های جدید")
    return sendMsg(env, uid, "برای کشف کانال‌های مرتبط دکمه بزن:",
      { inline_keyboard: [[{ text: "🌟 نمایش پیشنهاد", callback_data: "disc" }]] });
  if (t === "📢 ثبت کمپین رشد") {
    await setState(db, uid, "CAMP_USERNAME");
    return sendMsg(env, uid, `📢 <b>ثبت کمپین رشد</b>\n\nشناسه کانال/گروه را بفرست (با @):\n⚠️ ربات باید در آن <b>ادمین</b> باشد.`, CANCEL_KB);
  }
  if (t === "🎯 مأموریت‌های امروز") return missionsHandler(uid, env);
  if (t === "👤 پروفایل و کیف پول") {
    const x = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    const link = `https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;
    return sendMsg(env, uid,
      `👤 <b>${x.first_name}</b>\n🪙 موجودی: <b>${x.balance}</b> سکه\n🔒 استیک: <b>${x.staked}</b>\n🛡 اعتماد: <b>${x.trust_score}/100</b>\n\n🔗 <b>لینک دعوت تو</b> (هر دوست = +۱۵ سکه):\n<code>${link}</code>\n\n(روی لینک نگه‌دار و کپی کن، یا دکمه زیر را بزن)`,
      { inline_keyboard: [
        [{ text: "📤 دریافت لینک دعوت", callback_data: "invitelink" }],
        [{ text: "👥 زیرمجموعه‌ها", callback_data: "refs" }, { text: "📋 کمپین‌های من", callback_data: "mycams" }],
        [{ text: "💎 خرید سکه", callback_data: "buy" }, { text: "📊 آمار سیستم", callback_data: "stats" }],
        [{ text: "🔒 قفل سکه", callback_data: "stake_start" }, { text: "🔓 آزادسازی", callback_data: "stake_unlock" }],
        [{ text: "🎰 بلیت‌های من", callback_data: "tickets" }]] });
  }
  if (t === "❓ راهنما و پشتیبانی")
    return sendMsg(env, uid, HELP_TEXT, { inline_keyboard: [[{ text: "📨 پیام به پشتیبانی", callback_data: "support_start" }]] });
}

// ─── مأموریت‌ها ───
async function missionsHandler(uid, env) {
  const db = env.DB;
  const rewarded = await db.prepare("SELECT COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();
  const clubTaken = await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND type='MISSION_CLUB'").bind(uid).first();
  return sendMsg(env, uid,
    `🎯 <b>مأموریت‌های امروز</b>\n\n1️⃣ عضویت در کانال مرکزی (+۵) ${clubTaken ? "✅" : "⏳"}\n2️⃣ سه تسک تأییدشده 📊 (${rewarded.c})\n3️⃣ دعوت دوست (+۱۵) 🔗`,
    { inline_keyboard: [[clubTaken ? { text: "✅ دریافت شد", callback_data: "noop" } : { text: "✅ عضویت در کانال مرکزی", callback_data: "claim_club" }]] });
}

// ─── متن‌های وسط مکالمه (ماشین حالت) ───
async function handleStateText(u, env, st) {
  const db = env.DB, uid = u.message.from.id, text = (u.message.text || "").trim();
  const d = JSON.parse(st.data || "{}");

  if (st.step === "CAMP_USERNAME") {
    const uname = text.replace(/^@/, "");
    const res = await bale(env, "getChat", { chat_id: "@" + uname });
    if (!res.ok) return sendMsg(env, uid, "❌ کانال/گروه پیدا نشد. با @ بفرست.", CANCEL_KB);
    const me = await bale(env, "getMe");
    const adm = await bale(env, "getChatAdministrators", { chat_id: "@" + uname });
    if (!(adm.result || []).some(a => a.user?.id === me.result?.id))
      return sendMsg(env, uid, "❌ ربات در این کانال <b>ادمین نیست</b>. اول ادمین کن.", CANCEL_KB);
    d.chat = { chat_id: String(res.result.id), username: uname, title: res.result.title || uname, type: res.result.type || "channel" };
    await setState(db, uid, "CAMP_TAGS", d);
    return sendMsg(env, uid, `✅ «${d.chat.title}» تأیید شد.\n۱ تا ۵ تگ موضوعی انتخاب کن:`, campTagsKB([]));
  }

  if (st.step === "CAMP_TARGET") {
    const n = parseInt(toEn(text));
    if (!n || n < MIN_CAMPAIGN) return sendMsg(env, uid, `❌ حداقل ${MIN_CAMPAIGN} عضو.`, CANCEL_KB);
    d.target = n; d.cost = n * COST_PER_MEMBER;
    await setState(db, uid, "CAMP_CONFIRM", d);
    return sendMsg(env, uid, `🧾 <b>پیش‌فاکتور</b>\n📢 ${d.chat.title}\n👥 ${n} عضو | 🪙 ${d.cost} سکه\nتأیید می‌کنی؟`,
      { inline_keyboard: [[{ text: "✅ تأیید و راه‌اندازی", callback_data: "camp_confirm" }, { text: "💎 خرید سکه", callback_data: "buy" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] });
  }

  if (st.step === "SUPPORT_MSG") {
    const owner = parseInt(env.OWNER_ID || "0");
    if (owner) await bale(env, "sendMessage", { chat_id: owner, text: `📨 <b>پیام پشتیبانی</b>\n👤 ${u.message.from.first_name} (<code>${uid}</code>)\n\n${text}`, parse_mode: "HTML" });
    else await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason) VALUES (?,?,?,?)").bind(uid, "support", String(uid), text).run();
    await clearState(db, uid);
    return sendMsg(env, uid, "✅ پیام به پشتیبانی ارسال شد.", MAIN_KB);
  }

  if (st.step === "STAKE_AMOUNT") {
    const n = parseInt(toEn(text));
    const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    if (!n || n < 10) return sendMsg(env, uid, "❌ حداقل ۱۰ سکه.", CANCEL_KB);
    if (n > u.balance) return sendMsg(env, uid, `❌ موجودی کافی نیست (داری: ${u.balance}).`, CANCEL_KB);
    d.amount = n;
    await setState(db, uid, "STAKE_PERIOD", d);
    return sendMsg(env, uid, `🔒 مقدار: <b>${n}</b> سکه\nدوره قفل را انتخاب کن:`,
      { inline_keyboard: [[{ text: "۷ روز (روزانه ۲٪)", callback_data: "stake_period:7" }, { text: "۳۰ روز (روزانه ۲٪)", callback_data: "stake_period:30" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] });
  }
}

// ─── کال‌بک‌ها ───
async function handleCb(q, env) {
  const db = env.DB, uid = q.from.id, data = q.data;
  await answerCb(env, q.id);
  const edit = (text, rm) => bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text, parse_mode: "HTML", ...(rm ? { reply_markup: rm } : {}) });

  if (data === "noop") return;
  if (data === "cancel") { await clearState(db, uid); return edit("❌ انصراف شد."); }
  if (data === "disc") return showDiscover(q, env, 0);
  if (data.startsWith("next:")) return showDiscover(q, env, parseInt(data.slice(5)));

  if (data.startsWith("report:")) {
    await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason) VALUES (?,?,?,?)").bind(uid, "channel", data.slice(7), "گزارش کاربر روی تسک کانال").run();
    return edit("🚩 گزارش تو ثبت شد. ممنون که از کیفیت کشف محافظت می‌کنی.");
  }

  if (data.startsWith("tag:")) {
    const t = data.slice(4);
    const sel = (q.message.reply_markup.inline_keyboard || []).flat().filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (sel.includes(t)) sel.splice(sel.indexOf(t), 1); else if (sel.length < 5) sel.push(t);
    return bale(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: interestsKB(sel) });
  }
  if (data === "tags_done") {
    const sel = (q.message.reply_markup.inline_keyboard || []).flat().filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (!sel.length) return;
    await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel), uid).run();
    const ok = await mintFromBudget(db, uid, WELCOME_BONUS);
    await edit(`✅ علایق ثبت شد!${ok ? `\n🎁 +${WELCOME_BONUS} سکه` : ""}`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data.startsWith("ctag:")) {
    const t = data.slice(5);
    const sel = (q.message.reply_markup.inline_keyboard || []).flat().filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (sel.includes(t)) sel.splice(sel.indexOf(t), 1); else if (sel.length < 5) sel.push(t);
    return bale(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: campTagsKB(sel) });
  }
  if (data === "ctags_done") {
    const sel = (q.message.reply_markup.inline_keyboard || []).flat().filter(b => b.text.startsWith("✅")).map(b => b.text.slice(2));
    if (!sel.length) return;
    const st = await getState(db, uid); const d = JSON.parse(st.data || "{}");
    d.tags = sel;
    await setState(db, uid, "CAMP_TARGET", d);
    return edit(`✅ تگ‌ها: ${sel.join("، ")}\n\nتعداد عضو هدف را بفرست (حداقل ${MIN_CAMPAIGN}):`);
  }

  if (data === "camp_confirm") {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}");
    const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    if (u.balance < d.cost)
      return edit(`❌ موجودی کافی نیست.\nنیاز: <b>${d.cost}</b> | داری: <b>${u.balance}</b>`,
        { inline_keyboard: [[{ text: "💎 خرید سکه", callback_data: "buy" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] });
    await db.prepare("UPDATE users SET balance=balance-? WHERE user_id=?").bind(d.cost, uid).run();
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.cost).run();
    await db.prepare("INSERT INTO channels (owner_id,chat_id,username,chat_type,title,niches,budget_coins,target,bot_is_admin,status) VALUES (?,?,?,?,?,?,?,?,1,'active')")
      .bind(uid, d.chat.chat_id, d.chat.username, d.chat.type, d.chat.title, JSON.stringify(d.tags), d.cost, d.target).run();
    await logTx(db, uid, "ESCROW", -d.cost, u.balance - d.cost, d.chat.username);
    await clearState(db, uid);
    await edit(`🚀 <b>کمپین زنده شد!</b>\n📢 ${d.chat.title} | 👥 ${d.target} عضو واقعی\nموتور تطبیق از حالا مخاطبِ علاقه‌مند می‌فرستد.`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data === "buy") {
    const e = await getEconomy(db); const p = currentPrice(e);
    return edit(`💎 <b>فروشگاه سکه</b> (قیمت لحظه‌ای: ${Math.round(p)} تومان)\nیک بسته انتخاب کن:`,
      { inline_keyboard: PACKAGES.map(k => [{ text: `${k.label} — ${Math.floor(k.toman * 0.8 / p)} سکه | ${k.toman.toLocaleString("fa-IR")} تومان`, callback_data: "buy:" + k.toman }]) });
  }
  if (data.startsWith("buy:")) {
    const toman = parseInt(data.slice(4));
    const payload = `pay_${Date.now()}_${uid}`;
    await db.prepare("INSERT INTO payments (user_id,payload,amount_toman) VALUES (?,?,?)").bind(uid, payload, toman).run();
    await bale(env, "sendInvoice", {
      chat_id: uid, title: "خرید سکه کشف", description: `بسته ${toman.toLocaleString("fa-IR")} تومانی`,
      payload: payload, provider_token: env.WALLET_TOKEN,
      prices: [{ label: "مبلغ بسته (ریال)", amount: toman * TOMAN_TO_RIAL }]
    });
    return;
  }

  if (data === "stake_start") { await setState(db, uid, "STAKE_AMOUNT"); return edit("🔒 چند سکه قفل کنی؟ (حداقل ۱۰)\nفقط عدد بفرست:"); }
  if (data.startsWith("stake_period:")) {
    const days = parseInt(data.split(":")[1]);
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}");
    const now = new Date(); const unlock = new Date(now.getTime() + days * 86400000).toISOString();
    await db.prepare("UPDATE users SET balance=balance-?, staked=staked+? WHERE user_id=?").bind(d.amount, d.amount, uid).run();
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.amount).run();
    await db.prepare("INSERT INTO stakes (user_id,amount,start_at,unlock_at) VALUES (?,?,?,?)").bind(uid, d.amount, now.toISOString(), unlock).run();
    const tickets = Math.min(Math.floor(d.amount / 10), 30);
    for (let i = 0; i < tickets; i++) await db.prepare("INSERT INTO lottery_tickets (user_id,source) VALUES (?,'stake')").bind(uid).run();
    await logTx(db, uid, "STAKE_LOCK", -d.amount, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);
    await clearState(db, uid);
    return edit(`🔒 <b>${d.amount} سکه</b> به مدت ${days} روز قفل شد.\n🎰 +${tickets} بلیت قرعه‌کشی\n💵 سود روزانه ۲٪ هنگام آزادسازی`);
  }
  if (data === "stake_unlock") {
    const rows = (await db.prepare("SELECT * FROM stakes WHERE user_id=? AND status='active'").bind(uid).all()).results;
    const now = Date.now(); let msg = "";
    for (const s of rows) {
      if (new Date(s.unlock_at).getTime() <= now) {
        const days = Math.floor((now - new Date(s.start_at).getTime()) / 86400000);
        const yieldC = await mintFromBudget(db, uid, Math.floor(s.amount * 0.02 * days));
        await db.prepare("UPDATE users SET staked=staked-? WHERE user_id=?").bind(s.amount, uid).run();
        await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(s.amount).run();
        await db.prepare("UPDATE stakes SET status='unlocked' WHERE id=?").bind(s.id).run();
        await logTx(db, uid, "STAKE_UNLOCK", s.amount, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);
        msg += `✅ ${s.amount} سکه آزاد شد + سود ${yieldC || 0}\n`;
      } else msg += `⏳ یک استیک تا ${s.unlock_at.slice(0, 10)} فعال است\n`;
    }
    return edit(msg || "❌ استیکی نداری.");
  }
  if (data === "tickets") {
    const c = await db.prepare("SELECT COUNT(*) c FROM lottery_tickets WHERE user_id=?").bind(uid).first();
    return edit(`🎰 بلیت‌های قرعه‌کشی تو: <b>${c.c}</b>\n🏆 قرعه‌کشی ماهانه به‌صورت زنده برگزار می‌شود.`);
  }

  // ─── v7: آمار زیرمجموعه‌ها + کمپین‌ها + لینک دعوت ───
  if (data === "invitelink") {
    const x = await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();
    const link = `https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;
    return sendMsg(env, uid, `🔗 لینک دعوت تو:\n${link}\n\n🎁 هر دوست که با این لینک عضو شود = <b>+۱۵ سکه</b> برای تو!\n(این پیام را می‌توانی مستقیم فوروارد کنی)`);
  }

  if (data === "refs") {
    const total = await db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").bind(uid).first();
    const rows = (await db.prepare("SELECT first_name, created_at FROM users WHERE referred_by=? ORDER BY created_at DESC LIMIT 10").bind(uid).all()).results;
    const x = await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();
    const link = `https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;
    const list = rows.length
      ? rows.map((r, i) => `${i + 1}. ${r.first_name || "بدون نام"} - ${String(r.created_at || "").slice(0, 10)}`).join("\n")
      : "هنوز کسی را دعوت نکرده‌ای!";
    return edit(`👥 <b>زیرمجموعه‌های تو</b>\n\n👤 تعداد کل: <b>${total.c}</b>\n💰 جایزه هر زیرمجموعه: <b>۱۵ سکه</b>\n\n📋 <b>۱۰ نفر آخر:</b>\n${list}\n\n🔗 <b>لینک دعوت:</b>\n<code>${link}</code>\n\n📢 این لینک را برای دوستانت بفرست تا زیرمجموعه‌ات شوند!`);
  }

  if (data === "mycams") {
    const rows = (await db.prepare("SELECT * FROM channels WHERE owner_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;
    if (!rows.length) return edit("❌ هنوز کمپینی ثبت نکرده‌ای.\nاز منوی «📢 ثبت کمپین رشد» شروع کن.");
    const statusFa = s => s === "active" ? "🟢 فعال" : s === "paused" ? "🟡 متوقف موقت" : "🔴 حذف‌شده";
    const list = rows.map(ch => {
      const remain = Math.max(ch.target - ch.acquired, 0);
      const pct = ch.target > 0 ? Math.min(Math.round((ch.acquired / ch.target) * 100), 100) : 0;
      return `📢 <b>${ch.title}</b> (@${ch.username})\n📊 درخواست: <b>${ch.target}</b> | دریافت: <b>${ch.acquired}</b> | باقی‌مانده: <b>${remain}</b>\n📈 پیشرفت: <b>${pct}٪</b>\nوضعیت: ${statusFa(ch.status)}\n──────────`;
    }).join("\n");
    return edit(`📋 <b>کمپین‌های تو</b>\n\n${list}`);
  }

  if (data === "support_start") { await setState(db, uid, "SUPPORT_MSG"); return edit("📨 پیام خود را کامل بنویس:"); }
  if (data === "claim_club") {
    const res = await bale(env, "getChatMember", { chat_id: env.CLUB_CHANNEL, user_id: uid });
    if (!["member", "creator", "administrator"].includes(res.result?.status)) return edit("❌ هنوز عضو کانال مرکزی نشده‌ای!");
    const ok = await mintFromBudget(db, uid, 5);
    if (ok) await logTx(db, uid, "MISSION_CLUB", 5, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);
    return edit(ok ? "🎉 +۵ سکه" : " بودجه مأموریت خالی است.");
  }
  if (data === "stats") {
    const e = await getEconomy(db);
    return edit(`📊 <b>اقتصاد کشف</b>\n💰 پشتوانه: ${Math.round(e.pool_value)} ت\n🪙 ضرب: ${e.total_minted} | 🔥 سوخت: ${e.total_burned}\n🔒 قفل: ${e.total_locked}\n💎 قیمت لحظه‌ای: <b>${Math.round(currentPrice(e))}</b> تومان`);
  }

  if (data.startsWith("mission:")) {
    const chId = parseInt(data.slice(8));
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();
    if (!ch || ch.budget_coins < REWARD_COINS) return edit("⚠️ بودجه کمپین تمام شده.");
    const r = await db.prepare("INSERT INTO memberships (user_id,channel_id,status) VALUES (?,?,'assigned')").bind(uid, chId).run();
    return edit(`📢 عضو شو: <b>@${ch.username}</b>`, { inline_keyboard: [[{ text: "✅ عضو شدم", callback_data: "joined:" + r.meta.last_row_id }, { text: "🚩 گزارش", callback_data: "report:" + chId }]] });
  }
  if (data.startsWith("joined:")) {
    const mId = parseInt(data.slice(7));
    const m = await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    const res = await bale(env, "getChatMember", { chat_id: "@" + ch.username, user_id: uid });
    if (!["member", "creator", "administrator"].includes(res.result?.status))
      return edit("❌ هنوز عضو نشده‌ای!", { inline_keyboard: [[{ text: "🔄 بررسی دوباره", callback_data: "joined:" + mId }]] });
    const now = new Date(), check = new Date(now.getTime() + RETENTION_HOURS * 3600 * 1000).toISOString();
    await db.prepare("UPDATE memberships SET status='joined', joined_at=?, check_at=? WHERE id=?").bind(now.toISOString(), check, mId).run();
    return edit("✅ عضویت ثبت شد!\n🪙 +۴ سکه پس از تأیید ۴۸ ساعته");
  }
}

// ─── موتور تطبیق ───
async function showDiscover(q, env, idx) {
  const db = env.DB, uid = q.from.id;
  const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  const my = JSON.parse(u.interests || "[]");
  const chs = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  const match = chs.filter(c => JSON.parse(c.niches || "[]").some(t => my.includes(t)));
  if (!match.length) return bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text: "😴 کمپین مطابق علایق تو نیست." });
  const ch = match[idx % match.length];
  const overlap = Math.round(JSON.parse(ch.niches).filter(t => my.includes(t)).length / Math.max(my.length, 1) * 100);
  await bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id,
    text: `🌟 <b>${ch.title}</b>\n🎯 تشابه: ${overlap}٪ | 🪙 +${REWARD_COINS}`, parse_mode: "HTML",
    reply_markup: { inline_keyboard: [
      [{ text: "🚀 شروع مأموریت", callback_data: "mission:" + ch.id }],
      [{ text: "⏭ بعدی", callback_data: "next:" + (idx + 1) }, { text: "🚩 گزارش", callback_data: "report:" + ch.id }]] } });
}

// ─── پرداخت موفق ───
async function handlePayment(u, env) {
  const db = env.DB; const sp = u.message.successful_payment;
  const pay = await db.prepare("SELECT * FROM payments WHERE payload=?").bind(sp.invoice_payload).first();
  if (!pay || pay.status === "paid") return;
  const toman = sp.total_amount / TOMAN_TO_RIAL;
  const coins = await mintPurchase(db, u.message.from.id, toman);
  await db.prepare("UPDATE payments SET status='paid', coins_granted=?, bale_transaction_id=? WHERE payload=?")
    .bind(coins, sp.provider_payment_charge_id || "", sp.invoice_payload).run();
  await sendMsg(env, u.message.from.id, `💎 خرید موفق!\n🪙 +<b>${coins}</b> سکه\n💰 پشتوانه اقتصاد رشد کرد 📈`, MAIN_KB);
}

// ─── ابزارهای مدیر (قرعه‌کشی + گزارش‌ها) ───
async function handleDraw(env, uid) {
  const db = env.DB;
  const tickets = (await db.prepare("SELECT * FROM lottery_tickets WHERE draw_id IS NULL").all()).results;
  if (!tickets.length) return sendMsg(env, uid, "❌ بلیطی برای قرعه‌کشی نیست.");
  const win = tickets[Math.floor(Math.random() * tickets.length)];
  const r = await db.prepare("INSERT INTO draws (period,prize_title,status,winner_id,draw_at) VALUES ('manual','قرعه‌کشی کشف','completed',?,datetime('now'))").bind(win.user_id).run();
  await db.prepare("UPDATE lottery_tickets SET draw_id=? WHERE draw_id IS NULL").bind(r.meta.last_row_id).run();
  const w = await db.prepare("SELECT first_name FROM users WHERE user_id=?").bind(win.user_id).first();
  await bale(env, "sendMessage", { chat_id: win.user_id, text: "🏆 تبریک! تو برنده قرعه‌کشی کشف شدی! 🎉\nبرای دریافت جایزه به پشتیبانی پیام بده." });
  await sendMsg(env, uid, `🏆 برنده: <b>${w?.first_name || ""}</b> (<code>${win.user_id}</code>)\n📣 حالا در ${CLUB_CHANNEL} به‌صورت زنده اعلام کن (پروتکل شفافیت).`);
}
async function handleReports(env, uid) {
  const db = env.DB;
  const rows = (await db.prepare("SELECT * FROM reports WHERE status='open' ORDER BY id DESC LIMIT 10").all()).results;
  if (!rows.length) return sendMsg(env, uid, "✅ گزارش باز نداریم.");
  return sendMsg(env, uid, rows.map(x => `#${x.id} | ${x.target_kind}#${x.target_id}\n👤 ${x.reporter_id}\n📝 ${x.reason}\n──────────`).join("\n"));
}

// ─── کرون: نگهبانان اقتصاد ───
async function runCron(env) {
  const db = env.DB, now = new Date().toISOString();
  const due = (await db.prepare("SELECT * FROM memberships WHERE status='joined' AND check_at<=?").bind(now).all()).results;
  for (const m of due) {
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    if (!ch) continue;
    const res = await bale(env, "getChatMember", { chat_id: "@" + ch.username, user_id: m.user_id });
    if (["member", "creator", "administrator"].includes(res.result?.status)) {
      await db.prepare("UPDATE memberships SET status='rewarded' WHERE id=?").bind(m.id).run();
      await payFromEscrow(db, m.user_id, m.channel_id, m.coins);
      await db.prepare("UPDATE users SET trust_score=MIN(100,trust_score+5), total_tasks=total_tasks+1 WHERE user_id=?").bind(m.user_id).run();
      await bale(env, "sendMessage", { chat_id: m.user_id, text: "🎉 ماندگاری تأیید شد! <b>+۴ سکه</b> | 🛡 اعتماد +۵", parse_mode: "HTML" });
    } else {
      await db.prepare("UPDATE memberships SET status='penalized' WHERE id=?").bind(m.id).run();
      await db.prepare("UPDATE users SET balance=MAX(0,balance-?), trust_score=MAX(0,trust_score-10) WHERE user_id=?").bind(PENALTY_COINS, m.user_id).run();
      await bale(env, "sendMessage", { chat_id: m.user_id, text: `⚠️ خروج زودهنگام: <b>−${PENALTY_COINS} سکه</b>`, parse_mode: "HTML" });
    }
  }
  const me = await bale(env, "getMe");
  const actives = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  for (const ch of actives) {
    const adm = await bale(env, "getChatAdministrators", { chat_id: "@" + ch.username });
    if (!(adm.result || []).some(a => a.user?.id === me.result?.id)) {
      const v = ch.violations + 1, status = v >= 3 ? "removed" : "paused";
      await db.prepare("UPDATE channels SET violations=?, status=?, bot_is_admin=0 WHERE id=?").bind(v, status, ch.id).run();
      if (ch.owner_id) await bale(env, "sendMessage", { chat_id: ch.owner_id, text: v >= 3 ? "❌ کمپین برای همیشه حذف شد." : "⚠️ ربات دیگر ادمین نیست! کمپین متوقف شد." });
    }
  }
}

// ─── ورودی اصلی ───
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
  if (u.pre_checkout_query) return bale(env, "answerPreCheckoutQuery", { pre_checkout_query_id: u.pre_checkout_query.id, ok: true });
  if (u.message?.successful_payment) return handlePayment(u, env);
  if (u.message?.text?.startsWith("/start")) return handleStart(u, env);
  if (u.message?.text === "/draw" && u.message.from.id === parseInt(env.OWNER_ID || "0")) return handleDraw(env, u.message.from.id);
  if (u.message?.text === "/reports" && u.message.from.id === parseInt(env.OWNER_ID || "0")) return handleReports(env, u.message.from.id);
  if (u.callback_query) return handleCb(u.callback_query, env);
  if (u.message?.text) {
    const t = u.message.text;
    const MENU = ["🌟 کشف کانال‌های جدید","📢 ثبت کمپین رشد","🎯 مأموریت‌های امروز","👤 پروفایل و کیف پول","❓ راهنما و پشتیبانی"];
    if (MENU.includes(t)) { await clearState(env.DB, u.message.from.id); return handleMenu(u, env); }
    const st = await getState(env.DB, u.message.from.id);
    if (st) return handleStateText(u, env, st);
    return handleMenu(u, env);
  }
}