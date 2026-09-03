// ═══════════ 🌱 KashfBot v2 ═══════════
const BOT_NAME = "کشف", CLUB_CHANNEL = "@KashfClub";
const BASE_PRICE = 100, COMMISSION_RATE = 0.2, RETENTION_HOURS = 48;
const WELCOME_BONUS = 10, REWARD_COINS = 4, PENALTY_COINS = 8;
const COST_PER_MEMBER = 4, MIN_CAMPAIGN = 25;
const TAGS = ["ورزش","طنز","اخبار","تکنولوژی","فروشگاهی","آموزشی","هنر","آشپزی","بازی","مذهبی"];
const HELP_TEXT = `📚 <b>راهنمای کشف</b>\n\n🪙 <b>کسب سکه:</b> عضویت در کانال‌های پیشنهادی (+۴) | مأموریت‌ها | دعوت دوستان\n⏳ <b>قانون ۴۸ ساعت:</b> خروج زودتر = −۸ سکه و اعتماد −۱۰\n🛡 <b>اعتماد:</b> هرچه بیشتر بمانید، امتیاز و پاداش بیشتر\n💎 <b>قیمت سکه:</b> پویا — با رشد تقاضا بالا می‌رود\n📢 <b>ثبت کمپین:</b> هر عضو = ۴ سکه (حداقل ۲۵ عضو)`;

async function bale(env, method, payload = {}) {
  const res = await fetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return await res.json();
}
const sendMsg = (env, chat_id, text, reply_markup) =>
  bale(env, "sendMessage", { chat_id, text, parse_mode: "HTML", ...(reply_markup ? { reply_markup } : {}) });
const answerCb = (env, id) => bale(env, "answerCallbackQuery", { callback_query_id: id });

// ─── اقتصاد ───
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
  await logTx(db, uid, "BUDGET_MINT", coins, u.balance); return true;
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

// ─── کیبوردها ───
const MAIN_KB = { keyboard: [
  [{text:"🌟 کشف کانال‌های جدید"},{text:"📢 ثبت کمپین رشد"}],
  [{text:"🎯 مأموریت‌های امروز"},{text:"👤 پروفایل و کیف پول"}],
  [{text:"❓ راهنما و پشتیبانی"}]], resize_keyboard: true };
const interestsKB = sel => ({ inline_keyboard: [
  ...Array.from({length:5}, (_,i) => TAGS.slice(i*2,i*2+2).map(t => ({text:(sel.includes(t)?"✅ ":"")+t, callback_data:"tag:"+t}))),
  [{text:"✅ ثبت علایق من", callback_data:"tags_done"}]]});
const campTagsKB = sel => ({ inline_keyboard: [
  ...Array.from({length:5}, (_,i) => TAGS.slice(i*2,i*2+2).map(t => ({text:(sel.includes(t)?"✅ ":"")+t, callback_data:"ctag:"+t}))),
  [{text:"✅ ادامه", callback_data:"ctags_done"}],[{text:"❌ انصراف", callback_data:"cancel"}]]});
const CANCEL_KB = {inline_keyboard:[[{text:"❌ انصراف", callback_data:"cancel"}]]};

// ─── استارت ───
async function handleStart(u, env) {
  const uid = u.message.from.id, db = env.DB;
  const text = u.message.text || "";
  const ref = text.includes("ref_") ? text.split("ref_")[1].trim() : null;
  const exists = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  if (!exists) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)").bind(uid, u.message.from.username||"", u.message.from.first_name||"", code, ref).run();
    return sendMsg(env, uid, `🌱 به <b>${BOT_NAME}</b> خوش آمدی!\nبه چه موضوعاتی علاقه داری؟ (حداکثر ۵)`, interestsKB([]));
  }
  await sendMsg(env, uid, `👋 خوش برگشتی!\n🪙 موجودی: <b>${exists.balance}</b> سکه`, MAIN_KB);
}

// ─── منوی اصلی ───
async function handleMenu(u, env) {
  const t = u.message.text, uid = u.message.from.id, db = env.DB;
  if (t === "🌟 کشف کانال‌های جدید")
    return sendMsg(env, uid, "برای کشف کانال‌های مرتبط با علایقت دکمه بزن:", {inline_keyboard:[[{text:"🌟 نمایش پیشنهاد", callback_data:"disc"}]]});
  if (t === "📢 ثبت کمپین رشد") {
    await setState(db, uid, "CAMP_USERNAME");
    return sendMsg(env, uid, `📢 <b>ثبت کمپین رشد</b>\n\nشناسه کانال/گروه را بفرست (با @):\nمثال: <code>@my_channel</code>\n\n⚠️ ربات باید در آن <b>ادمین</b> باشد.`, CANCEL_KB);
  }
  if (t === "🎯 مأموریت‌های امروز") return missionsHandler(uid, env);
  if (t === "👤 پروفایل و کیف پول") {
    const x = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    return sendMsg(env, uid, `👤 <b>${x.first_name}</b>\n🪙 موجودی: <b>${x.balance}</b> سکه\n🔒 استیک: <b>${x.staked}</b>\n🛡 اعتماد: <b>${x.trust_score}/100</b>\n📊 تسک‌های موفق: <b>${x.total_tasks}</b>\n🔗 کد دعوت: <code>${x.ref_code}</code>`,
      {inline_keyboard:[[{text:"📊 آمار سیستم", callback_data:"stats"}],[{text:"🔒 قفل سکه (استیک)", callback_data:"stake_soon"}]]});
  }
  if (t === "❓ راهنما و پشتیبانی")
    return sendMsg(env, uid, HELP_TEXT, {inline_keyboard:[[{text:"📨 پیام به پشتیبانی", callback_data:"support_start"}]]});
}

// ─── مأموریت‌ها ───
async function missionsHandler(uid, env) {
  const db = env.DB;
  const rewarded = await db.prepare("SELECT COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();
  const clubTaken = await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND type='MISSION_CLUB'").bind(uid).first();
  return sendMsg(env, uid, `🎯 <b>مأموریت‌های امروز</b>\n\n1️⃣ عضویت در کانال مرکزی (+۵ سکه) ${clubTaken?"✅":"⏳"}\n2️⃣ انجام ۳ تسک تأییدشده 📊 (${rewarded.c})\n3️⃣ دعوت یک دوست (+۱۵ سکه) 🔗`,
    {inline_keyboard:[[ clubTaken?{text:"✅ دریافت شد", callback_data:"noop"}:{text:"✅ عضویت در کانال مرکزی", callback_data:"claim_club"}]]});
}

// ─── متن‌های وسط مکالمه (ماشین حالت) ───
async function handleStateText(u, env, st) {
  const db = env.DB, uid = u.message.from.id, text = (u.message.text||"").trim();
  const d = JSON.parse(st.data || "{}");

  if (st.step === "CAMP_USERNAME") {
    const uname = text.replace(/^@/, "");
    const res = await bale(env, "getChat", { chat_id: "@" + uname });
    if (!res.ok) return sendMsg(env, uid, "❌ کانال/گروه پیدا نشد. با @ بفرستید.", CANCEL_KB);
    const me = await bale(env, "getMe");
    const adm = await bale(env, "getChatAdministrators", { chat_id: "@" + uname });
    if (!(adm.result||[]).some(a => a.user?.id === me.result?.id))
      return sendMsg(env, uid, "❌ ربات در این کانال <b>ادمین نیست</b>. اول ادمین کنید، دوباره بفرستید.", CANCEL_KB);
    d.chat = { chat_id: String(res.result.id), username: uname, title: res.result.title || uname, type: res.result.type || "channel" };
    await setState(db, uid, "CAMP_TAGS", d);
    return sendMsg(env, uid, `✅ کانال «${d.chat.title}» تأیید شد.\n\nحالا ۱ تا ۵ تگ موضوعی انتخاب کن (موتور تطبیق بر همین اساس مخاطب واقعی می‌فرستد):`, campTagsKB([]));
  }

  if (st.step === "CAMP_TARGET") {
    const n = parseInt(text);
    if (!n || n < MIN_CAMPAIGN) return sendMsg(env, uid, `❌ حداقل ${MIN_CAMPAIGN} عضو. یک عدد معتبر بفرست.`, CANCEL_KB);
    d.target = n; d.cost = n * COST_PER_MEMBER;
    await setState(db, uid, "CAMP_CONFIRM", d);
    return sendMsg(env, uid, `🧾 <b>پیش‌فاکتور کمپین</b>\n\n📢 ${d.chat.title}\n👥 تعداد عضو: <b>${n}</b>\n🪙 هزینه کل: <b>${d.cost} سکه</b>\n\nتأیید می‌کنی؟`,
      {inline_keyboard:[[{text:"✅ تأیید و راه‌اندازی", callback_data:"camp_confirm"}],[{text:"❌ انصراف", callback_data:"cancel"}]]});
  }

  if (st.step === "SUPPORT_MSG") {
    const owner = parseInt(env.OWNER_ID || "0");
    if (owner) await bale(env, "sendMessage", { chat_id: owner, text: `📨 <b>پیام پشتیبانی</b>\n👤 ${u.message.from.first_name} (<code>${uid}</code>)\n\n${text}`, parse_mode: "HTML" });
    else await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason) VALUES (?,?,?,?)").bind(uid, "support", String(uid), text).run();
    await clearState(db, uid);
    return sendMsg(env, uid, "✅ پیام شما به پشتیبانی ارسال شد. پاسخ در همین چت می‌آید.", MAIN_KB);
  }
}

// ─── کال‌بک‌ها ───
async function handleCb(q, env) {
  const db = env.DB, uid = q.from.id, data = q.data;
  await answerCb(env, q.id);
  const edit = (text, rm) => bale(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text, parse_mode: "HTML", ...(rm?{reply_markup:rm}:{}) });

  if (data === "noop") return;
  if (data === "cancel") { await clearState(db, uid); return edit("❌ انصراف شد.", MAIN_KB); }
  if (data === "stake_soon") return answerCb(env, q.id) || edit("🔒 استیکینگ در به‌روزرسانی بعدی فعال می‌شود.");
  if (data === "disc") return showDiscover(q, env, 0);
  if (data.startsWith("next:")) return showDiscover(q, env, parseInt(data.slice(5)));

  if (data.startsWith("tag:")) {
    const t = data.slice(4);
    const sel = (q.message.reply_markup.inline_keyboard||[]).flat().filter(b=>b.text.startsWith("✅")).map(b=>b.text.slice(2));
    if (sel.includes(t)) sel.splice(sel.indexOf(t),1); else if (sel.length<5) sel.push(t);
    return bale(env, "editMessageReplyMarkup", {chat_id:q.message.chat.id, message_id:q.message.message_id, reply_markup:interestsKB(sel)});
  }
  if (data === "tags_done") {
    const sel = (q.message.reply_markup.inline_keyboard||[]).flat().filter(b=>b.text.startsWith("✅")).map(b=>b.text.slice(2));
    if (!sel.length) return;
    await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel), uid).run();
    const ok = await mintFromBudget(db, uid, WELCOME_BONUS);
    await edit(`✅ علایق ثبت شد!${ok?`\n🎁 بونوس: <b>+${WELCOME_BONUS} سکه</b>`:""}\n🛡 اعتماد: ۵۰ | 📢 ${CLUB_CHANNEL}`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data.startsWith("ctag:")) {
    const t = data.slice(5);
    const sel = (q.message.reply_markup.inline_keyboard||[]).flat().filter(b=>b.text.startsWith("✅")).map(b=>b.text.slice(2));
    if (sel.includes(t)) sel.splice(sel.indexOf(t),1); else if (sel.length<5) sel.push(t);
    return bale(env, "editMessageReplyMarkup", {chat_id:q.message.chat.id, message_id:q.message.message_id, reply_markup:campTagsKB(sel)});
  }
  if (data === "ctags_done") {
    const sel = (q.message.reply_markup.inline_keyboard||[]).flat().filter(b=>b.text.startsWith("✅")).map(b=>b.text.slice(2));
    if (!sel.length) return;
    const st = await getState(db, uid); const d = JSON.parse(st.data||"{}"); d.tags = sel;
    await setState(db, uid, "CAMP_TARGET", d);
    return edit(`✅ تگ‌ها: ${sel.join("، ")}\n\nحالا <b>تعداد عضو هدف</b> را بفرست (حداقل ${MIN_CAMPAIGN}):\nهر عضو = ${COST_PER_MEMBER} سکه`);
  }

  if (data === "camp_confirm") {
    const st = await getState(db, uid); if (!st) return;
    const d = JSON.parse(st.data||"{}");
    const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
    if (u.balance < d.cost) return edit(`❌ موجودی کافی نیست.\nنیاز: <b>${d.cost}</b> | داری: <b>${u.balance}</b>\n\n💎 خرید سکه به‌زودی؛ فعلاً از پشتیبانی بخواهید یا با کد دعوت سکه جمع کنید.`);
    await db.prepare("UPDATE users SET balance=balance-? WHERE user_id=?").bind(d.cost, uid).run();
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.cost).run();
    await db.prepare("INSERT INTO channels (owner_id,chat_id,username,chat_type,title,niches,budget_coins,target,bot_is_admin,status) VALUES (?,?,?,?,?,?,?,?,1,'active')")
      .bind(uid, d.chat.chat_id, d.chat.username, d.chat.type, d.chat.title, JSON.stringify(d.tags), d.cost, d.target).run();
    await logTx(db, uid, "ESCROW", -d.cost, u.balance - d.cost, d.chat.username);
    await clearState(db, uid);
    await edit(`🚀 <b>کمپین شما زنده شد!</b>\n\n📢 ${d.chat.title}\n👥 هدف: ${d.target} عضو واقعی\n🪙 بودجه قفل‌شده: ${d.cost}\n\nموتور تطبیق از این به بعد، کاربرانِ علاقه‌مند به «${(d.tags||[]).join("، ")}» را به کانال شما می‌فرستد.`);
    return sendMsg(env, uid, "منوی اصلی:", MAIN_KB);
  }

  if (data === "support_start") { await setState(db, uid, "SUPPORT_MSG"); return edit("📨 پیام خود را کامل بنویسید تا برای پشتیبانی ارسال شود:"); }

  if (data === "claim_club") {
    const res = await bale(env, "getChatMember", { chat_id: env.CLUB_CHANNEL, user_id: uid });
    if (!["member","creator","administrator"].includes(res.result?.status)) return edit("❌ هنوز عضو کانال مرکزی نشده‌ای!");
    const ok = await mintFromBudget(db, uid, 5);
    if (ok) { await logTx(db, uid, "MISSION_CLUB", 5, (await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance); }
    return edit(ok ? "🎉 مأموریت ۱ انجام شد! <b>+۵ سکه</b>" : "⏳ بودجه مأموریت فعلاً خالی است.");
  }

  if (data === "stats") {
    const e = await getEconomy(db);
    return edit(`📊 <b>آمار اقتصاد کشف</b>\n💰 پشتوانه: <b>${Math.round(e.pool_value)}</b> تومان\n🪙 ضرب‌شده: <b>${e.total_minted}</b>\n🔥 سوخته: <b>${e.total_burned}</b>\n🔒 قفل: <b>${e.total_locked}</b>\n💎 قیمت لحظه‌ای: <b>${Math.round(currentPrice(e))}</b> تومان`);
  }

  if (data.startsWith("mission:")) {
    const chId = parseInt(data.slice(8));
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();
    if (!ch || ch.budget_coins < REWARD_COINS) return edit("⚠️ بودجه این کمپین تمام شده.");
    const r = await db.prepare("INSERT INTO memberships (user_id,channel_id,status) VALUES (?,?,'assigned')").bind(uid, chId).run();
    return edit(`📢 عضو شو: <b>@${ch.username}</b>\nسپس دکمه زیر را بزن:`, {inline_keyboard:[[{text:"✅ عضو شدم", callback_data:"joined:"+r.meta.last_row_id}]]});
  }

  if (data.startsWith("joined:")) {
    const mId = parseInt(data.slice(7));
    const m = await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    const res = await bale(env, "getChatMember", { chat_id: "@"+ch.username, user_id: uid });
    if (!["member","creator","administrator"].includes(res.result?.status))
      return edit("❌ هنوز عضو نشده‌ای!", {inline_keyboard:[[{text:"🔄 بررسی دوباره", callback_data:"joined:"+mId}]]});
    const now = new Date(), check = new Date(now.getTime()+RETENTION_HOURS*3600*1000).toISOString();
    await db.prepare("UPDATE memberships SET status='joined', joined_at=?, check_at=? WHERE id=?").bind(now.toISOString(), check, mId).run();
    return edit("✅ عضویت ثبت شد!\n🪙 پاداش ۴ سکه پس از تأیید ماندگاری ۴۸ ساعته واریز می‌شود.");
  }
}

// ─── موتور تطبیق ───
async function showDiscover(q, env, idx) {
  const db = env.DB, uid = q.from.id;
  const u = await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  const my = JSON.parse(u.interests || "[]");
  const chs = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  const match = chs.filter(c => JSON.parse(c.niches||"[]").some(t => my.includes(t)));
  if (!match.length) return bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id, text:"😴 فعلاً کمپین فعالی مطابق علایق تو نیست."});
  const ch = match[idx % match.length];
  const overlap = Math.round(JSON.parse(ch.niches).filter(t => my.includes(t)).length / Math.max(my.length,1) * 100);
  await bale(env, "editMessageText", {chat_id:q.message.chat.id, message_id:q.message.message_id,
    text:`🌟 <b>${ch.title}</b>\n🎯 تشابه: <b>${overlap}٪</b>\n🪙 پاداش: <b>+${REWARD_COINS} سکه</b>`, parse_mode:"HTML",
    reply_markup:{inline_keyboard:[[{text:"🚀 شروع مأموریت", callback_data:"mission:"+ch.id}],[{text:"⏭ پیشنهاد بعدی", callback_data:"next:"+(idx+1)}]]}});
}

// ─── کرون ───
async function runCron(env) {
  const db = env.DB, now = new Date().toISOString();
  const due = (await db.prepare("SELECT * FROM memberships WHERE status='joined' AND check_at<=?").bind(now).all()).results;
  for (const m of due) {
    const ch = await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    if (!ch) continue;
    const res = await bale(env, "getChatMember", {chat_id:"@"+ch.username, user_id:m.user_id});
    if (["member","creator","administrator"].includes(res.result?.status)) {
      await db.prepare("UPDATE memberships SET status='rewarded' WHERE id=?").bind(m.id).run();
      await payFromEscrow(db, m.user_id, m.channel_id, m.coins);
      await db.prepare("UPDATE users SET trust_score=MIN(100,trust_score+5), total_tasks=total_tasks+1 WHERE user_id=?").bind(m.user_id).run();
      await bale(env, "sendMessage", {chat_id:m.user_id, text:"🎉 ماندگاری تأیید شد! <b>+۴ سکه</b> | 🛡 +۵", parse_mode:"HTML"});
    } else {
      await db.prepare("UPDATE memberships SET status='penalized' WHERE id=?").bind(m.id).run();
      await db.prepare("UPDATE users SET balance=MAX(0,balance-?), trust_score=MAX(0,trust_score-10) WHERE user_id=?").bind(PENALTY_COINS, m.user_id).run();
      await bale(env, "sendMessage", {chat_id:m.user_id, text:`⚠️ خروج زودهنگام: <b>−${PENALTY_COINS} سکه</b>`, parse_mode:"HTML"});
    }
  }
  const me = await bale(env, "getMe");
  const actives = (await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
  for (const ch of actives) {
    const adm = await bale(env, "getChatAdministrators", {chat_id:"@"+ch.username});
    if (!(adm.result||[]).some(a => a.user?.id === me.result?.id)) {
      const v = ch.violations + 1, status = v >= 3 ? "removed" : "paused";
      await db.prepare("UPDATE channels SET violations=?, status=?, bot_is_admin=0 WHERE id=?").bind(v, status, ch.id).run();
      if (ch.owner_id) await bale(env, "sendMessage", {chat_id:ch.owner_id, text: v>=3 ? "❌ کمپین برای همیشه حذف شد." : "⚠️ ربات دیگر ادمین نیست! کمپین متوقف شد."});
    }
  }
}

// ─── ورودی ───
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/webhook") {
      const update = await req.json(); ctx.waitUntil(route(update, env)); return new Response("ok");
    }
    if (url.pathname === "/health") return new Response("🌱 KashfBot alive");
    return new Response("Not Found", { status: 404 });
  },
  async scheduled(_e, env, ctx) { ctx.waitUntil(runCron(env)); },
};
async function route(u, env) {
  if (u.message?.text?.startsWith("/start")) return handleStart(u, env);
  if (u.callback_query) return handleCb(u.callback_query, env);
  if (u.message?.text) {
    const st = await getState(env.DB, u.message.from.id);
    if (st) return handleStateText(u, env, st);
    return handleMenu(u, env);
  }
}