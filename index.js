// ═══════════════════════════════════════════
// 🌱 KashfBot v9 — بات کشف مخاطب واقعی
// رده‌بندی موضوعی: مطابق فیلتر رسمی تبلیغات بله
// ═══════════════════════════════════════════
const BOT_NAME = "کشف", CLUB_CHANNEL = "@KashfClub";
const BOT_USERNAME = "kashfbot";
const BASE_PRICE = 100, COMMISSION_RATE = 0.2, RETENTION_HOURS = 48;
const WELCOME_BONUS = 10, REWARD_COINS = 4, PENALTY_COINS = 8;
const COST_PER_MEMBER = 4, MIN_CAMPAIGN = 25, TOMAN_TO_RIAL = 10;

// ─── رده‌بندی رسمی بله (۱۰ دسته + زیرشاخه‌ها) ───
const CATEGORIES = [
  { name: "خدمات کسب و کار", emoji: "💼", subs: ["مشاوره کسب و کار", "املاک و عمرانی", "خدمات مالی و بیمه", "سایر"] },
  { name: "فروشگاهی", emoji: "🛍️", subs: ["آرایشی و بهداشتی", "آموزشی", "اسباب بازی و عروسک", "پوشاک", "پوشاک آقایان", "پوشاک بانوان", "پوشاک خانواده", "پوشاک کودک و نوجوان", "خانه و آشپزخانه", "خوراکی و مواد غذایی", "شال و روسری", "فرهنگی و هنری", "کتاب و لوازم تحریر", "کالای دیجیتال", "کیف و کفش", "لوازم شخصی", "سایر"] },
  { name: "آموزشی", emoji: "🎓", subs: ["زبان‌های خارجی", "کنکور", "مدرسه", "برنامه نویسی", "محتوای آموزشی", "سایر"] },
  { name: "سرگرمی", emoji: "🎭", subs: ["سرگرمی"] },
  { name: "سلامت و زیبایی", emoji: "💄", subs: ["سلامت و زیبایی"] },
  { name: "خانه و آشپزخانه", emoji: "🏠", subs: ["خانه و آشپزخانه"] },
  { name: "تربیت و روانشناسی", emoji: "🧠", subs: ["تربیت و روانشناسی"] },
  { name: "خیریه و مسئولیت اجتماعی", emoji: "🤝", subs: ["خیریه و مسئولیت اجتماعی"] },
  { name: "خبری", emoji: "📰", subs: ["خبری"] },
  { name: "مذهبی", emoji: "🕌", subs: ["مذهبی"] }
];
const leaf = (catName, sub) => `${catName} > ${sub}`;

// ─── تاریخ شمسی + اعداد فارسی ───
const JALALI_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const faNum = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
function g2j(gy, gm, gd) {
  const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365*gy) + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) - 80 + gd + g_d_m[gm-1];
  jy += 33 * Math.floor(days/12053); days %= 12053;
  jy += 4 * Math.floor(days/1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1)%365; }
  const jm = (days < 186) ? 1+Math.floor(days/31) : 7+Math.floor((days-186)/30);
  const jd = 1 + ((days < 186) ? (days%31) : ((days-186)%30));
  return [jy, jm, jd];
}
const IR = iso => new Date(new Date(iso).getTime() + 3.5*3600*1000);
function faDate(iso) { const d = IR(iso); const [jy,jm,jd] = g2j(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()); return `${faNum(jd)} ${JALALI_MONTHS[jm-1]} ${faNum(jy)}`; }
function faTime(iso) { const d = IR(iso); return faNum(String(d.getUTCHours()).padStart(2,"0") + ":" + String(d.getUTCMinutes()).padStart(2,"0")); }
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length/n) }, (_, i) => arr.slice(i*n, i*n+n));

const toEn = s => String(s || "").replace(/[۰-۹٠-٩]/g, d => {
  const c = d.charCodeAt(0);
  if (c >= 1776 && c <= 1785) return c - 1776;
  if (c >= 1632 && c <= 1641) return c - 1632;
  return d;
});
const PACKAGES = [
  { toman: 30000,  label: "بسته پایه" },
  { toman: 60000,  label: "بسته نقره‌ای" },
  { toman: 120000, label: "بسته طلایی" },
  { toman: 300000, label: "بسته الماس" }
];
const HELP_TEXT = `📚 <b>راهنمای کشف</b>\n\n🪙 <b>کسب سکه:</b> عضویت در کانال‌های پیشنهادی (+۴) | مأموریت‌ها | دعوت دوستان\n⏳ <b>قانون ۴۸ ساعت:</b> ماندگاری = مخاطب واقعی؛ خروج زودتر = −۸ سکه\n🛡 <b>اعتماد:</b> هرچه بیشتر بمانی، پاداش بیشتر\n💎 <b>قیمت سکه:</b> پویا — با رشد تقاضا بالا می‌رود\n🔒 <b>استیک:</b> قفل سکه = سود روزانه ۲٪ + بلیت قرعه‌کشی\n📢 <b>ثبت کمپین:</b> هر عضو = ۴ سکه (حداقل ۲۵ عضو)\n🗂 <b>دسته‌بندی موضوعی:</b> مطابق رده‌بندی رسمی بله`;

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
  await db.prepare("INSERT INTO transactions (user_id,type,amount,balance_after,note) VALUES (?,?,?,?,?)").bind(uid, type, amount, after, note).run();
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

// ─── ماشین حالت ───
async function setState(db, uid, step, data = {}) {
  await db.prepare("INSERT INTO user_states (user_id,step,data) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step, data=excluded.data, updated_at=datetime('now')").bind(uid, step, JSON.stringify(data)).run();
}
const getState = (db, uid) => db.prepare("SELECT * FROM user_states WHERE user_id=?").bind(uid).first();
const clearState = (db, uid) => db.prepare("DELETE FROM user_states WHERE user_id=?").bind(uid).run();

// ─── کیبوردها (v9: درخت رسمی بله + اندیس‌های کوتاه) ───
const MAIN_KB = { keyboard: [
  [{ text: "🌟 کشف کانال، گروه و ربات" }, { text: "📢 ثبت کمپین رشد" }],
  [{ text: "🎯 مأموریت‌های امروز" }, { text: "👤 پروفایل من" }],
  [{ text: "❓ راهنما و پشتیبانی" }]], resize_keyboard: true };
const CANCEL_KB = { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "cancel" }]] };

function interestsKB(d) {
  const sel = d.sel || [];
  if (d.cat == null) return { inline_keyboard: [
    ...chunk(CATEGORIES.map((c, i) => ({ text: `${c.subs.some(s => sel.includes(leaf(c.name, s))) ? "✅ " : ""}${c.emoji} ${c.name}`, callback_data: "cat:" + i })), 2),
    [{ text: "✅ ثبت علایق من", callback_data: "tags_done" }]] };
  const c = CATEGORIES[d.cat];
  return { inline_keyboard: [
    [{ text: `${c.emoji} ${c.name} — زیرشاخه را انتخاب کن`, callback_data: "noop" }],
    ...c.subs.map((s, j) => [{ text: `${sel.includes(leaf(c.name, s)) ? "✅ " : ""}${s}`, callback_data: `sub:${d.cat}:${j}` }]),
    [{ text: "🔙 بازگشت به دسته‌ها", callback_data: "catback" }],
    [{ text: "✅ ثبت علایق من", callback_data: "tags_done" }]] };
}
function campTagsKB(d) {
  const sel = d.csel || [];
  if (d.ccat == null) return { inline_keyboard: [
    ...chunk(CATEGORIES.map((c, i) => ({ text: `${c.subs.some(s => sel.includes(leaf(c.name, s))) ? "✅ " : ""}${c.emoji} ${c.name}`, callback_data: "ccat:" + i })), 2),
    [{ text: "✅ ادامه", callback_data: "ctags_done" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] };
  const c = CATEGORIES[d.ccat];
  return { inline_keyboard: [
    [{ text: `${c.emoji} ${c.name} — زیرشاخه را انتخاب کن`, callback_data: "noop" }],
    ...c.subs.map((s, j) => [{ text: `${sel.includes(leaf(c.name, s)) ? "✅ " : ""}${s}`, callback_data: `csub:${d.ccat}:${j}` }]),
    [{ text: "🔙 بازگشت", callback_data: "ccatback" }],
    [{ text: "✅ ادامه", callback_data: "ctags_done" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] };
}

// ─── استارت + رفرال ───
async function handleStart(u, env) {
  const uid = u.message.from.id, db = env.DB;
  const text = u.message.text || "";
  const ref = text.includes("ref_") ? text.split("ref_")[1].trim() : null;
  const exists = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  if (!exists) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    let refUserId = null;
    if (ref) { const r = await db.prepare("SELECT user_id FROM users WHERE ref_code=?").bind(ref).first(); if (r) refUserId = r.user_id; }
    await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)")
      .bind(uid, u.message.from.username || "", u.message.from.first_name || "", code, refUserId).run();
    if (refUserId) { const ok = await mintFromBudget(db, refUserId, 15);
      if (ok) await bale(env, "sendMessage", { chat_id: refUserId, text: "🎉 یک دوست با لینک تو عضو شد! <b>+۱۵ سکه</b>", parse_mode: "HTML" }); }
    await setState(db, uid, "INTERESTS", { sel: [], cat: null });
    return sendMsg(env, uid, `🌱 به <b>${BOT_NAME}</b> خوش آمدی!\nدسته‌بندی موضوعی (مطابق رده‌بندی رسمی بله) را ببین:\nیک <b>دسته</b> را بزن و زیرشاخه‌های مورد علاقه‌ات را انتخاب کن (حداکثر ۵):`, interestsKB({ sel: [], cat: null }));
  }
  await sendMsg(env, uid, `👋 خوش برگشتی!\n🪙 موجودی: <b>${exists.balance}</b> سکه`, MAIN_KB);
}

// ─── منوی اصلی ───
async function handleMenu(u, env) {
  const t = u.message.text, uid = u.message.from.id, db = env.DB;
  if (t === "🌟 کشف کانال، گروه و ربات")
    return sendMsg(env, uid, "برای کشف کانال، گروه و ربات‌های مرتبط با علایقت، دکمه «🌟 نمایش پیشنهاد» را بزن:",
      { inline_keyboard: [[{ text: "🌟 نمایش پیشنهاد", callback_data: "disc" }]] });
  if (t === "📢 ثبت کمپین رشد") {
    await setState(db, uid, "CAMP_USERNAME");
    return sendMsg(env, uid, `📢 <b>ثبت کمپین رشد</b>\n\nشناسه کانال/گروه/ربات را بفرست (با @):\n⚠️ ربات باید در آن <b>ادمین</b> باشد.`, CANCEL_KB);
  }
  if (t === "🎯 مأموریت‌های امروز") return missionsHandler(uid, env);
  if (t === "👤 پروفایل من") {
    const x = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    const link = `https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;
    return sendMsg(env, uid,
      `👤 <b>${x.first_name}</b>\n🪙 موجودی: <b>${x.balance}</b> سکه\n🔒 استیک: <b>${x.staked}</b>\n🛡 اعتماد: <b>${x.trust_score}/100</b>\n\n🔗 <b>لینک دعوت تو</b> (هر دوست = +۱۵ سکه):\n<code>${link}</code>`,
      { inline_keyboard: [
        [{ text: "📤 دریافت لینک دعوت", callback_data: "invitelink" }],
        [{ text: "👥 زیرمجموعه‌ها", callback_data: "refs" }, { text: "📋 کمپین‌های من", callback_data: "mycams" }],
        [{ text: "💎 خرید سکه", callback_data: "buy" }, { text: "📊 آمار سیستم", callback_data: "stats" }],
        [{ text: "🔒 قفل سکه", callback_data: "stake_start" }, { text: "🔓 آزادسازی", callback_data: "stake_unlock" }],
        [{ text: "📊 گزارش استیک", callback_data: "stake_report" }, { text: "🎰 بلیت‌های من", callback_data: "tickets" }],
        [{ text: "🎨 ویرایش علایق", callback_data: "edit_interests" }]] });
  }
  if (t === "❓ راهنما و پشتیبانی")
    return sendMsg(env, uid, HELP_TEXT, { inline_keyboard: [[{ text: "📨 پیام به پشتیبانی", callback_data: "support_start" }]] });
}

async function missionsHandler(uid, env) {
  const db = env.DB;
  const rewarded = await db.prepare("SELECT COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();
  const clubTaken = await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND type='MISSION_CLUB'").bind(uid).first();
  return sendMsg(env, uid,
    `🎯 <b>مأموریت‌های امروز</b>\n\n1️⃣ عضویت در کانال مرکزی (+۵) ${clubTaken ? "✅" : "⏳"}\n2️⃣ سه تسک تأییدشده 📊 (${rewarded.c})\n3️⃣ دعوت دوست (+۱۵) 🔗`,
    { inline_keyboard: [[clubTaken ? { text: "✅ دریافت شد", callback_data: "noop" } : { text: "✅ عضویت در کانال مرکزی", callback_data: "claim_club" }]] });
}

// ─── متن‌های ماشین حالت ───
async function handleStateText(u, env, st) {
  const db = env.DB, uid = u.message.from.id, text = (u.message.text || "").trim();
  const d = JSON.parse(st.data || "{}");

  if (st.step === "INTERESTS" || st.step === "CAMP_TAGS")
    return sendMsg(env, uid, "لطفاً فقط از دکمه‌های زیر استفاده کن 🙂");

  if (st.step === "CAMP_USERNAME") {
    const uname = text.replace(/^@/, "");
    const res = await bale(env, "getChat", { chat_id: "@" + uname });
    if (!res.ok) return sendMsg(env, uid, "❌ کانال/گروه/ربات پیدا نشد. با @ بفرست.", CANCEL_KB);
    const me = await bale(env, "getMe");
    const adm = await bale(env, "getChatAdministrators", { chat_id: "@" + uname });
    if (!(adm.result || []).some(a => a.user?.id === me.result?.id))
      return sendMsg(env, uid, "❌ ربات در آن <b>ادمین نیست</b>. اول ادمین کن.", CANCEL_KB);
    d.chat = { chat_id: String(res.result.id), username: uname, title: res.result.title || uname, type: res.result.type || "channel" };
    d.csel = []; d.ccat = null;
    await setState(db, uid, "CAMP_TAGS", d);
    return sendMsg(env, uid, `✅ «${d.chat.title}» تأیید شد.\nیک <b>دسته</b> را بزن و زیرشاخه‌های موضوعی کانالت را انتخاب کن (۱ تا ۵):`, campTagsKB(d));
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
    const x = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    if (!n || n < 10) return sendMsg(env, uid, "❌ حداقل ۱۰ سکه.", CANCEL_KB);
    if (n > x.balance) return sendMsg(env, uid, `❌ موجودی کافی نیست (داری: ${x.balance}).`, CANCEL_KB);
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
  const setKB = rm => bale(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: rm });
  const toggle = (arr, v, max = 5) => { if (arr.includes(v)) arr.splice(arr.indexOf(v), 1); else if (arr.length < max) arr.push(v); };

  if (data === "noop") return;
  if (data === "cancel") { await clearState(db, uid); return edit("❌ انصراف شد."); }
  if (data === "disc") return showDiscover(q, env, 0);
  if (data.startsWith("next:")) return showDiscover(q, env, parseInt(data.slice(5)));

  // ─── درخت علایق کاربر (v9: اندیس‌محور) ───
  if (data.startsWith("cat:") || data === "catback" || data.startsWith("sub:")) {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}"); d.sel = d.sel || [];
    if (data === "catback") d.cat = null;
    else if (data.startsWith("cat:")) {
      const c = CATEGORIES[parseInt(data.slice(4))];
      if (c.subs.length === 1) { toggle(d.sel, leaf(c.name, c.subs[0])); d.cat = null; }
      else d.cat = CATEGORIES.indexOf(c);
    } else {
      const [i, j] = data.slice(4).split(":").map(Number);
      toggle(d.sel, leaf(CATEGORIES[i].name, CATEGORIES[i].subs[j]));
    }
    await setState(db, uid, st.step, d);
    return setKB(interestsKB(d));
  }
  if (data === "tags_done") {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}"); const sel = d.sel || [];
    if (!sel.length) return edit("❌ حداقل یک زیرشاخه انتخاب کن.");
    await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel), uid).run();
    let bonus = "";
    const got = await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND note='welcome'").bind(uid).first();
    if (!got) { const ok = await mintFromBudget(db, uid, WELCOME_BONUS);
      if (ok) { await logTx(db, uid, "WELCOME", 0, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance, "welcome"); bonus = `\n🎁 +${WELCOME_BONUS} سکه`; } }
    await clearState(db, uid);
    await edit(`✅ علایق ثبت شد (${faNum(sel.length)} موضوع)!${bonus}`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  // ─── درخت تگ‌های کمپین (v9) ───
  if (data.startsWith("ccat:") || data === "ccatback" || data.startsWith("csub:")) {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}"); d.csel = d.csel || [];
    if (data === "ccatback") d.ccat = null;
    else if (data.startsWith("ccat:")) {
      const c = CATEGORIES[parseInt(data.slice(5))];
      if (c.subs.length === 1) { toggle(d.csel, leaf(c.name, c.subs[0])); d.ccat = null; }
      else d.ccat = CATEGORIES.indexOf(c);
    } else {
      const [i, j] = data.slice(5).split(":").map(Number);
      toggle(d.csel, leaf(CATEGORIES[i].name, CATEGORIES[i].subs[j]));
    }
    await setState(db, uid, st.step, d);
    return setKB(campTagsKB(d));
  }
  if (data === "ctags_done") {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}"); const sel = d.csel || [];
    if (!sel.length) return edit("❌ حداقل یک زیرشاخه انتخاب کن.");
    d.tags = sel;
    await setState(db, uid, "CAMP_TARGET", d);
    return edit(`✅ تگ‌ها: ${sel.join("، ")}\n\nتعداد عضو هدف را بفرست (حداقل ${MIN_CAMPAIGN}):`);
  }

  if (data.startsWith("report:")) {
    await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason) VALUES (?,?,?,?)").bind(uid, "channel", data.slice(7), "گزارش کاربر روی تسک کانال").run();
    return edit("🚩 گزارش تو ثبت شد. ممنون که از کیفیت کشف محافظت می‌کنی.");
  }

  if (data === "camp_confirm") {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data || "{}");
    const x = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    if (x.balance < d.cost)
      return edit(`❌ موجودی کافی نیست.\nنیاز: <b>${d.cost}</b> | داری: <b>${x.balance}</b>`,
        { inline_keyboard: [[{ text: "💎 خرید سکه", callback_data: "buy" }], [{ text: "❌ انصراف", callback_data: "cancel" }]] });
    await db.prepare("UPDATE users SET balance=balance-? WHERE user_id=?").bind(d.cost, uid).run();
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.cost).run();
    await db.prepare("INSERT INTO channels (owner_id,chat_id,username,chat_type,title,niches,budget_coins,target,bot_is_admin,status) VALUES (?,?,?,?,?,?,?,?,1,'active')")
      .bind(uid, d.chat.chat_id, d.chat.username, d.chat.type, d.chat.title, JSON.stringify(d.tags), d.cost, d.target).run();
    await logTx(db, uid, "ESCROW", -d.cost, x.balance - d.cost, d.chat.username);
    await clearState(db, uid);
    await edit(`🚀 <b>کمپین زنده شد!</b>\n📢 ${d.chat.title} | 👥 ${d.target} عضو واقعی\nموتور تطبیق از حالا مخاطبِ علاقه‌مند می‌فرستد.`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data === "buy") {
    const e = await getEconomy(db); const p = currentPrice(e);
    return edit(`💎 <b>فروشگاه سکه</b> (قیمت لحظه‌ای: ${faNum(Math.round(p))} تومان)\nیک بسته انتخاب کن:`,
      { inline_keyboard: PACKAGES.map(k => [{ text: `${k.label} — ${faNum(Math.floor(k.toman * 0.8 / p))} سکه | ${k.toman.toLocaleString("fa-IR")} تومان`, callback_data: "buy:" + k.toman }]) });
  }
  if (data.startsWith("buy:")) {
    const toman = parseInt(data.slice(4));
    const payload = `pay_${Date.now()}_${uid}`;
    await db.prepare("INSERT INTO payments (user_id,payload,amount_toman) VALUES (?,?,?)").bind(uid, payload, toman).run();
    await bale(env, "sendInvoice", { chat_id: uid, title: "خرید سکه کشف", description: `بسته ${toman.toLocaleString("fa-IR")} تومانی`, payload, provider_token: env.WALLET_TOKEN, prices: [{ label: "مبلغ بسته (ریال)", amount: toman * TOMAN_TO_RIAL }] });
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
    return edit(`🔒 <b>${faNum(d.amount)} سکه</b> به مدت ${faNum(days)} روز قفل شد.\n🎰 +${faNum(tickets)} بلیت قرعه‌کشی\n💵 سود روزانه ۲٪ هنگام آزادسازی\n🗓 آزادسازی: ${faDate(unlock)} ساعت ${faTime(unlock)}`);
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
        msg += `✅ ${faNum(s.amount)} سکه آزاد شد + سود ${faNum(yieldC || 0)}\n`;
      } else msg += `⏳ یک استیک تا ${faDate(s.unlock_at)} ساعت ${faTime(s.unlock_at)} فعال است\n`;
    }
    return edit(msg || "❌ استیکی نداری.");
  }
  if (data === "stake_report") {
    const rows = (await db.prepare("SELECT * FROM stakes WHERE user_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;
    if (!rows.length) return edit("❌ استیکی نداری.");
    const list = rows.map(s => `${s.status === "active" ? "🟢 فعال" : "🔓 آزادشده"} | ${faNum(s.amount)} سکه\nشروع: ${faDate(s.start_at)} | پایان: ${faDate(s.unlock_at)} ساعت ${faTime(s.unlock_at)}`).join("\n──────────\n");
    return edit(`📊 <b>گزارش استیک</b>\n\n${list}`);
  }
  if (data === "tickets") {
    const c = await db.prepare("SELECT COUNT(*) c FROM lottery_tickets WHERE user_id=?").bind(uid).first();
    return edit(`🎰 بلیت‌های قرعه‌کشی تو: <b>${faNum(c.c)}</b>\n🏆 قرعه‌کشی ماهانه به‌صورت زنده برگزار می‌شود.`);
  }

  if (data === "edit_interests") {
    const x = await db.prepare("SELECT interests FROM users WHERE user_id=?").bind(uid).first();
    const sel = JSON.parse(x.interests || "[]");
    await setState(db, uid, "INTERESTS", { sel, cat: null });
    return edit("🎨 دسته‌ها را بازبینی کن:", interestsKB({ sel, cat: null }));
  }
  if (data === "invitelink") {
    const x = await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();
    return sendMsg(env, uid, `🔗 لینک دعوت تو:\nhttps://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}\n\n🎁 هر دوست = <b>+۱۵ سکه</b> (قابل فوروارد)`);
  }
  if (data === "refs") {
    const total = await db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").bind(uid).first();
    const rows = (await db.prepare("SELECT first_name, created_at FROM users WHERE referred_by=? ORDER BY created_at DESC LIMIT 10").bind(uid).all()).results;
    const x = await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();
    const list = rows.length ? rows.map((r, i) => `${faNum(i + 1)}. ${r.first_name || "بدون نام"} - ${faDate(r.created_at)}`).join("\n") : "هنوز کسی را دعوت نکرده‌ای!";
    return edit(`👥 <b>زیرمجموعه‌های تو</b>\n\n👤 تعداد کل: <b>${faNum(total.c)}</b>\n💰 جایزه هر زیرمجموعه: <b>۱۵ سکه</b>\n\n📋 <b>۱۰ نفر آخر:</b>\n${list}\n\n🔗 <b>لینک دعوت:</b>\n<code>https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}</code>`);
  }
  if (data === "mycams") {
    const rows = (await db.prepare("SELECT * FROM channels WHERE owner_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;
    if (!rows.length) return edit("❌ هنوز کمپینی ثبت نکرده‌ای.\nاز منوی «📢 ثبت کمپین رشد» شروع کن.");
    const statusFa = s => s === "active" ? "🟢 فعال" : s === "paused" ? "🟡 متوقف موقت" : "🔴 حذف‌شده";
    const list = rows.map(ch => {
      const remain = Math.max(ch.target - ch.acquired, 0);
      const pct = ch.target > 0 ? Math.min(Math.round((ch.acquired / ch.target) * 100), 100) : 0;
      return `📢 <b>${ch.title}</b> (@${ch.username})\n📊 درخواست: ${faNum(ch.target)} | دریافت: ${faNum(ch.acquired)} | باقی: ${faNum(remain)}\n📈 پیشرفت: ${faNum(pct)}٪ | وضعیت: ${statusFa(ch.status)}\n📅 ثبت: ${faDate(ch.created_at)}\n──────────`;
    }).join("\n");
    return edit(`📋 <b>کمپین‌های تو</b>\n\n${list}`);
  }

  if (data === "support_start") { await setState(db, uid, "SUPPORT_MSG"); return edit("📨 پیام خود را کامل بنویس:"); }
  if (data === "claim_club") {
    const res = await bale(env, "getChatMember", { chat_id: env.CLUB_CHANNEL, user_id: uid });
    if (!["member", "creator", "administrator"].includes(res.result?.status)) return edit("❌ هنوز عضو کانال مرکزی نشده‌ای!");
    const ok = await mintFromBudget(db, uid, 5);
    if (ok) await logTx(db, uid, "MISSION_CLUB", 5, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);
    return edit(ok ? "🎉 + سکه" : " بودجه مأموریت خالی است.");
  }
  if (data === "stats") {
    const e = await getEconomy(db);
    return edit(`📊 <b>اقتصاد کشف</b>\n💰 پشتوانه: ${faNum(Math.round(e.pool_value))} ت\n🪙 ضرب: ${faNum(e.total_minted)} | 🔥 سوخت: ${faNum(e.total_burned)}\n🔒 قفل: ${faNum(e.total_locked)}\n💎 قیمت لحظه‌ای: <b>${faNum(Math.round(currentPrice(e)))}</b> تومان`);
  }

  if (data.startsWith("mission:")) {
    const chId = parseInt(data.slice(8));
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();
    if (!ch || ch.budget_coins < REWARD_COINS) return edit("⚠️ بودجه کمپین تمام شده.");
    const m = await db.prepare("SELECT status FROM memberships WHERE user_id=? AND channel_id=?").bind(uid, chId).first();
    if (m && m.status === "joined") return edit("⏳ تو قبلاً در این کانال عضو شدی و در انتظار تأیید ۴۸ ساعته‌ای.\nبا «بعدی» تسک جدید بگیر.");
    if (m && m.status === "rewarded") return edit("✅ قبلاً پاداش این کانال را گرفته‌ای.\nبا «بعدی» تسک جدید بگیر.");
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
    return edit(`✅ عضویت ثبت شد!\n🪙 + سکه پس از تأیید ماندگاری (تا ${faDate(check)} ساعت ${faTime(check)})`);
  }
}

// ─── موتور تطبیق + نشان وضعیت ───
async function showDiscover(q, env, idx) {
  const db = env.DB, uid = q.from.id;
  const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  const my = JSON.parse(u.interests || "[]");
  const chs = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  const match = chs.filter(c => JSON.parse(c.niches || "[]").some(t => my.includes(t)));
  if (!match.length) return bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text: "😴 کمپین مطابق علایق تو نیست.\nبا «🎨 ویرایش علایق» دسته‌ها را بازبینی کن." });
  const ch = match[idx % match.length];
  const overlap = Math.round(JSON.parse(ch.niches).filter(t => my.includes(t)).length / Math.max(my.length, 1) * 100);
  const m = await db.prepare("SELECT status FROM memberships WHERE user_id=? AND channel_id=?").bind(uid, ch.id).first();
  const badge = m ? (m.status === "joined" ? "\n⏳ <i>وضعیت تو: در انتظار تأیید ۴۸ ساعته</i>" : m.status === "rewarded" ? "\n✅ <i>وضعیت تو: انجام شد</i>" : m.status === "assigned" ? "\n🔘 <i>وضعیت تو: شروع نشده</i>" : "\n⛔ <i>وضعیت تو: جریمه شد</i>") : "";
  const typeEmoji = ch.chat_type === "channel" ? "📢" : "👥";
  await bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id,
    text: `🌟 ${typeEmoji} <b>${ch.title}</b>\n🎯 تشابه: ${faNum(overlap)}٪ | 🪙 +${faNum(REWARD_COINS)}${badge}`, parse_mode: "HTML",
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
  await db.prepare("UPDATE payments SET status='paid', coins_granted=?, bale_transaction_id=? WHERE payload=?").bind(coins, sp.provider_payment_charge_id || "", sp.invoice_payload).run();
  await sendMsg(env, u.message.from.id, `💎 خرید موفق!\n🪙 +<b>${faNum(coins)}</b> سکه\n💰 پشتوانه اقتصاد رشد کرد 📈`, MAIN_KB);
}

// ─── ابزارهای مدیر ───
async function handleDraw(env, uid) {
  const db = env.DB;
  const tickets = (await db.prepare("SELECT * FROM lottery_tickets WHERE draw_id IS NULL").all()).results;
  if (!tickets.length) return sendMsg(env, uid, "❌ بلیطی برای قرعه‌کشی نیست.");
  const win = tickets[Math.floor(Math.random() * tickets.length)];
  const r = await db.prepare("INSERT INTO draws (period,prize_title,status,winner_id,draw_at) VALUES ('manual','قرعه‌کشی کشف','completed',?,datetime('now'))").bind(win.user_id).run();
  await db.prepare("UPDATE lottery_tickets SET draw_id=? WHERE draw_id IS NULL").bind(r.meta.last_row_id).run();
  const w = await db.prepare("SELECT first_name FROM users WHERE user_id=?").bind(win.user_id).first();
  await bale(env, "sendMessage", { chat_id: win.user_id, text: "🏆 تبریک! تو برنده قرعه‌کشی کشف شدی! 🎉\nبرای دریافت جایزه به پشتیبانی پیام بده." });
  await sendMsg(env, uid, `🏆 برنده: <b>${w?.first_name || ""}</b> (<code>${win.user_id}</code>)\n📣 حالا در ${CLUB_CHANNEL} به‌صورت زنده اعلام کن.`);
}
async function handleReports(env, uid) {
  const db = env.DB;
  const rows = (await db.prepare("SELECT * FROM reports WHERE status='open' ORDER BY id DESC LIMIT 10").all()).results;
  if (!rows.length) return sendMsg(env, uid, "✅ گزارش باز نداریم.");
  return sendMsg(env, uid, rows.map(x => `#${x.id} | ${x.target_kind}#${x.target_id}\n👤 ${x.reporter_id}\n📝 ${x.reason}\n──────────`).join("\n"));
}

// ─── کرون ───
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
    const MENU = ["🌟 کشف کانال، گروه و ربات","📢 ثبت کمپین رشد","🎯 مأموریت‌های امروز","👤 پروفایل من","❓ راهنما و پشتیبانی"];
    if (MENU.includes(t)) { await clearState(env.DB, u.message.from.id); return handleMenu(u, env); }
    const st = await getState(env.DB, u.message.from.id);
    if (st) return handleStateText(u, env, st);
    return handleMenu(u, env);
  }
}