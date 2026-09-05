// ═══════════════════════════════════════════
// 🌱 KashfBot v13.2 — Clear Notifications
// ═══════════════════════════════════════════
const BOT_NAME = "کشف", CLUB_CHANNEL = "@KashfClub";
const BOT_USERNAME = "kashfbot";
const BASE_PRICE = 100, COMMISSION_RATE = 0.2, RETENTION_HOURS = 48;
const WELCOME_BONUS = 10, PENALTY_COINS = 8;
const COST_PER_MEMBER = 4, MIN_CAMPAIGN = 25, TOMAN_TO_RIAL = 10;
const STAKE_DAILY_RATE = 0.005;
const REQ_LIMIT = 100000;

const TIERS = {
  standard:  { join:1, forward:0, quiz:0, ret30:0, max:1, label:"استاندارد (۱ سکه/عضو)" },
  guaranteed:{ join:1, forward:0, quiz:0, ret30:1, max:2, label:"تضمینی (۲ سکه/عضو)" },
  premium:   { join:1, forward:1, quiz:2, ret30:1, max:5, label:"پریمیوم (۵ سکه/عضو)" },
};

const REPORT_TYPES = [
  { id:"immoral", label:"🔺 کمپین غیراخلاقی", cat:"content" },
  { id:"challenge", label:"🔺 محتوای مرتبط با چالش", cat:"content" },
  { id:"linkdump", label:"🔺 لینکدونی و فروش ممبر", cat:"content" },
  { id:"adult", label:"🔺 فروشگاه محصولات جنسی", cat:"content" },
  { id:"magic", label:"🔺 دعا و طلسم", cat:"content" },
  { id:"gambling", label:"🔺 قمار و شرط‌بندی", cat:"content" },
  { id:"sighe", label:"🔺 ازدواج موقت و صیغه", cat:"content" },
  { id:"no_link", label:"🔺 لینک جستجو موجود نبود", cat:"technical" },
  { id:"no_quiz", label:"🔺 محتوای کوییز موجود نبود", cat:"technical" },
];

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
const leaf = (c, s) => `${c} > ${s}`;

const JALALI_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const faNum = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
function g2j(gy,gm,gd){const g=[0,31,59,90,120,151,181,212,243,273,304,334];let jy=(gy<=1600)?0:979;gy-=(gy<=1600)?621:1600;const gy2=(gm>2)?(gy+1):gy;let d=(365*gy)+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+g[gm-1];jy+=33*Math.floor(d/12053);d%=12053;jy+=4*Math.floor(d/1461);d%=1461;if(d>365){jy+=Math.floor((d-1)/365);d=(d-1)%365;}const jm=(d<186)?1+Math.floor(d/31):7+Math.floor((d-186)/30);const jd=1+((d<186)?(d%31):((d-186)%30));return[jy,jm,jd];}
const IR = iso => new Date(new Date(iso).getTime()+3.5*3600*1000);
function faDate(iso){const d=IR(iso);const[jy,jm,jd]=g2j(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate());return`${faNum(jd)} ${JALALI_MONTHS[jm-1]} ${faNum(jy)}`;}
function faTime(iso){const d=IR(iso);return faNum(String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0"));}
const chunk=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n));
const toEn=s=>String(s||"").replace(/[۰-۹-]/g,d=>{const c=d.charCodeAt(0);if(c>=1776&&c<=1785)return c-1776;if(c>=1632&&c<=1641)return c-1632;return d;});
const PACKAGES=[{toman:30000,label:"بسته پایه"},{toman:60000,label:"بسته نقره‌ای"},{toman:120000,label:"بسته طلایی"},{toman:300000,label:"بسته الماس"}];
const HELP_TEXT=`📚 <b>راهنمای کشف</b>\n\n🪙 کسب سکه:\n• عضویت: +۱ سکه\n• فوروارد پست: +۱ سکه\n• کوییز مکان‌محور: +۲ سکه\n• ماندگاری ۳۰ روزه: +۱ سکه\n\n⏳ قانون ۴۸ ساعت: ماندگاری = مخاطب واقعی\n🛡 اعتماد: هرچه فعال‌تر، پاداش بیشتر\n💎 قیمت سکه: پویا بر اساس عرضه/تقاضا\n🔒 استیک: سود ۰.۵٪ + بلیت قرعه‌کشی\n🏆 کیفیت: ما «مخاطب فعال تأییدشده» می‌فروشیم`;

async function bale(env,method,payload={}){const r=await fetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});return await r.json();}
const sendMsg=(env,c,t,rm)=>bale(env,"sendMessage",{chat_id:c,text:t,parse_mode:"HTML",...(rm?{reply_markup:rm}:{})});
const answerCb=(env,id)=>bale(env,"answerCallbackQuery",{callback_query_id:id});
const isAdmin=(env,uid)=>uid===parseInt(env.OWNER_ID||"0");
const isBanned=async(db,uid)=>!!(await db.prepare("SELECT 1 FROM reports WHERE target_kind='ban' AND target_id=? LIMIT 1").bind(String(uid)).first());
async function notify(env,db,uid,text){const u=await db.prepare("SELECT 1 FROM users WHERE user_id=?").bind(uid).first();if(u)await bale(env,"sendMessage",{chat_id:uid,text,parse_mode:"HTML"});}
// v13.2: اعلان مستقیم به مالک (بدون چک جدول users)
async function notifyOwner(env,text){const o=parseInt(env.OWNER_ID||"0");if(o)await bale(env,"sendMessage",{chat_id:o,text,parse_mode:"HTML"});}

async function getEconomy(db){let e=await db.prepare("SELECT * FROM economy_state WHERE id=1").first();if(!e){await db.prepare("INSERT INTO economy_state (id) VALUES (1)").run();e=await db.prepare("SELECT * FROM economy_state WHERE id=1").first();}return e;}
const circulating=e=>Math.max(e.total_minted-e.total_burned-e.total_locked,0);
const currentPrice=e=>{const c=circulating(e);return c>0?Math.max(BASE_PRICE,e.pool_value/c):BASE_PRICE;};
async function logTx(db,uid,type,amount,after,note=""){await db.prepare("INSERT INTO transactions (user_id,type,amount,balance_after,note) VALUES (?,?,?,?,?)").bind(uid,type,amount,after,note).run();}
async function mintFromBudget(db,uid,coins){const e=await getEconomy(db);const cost=coins*currentPrice(e);if(e.reward_budget<cost)return false;await db.prepare("UPDATE economy_state SET reward_budget=reward_budget-?, total_minted=total_minted+? WHERE id=1").bind(cost,coins).run();await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins,uid).run();const u=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();await logTx(db,uid,"BUDGET_MINT",coins,u.balance);return true;}
async function mintPurchase(db,uid,amountToman){const e=await getEconomy(db);const commission=amountToman*COMMISSION_RATE,backing=amountToman-commission;const coins=Math.floor(backing/currentPrice(e));await db.prepare("UPDATE economy_state SET pool_value=pool_value+?, weekly_commission=weekly_commission+?, total_minted=total_minted+? WHERE id=1").bind(backing,commission,coins).run();await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins,uid).run();const u=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();await logTx(db,uid,"PURCHASE_MINT",coins,u.balance,`${amountToman}T`);return coins;}

async function payAction(env,db,m,action,coins,ch){if(coins<=0||!ch||ch.budget_coins<coins)return 0;await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins,m.user_id).run();await db.prepare("UPDATE channels SET budget_coins=budget_coins-? WHERE id=?").bind(coins,ch.id).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(coins).run();const u=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(m.user_id).first();await logTx(db,m.user_id,"TASK_"+action,coins,u.balance,`ch#${ch.id}`);return coins;}
const addQS=(db,mId,pts)=>db.prepare("UPDATE memberships SET quality_score=quality_score+? WHERE id=?").bind(pts,mId).run();

async function refundEscrow(env,db,chId,reason=""){const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();if(!ch||!ch.owner_id||ch.budget_coins<=0)return;const r=ch.budget_coins;await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(r,ch.owner_id).run();await db.prepare("UPDATE channels SET budget_coins=0 WHERE id=?").bind(chId).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(r).run();const u=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(ch.owner_id).first();await logTx(db,ch.owner_id,"ESCROW_REFUND",r,u.balance,reason);await bale(env,"sendMessage",{chat_id:ch.owner_id,text:`💰 <b>${faNum(r)} سکه</b> باقی‌مانده کمپین «${ch.title}» برگشت.\n📝 ${reason}`,parse_mode:"HTML"});}

async function channelGrade(db,chId){const r=await db.prepare("SELECT AVG(quality_score) a, COUNT(*) c FROM memberships WHERE channel_id=? AND status='rewarded'").bind(chId).first();if(!r.c)return{g:"—",w:2,a:0};const a=r.a||0;const g=a>=80?"A":a>=60?"B":a>=40?"C":"D";const w={A:4,B:3,C:2,D:1}[g];return{g,w,a};}

async function setState(db,uid,step,data={}){await db.prepare("INSERT INTO user_states (user_id,step,data) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step, data=excluded.data, updated_at=datetime('now')").bind(uid,step,JSON.stringify(data)).run();}
const getState=(db,uid)=>db.prepare("SELECT * FROM user_states WHERE user_id=?").bind(uid).first();
const clearState=(db,uid)=>db.prepare("DELETE FROM user_states WHERE user_id=?").bind(uid).run();

async function trackQuota(env){try{const db=env.DB;const date=new Date().toISOString().slice(0,10);await db.prepare("INSERT INTO quota(date,requests) VALUES(?,1) ON CONFLICT(date) DO UPDATE SET requests=requests+1").bind(date).run();}catch(e){}}

const MAIN_KB={keyboard:[[{text:"🌟 کشف کانال، گروه و ربات"},{text:"📢 ثبت کمپین رشد"}],[{text:"🎯 مأموریت‌های امروز"},{text:"👤 پروفایل من"}],[{text:"❓ راهنما و پشتیبانی"}]],resize_keyboard:true};
const CANCEL_KB={inline_keyboard:[[{text:"❌ انصراف",callback_data:"cancel"}]]};

function interestsKB(d){const sel=d.sel||[];if(d.cat==null)return{inline_keyboard:[...chunk(CATEGORIES.map((c,i)=>({text:`${c.subs.some(s=>sel.includes(leaf(c.name,s)))?"✅ ":""}${c.emoji} ${c.name}`,callback_data:"cat:"+i})),2),[{text:"✅ ثبت علایق من",callback_data:"tags_done"}]]};const c=CATEGORIES[d.cat];return{inline_keyboard:[[{text:`${c.emoji} ${c.name} — زیرشاخه`,callback_data:"noop"}],...c.subs.map((s,j)=>[{text:`${sel.includes(leaf(c.name,s))?"✅ ":""}${s}`,callback_data:`sub:${d.cat}:${j}`}]),[{text:"🔙 بازگشت",callback_data:"catback"}],[{text:"✅ ثبت علایق من",callback_data:"tags_done"}]]};}
function campTagsKB(d){const sel=d.csel||[];if(d.ccat==null)return{inline_keyboard:[...chunk(CATEGORIES.map((c,i)=>({text:`${c.subs.some(s=>sel.includes(leaf(c.name,s)))?"✅ ":""}${c.emoji} ${c.name}`,callback_data:"ccat:"+i})),2),[{text:"✅ ادامه",callback_data:"ctags_done"}],[{text:"❌ انصراف",callback_data:"cancel"}]]};const c=CATEGORIES[d.ccat];return{inline_keyboard:[[{text:`${c.emoji} ${c.name} — زیرشاخه`,callback_data:"noop"}],...c.subs.map((s,j)=>[{text:`${sel.includes(leaf(c.name,s))?"✅ ":""}${s}`,callback_data:`csub:${d.ccat}:${j}`}]),[{text:"🔙 بازگشت",callback_data:"ccatback"}],[{text:"✅ ادامه",callback_data:"ctags_done"}],[{text:"❌ انصراف",callback_data:"cancel"}]]};}
const tierKB=()=>({inline_keyboard:[Object.entries(TIERS).map(([k,v])=>({text:v.label,callback_data:"tier:"+k})),[{text:"❌ انصراف",callback_data:"cancel"}]]});

async function handleStart(u,env){const uid=u.message.from.id,db=env.DB;if(await isBanned(db,uid))return sendMsg(env,uid,"⛔ حساب شما مسدود است.");const text=u.message.text||"";const ref=text.includes("ref_")?text.split("ref_")[1].trim():null;const ex=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();if(!ex){const code=String(Math.floor(100000+Math.random()*900000));let ru=null;if(ref){const r=await db.prepare("SELECT user_id FROM users WHERE ref_code=?").bind(ref).first();if(r)ru=r.user_id;}await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)").bind(uid,u.message.from.username||"",u.message.from.first_name||"",code,ru).run();if(ru){const ok=await mintFromBudget(db,ru,15);if(ok)await bale(env,"sendMessage",{chat_id:ru,text:"🎉 یک دوست با لینک تو عضو شد! <b>+۱۵ سکه</b>",parse_mode:"HTML"});}await setState(db,uid,"INTERESTS",{sel:[],cat:null});return sendMsg(env,uid,`🌱 به <b>${BOT_NAME}</b> خوش آمدی!\nیک <b>دسته</b> را بزن و زیرشاخه‌ها را انتخاب کن (حداکثر ۵):`,interestsKB({sel:[],cat:null}));}await sendMsg(env,uid,`👋 خوش برگشتی!\n🪙 موجودی: <b>${ex.balance}</b> سکه`,MAIN_KB);}

async function handleMenu(u,env){const t=u.message.text,uid=u.message.from.id,db=env.DB;
if(t==="🌟 کشف کانال، گروه و ربات")return sendMsg(env,uid,"دکمه «🌟 نمایش پیشنهاد» را بزن:",{inline_keyboard:[[{text:"🌟 نمایش پیشنهاد",callback_data:"disc"}]]});
if(t==="📢 ثبت کمپین رشد"){await setState(db,uid,"CAMP_USERNAME");return sendMsg(env,uid,`📢 <b>ثبت کمپین رشد</b>\n\nشناسه کانال/گروه/ربات را بفرست (با @):\n⚠️ ربات باید ادمین باشد.`,CANCEL_KB);}
if(t==="🎯 مأموریت‌های امروز")return missionsHandler(uid,env);
if(t==="👤 پروفایل من"){const x=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();const link=`https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;return sendMsg(env,uid,`👤 <b>${x.first_name}</b>\n🪙 موجودی: <b>${x.balance}</b>\n🔒 استیک: <b>${x.staked}</b>\n🛡 اعتماد: <b>${x.trust_score}/100</b>\n\n🔗 لینک دعوت:\n<code>${link}</code>`,{inline_keyboard:[[{text:"📤 لینک دعوت",callback_data:"invitelink"}],[{text:"👥 زیرمجموعه‌ها",callback_data:"refs"},{text:"📋 کمپین‌های من",callback_data:"mycams"}],[{text:"📒 فعالیت‌های من",callback_data:"myacts"},{text:"💰 جزئیات سکه‌ها",callback_data:"mytxs"}],[{text:"💎 خرید سکه",callback_data:"buy"}],[{text:"🔒 قفل سکه",callback_data:"stake_start"},{text:"🔓 آزادسازی",callback_data:"stake_unlock"}],[{text:"📊 گزارش استیک",callback_data:"stake_report"},{text:"🎰 بلیت‌ها",callback_data:"tickets"}],[{text:"🎨 ویرایش علایق",callback_data:"edit_interests"}]]});}
if(t==="❓ راهنما و پشتیبانی")return sendMsg(env,uid,HELP_TEXT,{inline_keyboard:[[{text:"📨 پیام به پشتیبانی",callback_data:"support_start"}]]});}

async function missionsHandler(uid,env){const db=env.DB;const rewarded=await db.prepare("SELECT COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();const club=await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND type='MISSION_CLUB'").bind(uid).first();return sendMsg(env,uid,`🎯 <b>مأموریت‌های امروز</b>\n\n1️⃣ عضویت کانال مرکزی (+۵) ${club?"✅":"⏳"}\n2️⃣ تسک تأییدشده 📊 (${rewarded.c})\n3️⃣ دعوت دوست (+۱۵) 🔗`,{inline_keyboard:[[club?{text:"✅ دریافت شد",callback_data:"noop"}:{text:"✅ عضویت کانال مرکزی",callback_data:"claim_club"}]]});}

async function handleStateText(u,env,st){const db=env.DB,uid=u.message.from.id,text=(u.message.text||"").trim();const d=JSON.parse(st.data||"{}");
if(["INTERESTS","CAMP_TAGS","REPORT_REASON"].includes(st.step))return sendMsg(env,uid,"لطفاً فقط از دکمه‌ها استفاده کن 🙂");
if(st.step==="CAMP_USERNAME"){const un=text.replace(/^@/,"");const res=await bale(env,"getChat",{chat_id:"@"+un});if(!res.ok)return sendMsg(env,uid,"❌ پیدا نشد. با @ بفرست.",CANCEL_KB);const me=await bale(env,"getMe");const adm=await bale(env,"getChatAdministrators",{chat_id:"@"+un});if(!(adm.result||[]).some(a=>a.user?.id===me.result?.id))return sendMsg(env,uid,"❌ ربات ادمین نیست.",CANCEL_KB);d.chat={chat_id:String(res.result.id),username:un,title:res.result.title||un,type:res.result.type||"channel"};d.csel=[];d.ccat=null;await setState(db,uid,"CAMP_TAGS",d);return sendMsg(env,uid,`✅ «${d.chat.title}» تأیید شد.\nدسته موضوعی را انتخاب کن (۱ تا ۵):`,campTagsKB(d));}
if(st.step==="CAMP_ANCHOR"){d.anchor_post_link=text;await setState(db,uid,"CAMP_DISTANCE",d);return sendMsg(env,uid,"✅ لینک پست مرجع ثبت شد.\nچند پست بعد از این پست باید جستجو شود؟ (۳ تا ۱۰)",CANCEL_KB);}
if(st.step==="CAMP_DISTANCE"){const dist=parseInt(toEn(text));if(!dist||dist<3||dist>10)return sendMsg(env,uid,"❌ عدد بین ۳ تا ۱۰.",CANCEL_KB);d.post_distance=dist;await setState(db,uid,"CAMP_QUIZ_Q",d);return sendMsg(env,uid,`✅ ${faNum(dist)} پست بعد.\nحالا <b>سؤال کوییز</b> را بنویس (مثال: در پست ${faNum(dist)}ام، چه عددی نوشته شده؟)`,CANCEL_KB);}
if(st.step==="CAMP_QUIZ_Q"){d.quiz_question=text;await setState(db,uid,"CAMP_QUIZ_O",d);return sendMsg(env,uid,"✅ سؤال ثبت شد.\nحالا <b>گزینه‌ها</b> را با ویرگول (،) جدا کرده و بفرست:\nمثال: ۱۴۰۱، ۱۴۰۲، ۱۴۰۳، ۱۴۰۴",CANCEL_KB);}
if(st.step==="CAMP_QUIZ_O"){d.quiz_options=JSON.stringify(text.split("،").map(s=>s.trim()).filter(Boolean));await setState(db,uid,"CAMP_QUIZ_A",d);return sendMsg(env,uid,"✅ گزینه‌ها ثبت شد.\nحالا <b>پاسخ صحیح</b> را دقیقاً مثل یکی از گزینه‌ها بفرست:",CANCEL_KB);}
if(st.step==="CAMP_QUIZ_A"){d.quiz_answer=text;await setState(db,uid,"CAMP_TARGET",d);return sendMsg(env,uid,"✅ کوییز ثبت شد.\nتعداد عضو هدف را بفرست (حداقل ۲۵):",CANCEL_KB);}
if(st.step==="CAMP_TARGET"){const n=parseInt(toEn(text));if(!n||n<MIN_CAMPAIGN)return sendMsg(env,uid,`❌ حداقل ${MIN_CAMPAIGN}.`,CANCEL_KB);d.target=n;const tier=TIERS[d.tier||"standard"];d.cost=n*tier.max;await setState(db,uid,"CAMP_CONFIRM",d);return sendMsg(env,uid,`🧾 <b>پیش‌فاکتور</b>\n📢 ${d.chat.title}\n🏷 سطح: ${tier.label}\n👥 ${n} عضو | 🪙 ${d.cost} سکه\n\n💡 فقط برای اقدام تأییدشده از سپرده قفل‌شده کسر می‌شود.`,{inline_keyboard:[[{text:"✅ تأیید و راه‌اندازی",callback_data:"camp_confirm"},{text:"💎 خرید سکه",callback_data:"buy"}],[{text:"❌ انصراف",callback_data:"cancel"}]]});}
if(st.step==="SUPPORT_MSG"){const o=parseInt(env.OWNER_ID||"0");if(o)await bale(env,"sendMessage",{chat_id:o,text:`📨 پشتیبانی\n👤 ${u.message.from.first_name} (<code>${uid}</code>)\n\n${text}`,parse_mode:"HTML"});else await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason,category) VALUES (?,?,?,'','content')").bind(uid,"support",String(uid),text).run();await clearState(db,uid);return sendMsg(env,uid,"✅ ارسال شد.",MAIN_KB);}
if(st.step==="STAKE_AMOUNT"){const n=parseInt(toEn(text));const x=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();if(!n||n<10)return sendMsg(env,uid,"❌ حداقل ۱۰.",CANCEL_KB);if(n>x.balance)return sendMsg(env,uid,`❌ کافی نیست (داری ${x.balance}).`,CANCEL_KB);d.amount=n;await setState(db,uid,"STAKE_PERIOD",d);return sendMsg(env,uid,`🔒 مقدار: <b>${n}</b>\nدوره را انتخاب کن:`,{inline_keyboard:[[{text:"۷ روز (.۵٪)",callback_data:"stake_period:7"},{text:"۳۰ روز (۰.۵٪)",callback_data:"stake_period:30"}],[{text:"❌ انصراف",callback_data:"cancel"}]]});}}

async function submitReport(env,db,reporterId,targetKind,targetId,reason,category){
  await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason,category) VALUES (?,?,?,?,?)").bind(reporterId,targetKind,targetId,reason,category).run();
  const owner=parseInt(env.OWNER_ID||"0");
  if(owner){
    const reporter=await db.prepare("SELECT first_name,username FROM users WHERE user_id=?").bind(reporterId).first();
    const who=`${reporter?.first_name||"—"} ${reporter?.username?"@"+reporter.username:""} (<code>${reporterId}</code>)`;
    let extra="";
    if(targetKind==="channel"){const ch=await db.prepare("SELECT title,username,owner_id FROM channels WHERE id=?").bind(targetId).first();extra=`\n📢 کانال: ${ch?.title||"—"} (@${ch?.username||"—"})\n👤 مالک: <code>${ch?.owner_id||"—"}</code>`;}
    const catLabel=category==="technical"?"⚙️ فنی":"⚠️ محتوایی";
    await bale(env,"sendMessage",{chat_id:owner,text:`🚩 <b>گزارش جدید</b> [${catLabel}]\n👤 گزارش‌دهنده: ${who}${extra}\n📝 ${reason}\n📅 ${faDate(new Date().toISOString())} ${faTime(new Date().toISOString())}`,parse_mode:"HTML"});
    if(targetKind==="channel"&&category==="technical"){
      const techCount=await db.prepare("SELECT COUNT(*) c FROM reports WHERE target_kind='channel' AND target_id=? AND category='technical'").bind(targetId).first();
      if(techCount.c>=3){
        await db.prepare("UPDATE channels SET status='paused', violations=violations+1 WHERE id=?").bind(targetId).run();
        const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(targetId).first();
        if(ch?.owner_id)await bale(env,"sendMessage",{chat_id:ch.owner_id,text:`⚠️ کمپین «${ch.title}» به دلیل ۳ گزارش فنی موقتاً متوقف شد.\nلطفاً محتوا را بازبینی و اصلاح کنید.`,parse_mode:"HTML"});
        await bale(env,"sendMessage",{chat_id:owner,text:`⛔ کانال #${targetId} خودکار متوقف شد (۳ گزارش فنی).`,parse_mode:"HTML"});
      }
    }
  }
}

async function handleCb(q,env){const db=env.DB,uid=q.from.id,data=q.data;await answerCb(env,q.id);const edit=(t,rm)=>bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text:t,parse_mode:"HTML",...(rm?{reply_markup:rm}:{})});const setKB=rm=>bale(env,"editMessageReplyMarkup",{chat_id:q.message.chat.id,message_id:q.message.message_id,reply_markup:rm});const toggle=(a,v,m=5)=>{if(a.includes(v))a.splice(a.indexOf(v),1);else if(a.length<m)a.push(v);};
if(data==="noop")return;
if(data==="cancel"){await clearState(db,uid);return edit("❌ انصراف.");}
if(data==="disc")return showDiscover(q,env,0);
if(data.startsWith("next:"))return showDiscover(q,env,parseInt(data.slice(5)));

if(data.startsWith("quiz:")){const[,mId,idx]=data.split(":").map(Number);const m=await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();if(!m)return;const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();if(m.quiz_correct)return edit("✅ قبلاً پاسخ درست داده‌ای.");const opts=JSON.parse(ch.quiz_options||"[]");const tier=TIERS[ch.tier]||TIERS.standard;if(opts[idx]===ch.quiz_answer){await db.prepare("UPDATE memberships SET quiz_correct=1 WHERE id=?").bind(mId).run();await addQS(db,mId,40);const paid=await payAction(env,db,m,"QUIZ",tier.quiz,ch);return edit(`✅ درست! <b>+${faNum(paid)}</b> سکه\n📈 امتیاز کیفیت +۴۰`);}return edit("❌ اشتباه. پاداش کوییز پرداخت نشد.\n(عضویت و ماندگاری همچنان اعتبار دارند)");}

if(data.startsWith("report:")){
  const chId=data.slice(7);
  const existing=await db.prepare("SELECT 1 FROM reports WHERE reporter_id=? AND target_kind='channel' AND target_id=? LIMIT 1").bind(uid,chId).first();
  if(existing)return edit("⛔ قبلاً روی این کانال گزارش ثبت کرده‌ای.\nهر کاربر فقط یک بار می‌تواند گزارش بدهد.");
  await setState(db,uid,"REPORT_REASON",{channelId:chId});
  return edit("🚩 <b>نوع گزارش</b> را انتخاب کن:",{inline_keyboard:[...chunk(REPORT_TYPES.map(r=>({text:r.label,callback_data:`rtype:${chId}:${r.id}`})),1),[{text:"❌ انصراف",callback_data:"cancel"}]]});
}
if(data.startsWith("rtype:")){
  const st=await getState(db,uid);if(!st)return;
  const[,chId,rId]=data.split(":");
  const rt=REPORT_TYPES.find(r=>r.id===rId);if(!rt)return;
  await submitReport(env,db,uid,"channel",chId,rt.label,rt.cat);
  await clearState(db,uid);
  return edit(rt.cat==="technical"?"🚩 گزارش ثبت شد.\n⚙️ تیم فنی بررسی می‌کند.":"🚩 گزارش ثبت شد.\n⚠️ تیم محتوا بررسی می‌کند.");
}

if(data==="adm_menu"&&isAdmin(env,uid))return handleAdmin(env,uid);
if(data==="adm_users"&&isAdmin(env,uid))return handleAdminUsers(env,uid);
if(data==="adm_cams"&&isAdmin(env,uid))return handleAdminChannels(env,uid);
if(data==="adm_txs"&&isAdmin(env,uid))return handleAdminTxs(env,uid);
if(data==="adm_rpts"&&isAdmin(env,uid))return handleAdminReports(env,uid);
if(data==="adm_econ"&&isAdmin(env,uid))return handleAdminEconomy(env,uid);
if(data==="adm_eng"&&isAdmin(env,uid))return handleAdminEngage(env,uid);
if(data==="adm_quota"&&isAdmin(env,uid))return handleAdminQuota(env,uid);
if(data.startsWith("adm_pause:")&&isAdmin(env,uid)){await db.prepare("UPDATE channels SET status='paused' WHERE id=?").bind(parseInt(data.slice(10))).run();return handleAdminChannels(env,uid);}
if(data.startsWith("adm_resume:")&&isAdmin(env,uid)){await db.prepare("UPDATE channels SET status='active' WHERE id=?").bind(parseInt(data.slice(11))).run();return handleAdminChannels(env,uid);}
if(data.startsWith("adm_remove:")&&isAdmin(env,uid)){const id=parseInt(data.slice(11));await refundEscrow(env,db,id,"حذف توسط ادمین");await db.prepare("UPDATE channels SET status='removed' WHERE id=?").bind(id).run();return handleAdminChannels(env,uid);}
if(data.startsWith("adm_ban:")&&isAdmin(env,uid)){const t=data.slice(8);if(t===String(uid))return sendMsg(env,uid,"⛔ نمی‌توانی خودت را بن کنی!");await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason,category) VALUES (?,?,?,'بن ادمین','content')").bind(uid,"ban",t).run();return sendMsg(env,uid,`⛔ <code>${t}</code> مسدود شد.`);}
if(data.startsWith("adm_unban:")&&isAdmin(env,uid)){await db.prepare("DELETE FROM reports WHERE target_kind='ban' AND target_id=?").bind(data.slice(10)).run();return sendMsg(env,uid,"✅ از مسدودی خارج شد.");}
if(data.startsWith("adm_resolve:")&&isAdmin(env,uid)){const id=parseInt(data.slice(12));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما بررسی و رسیدگی شد.\nاز اینکه به کیفیت کشف کمک می‌کنی سپاسگزاریم 🌱");return handleAdminReports(env,uid);}
if(data.startsWith("adm_rpause:")&&isAdmin(env,uid)){const id=parseInt(data.slice(11));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();if(r&&r.target_kind==="channel"){await db.prepare("UPDATE channels SET status='paused' WHERE id=?").bind(r.target_id).run();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(r.target_id).first();if(ch?.owner_id)await notify(env,db,ch.owner_id,`⚠️ کمپین «${ch.title}» توسط ادمین موقتاً متوقف شد.`);}await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما رسیدگی شد و کانال مربوطه موقتاً متوقف شد.");return handleAdminReports(env,uid);}
if(data.startsWith("adm_rremove:")&&isAdmin(env,uid)){const id=parseInt(data.slice(12));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();if(r&&r.target_kind==="channel"){await refundEscrow(env,db,r.target_id,"حذف به دلیل گزارش");await db.prepare("UPDATE channels SET status='removed' WHERE id=?").bind(r.target_id).run();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(r.target_id).first();if(ch?.owner_id)await notify(env,db,ch.owner_id,`❌ کمپین «${ch.title}» به دلیل گزارش حذف شد.`);}await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما رسیدگی شد و کانال حذف شد.");return handleAdminReports(env,uid);}

if(data.startsWith("cat:")||data==="catback"||data.startsWith("sub:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.sel=d.sel||[];if(data==="catback")d.cat=null;else if(data.startsWith("cat:")){const c=CATEGORIES[parseInt(data.slice(4))];if(c.subs.length===1){toggle(d.sel,leaf(c.name,c.subs[0]));d.cat=null;}else d.cat=CATEGORIES.indexOf(c);}else{const[i,j]=data.slice(4).split(":").map(Number);toggle(d.sel,leaf(CATEGORIES[i].name,CATEGORIES[i].subs[j]));}await setState(db,uid,st.step,d);return setKB(interestsKB(d));}
if(data==="tags_done"){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const sel=d.sel||[];if(!sel.length)return edit("❌ حداقل یک زیرشاخه.");await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel),uid).run();let bonus="";const got=await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND note='welcome'").bind(uid).first();if(!got){const ok=await mintFromBudget(db,uid,WELCOME_BONUS);if(ok){await logTx(db,uid,"WELCOME",0,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,"welcome");bonus=`\n🎁 +${WELCOME_BONUS}`;}}await clearState(db,uid);await edit(`✅ علایق ثبت شد (${faNum(sel.length)})!${bonus}`);return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);}

if(data.startsWith("ccat:")||data==="ccatback"||data.startsWith("csub:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.csel=d.csel||[];if(data==="ccatback")d.ccat=null;else if(data.startsWith("ccat:")){const c=CATEGORIES[parseInt(data.slice(5))];if(c.subs.length===1){toggle(d.csel,leaf(c.name,c.subs[0]));d.ccat=null;}else d.ccat=CATEGORIES.indexOf(c);}else{const[i,j]=data.slice(5).split(":").map(Number);toggle(d.csel,leaf(CATEGORIES[i].name,CATEGORIES[i].subs[j]));}await setState(db,uid,st.step,d);return setKB(campTagsKB(d));}
if(data==="ctags_done"){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const sel=d.csel||[];if(!sel.length)return edit("❌ حداقل یک زیرشاخه.");d.tags=sel;await setState(db,uid,"CAMP_TIER",d);return edit(`✅ تگ‌ها: ${sel.join("، ")}\n\n🏷 <b>سطح کمپین</b> را انتخاب کن:`,tierKB());}
if(data.startsWith("tier:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.tier=data.slice(5);await setState(db,uid,st.step,d);if(d.tier==="premium"){await setState(db,uid,"CAMP_ANCHOR",d);return edit("🏆 سطح پریمیوم.\n\n🔗 <b>لینک پست مرجع</b> را بفرست:\n(پستی که کاربر از آن شروع به جستجو می‌کند)");}await setState(db,uid,"CAMP_TARGET",d);return edit(`✅ سطح: ${TIERS[d.tier].label}\nتعداد عضو هدف را بفرست (حداقل ۲۵):`);}

if(data==="camp_confirm"){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const x=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();if(x.balance<d.cost)return edit(`❌ کافی نیست.\nنیاز: <b>${d.cost}</b> | داری: <b>${x.balance}</b>`,{inline_keyboard:[[{text:"💎 خرید سکه",callback_data:"buy"}],[{text:"❌ انصراف",callback_data:"cancel"}]]});await db.prepare("UPDATE users SET balance=balance-? WHERE user_id=?").bind(d.cost,uid).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.cost).run();await db.prepare("INSERT INTO channels (owner_id,chat_id,username,chat_type,title,niches,budget_coins,target,bot_is_admin,status,tier,quiz_question,quiz_options,quiz_answer,anchor_post_link,post_distance) VALUES (?,?,?,?,?,?,?,?,1,'active',?,?,?,?,?,?)").bind(uid,d.chat.chat_id,d.chat.username,d.chat.type,d.chat.title,JSON.stringify(d.tags),d.cost,d.target,d.tier||"standard",d.quiz_question||null,d.quiz_options||null,d.quiz_answer||null,d.anchor_post_link||null,d.post_distance||null).run();await logTx(db,uid,"ESCROW",-d.cost,x.balance-d.cost,d.chat.username);await clearState(db,uid);await edit(`🚀 <b>کمپین زنده شد!</b>\n📢 ${d.chat.title}\n🏷 ${TIERS[d.tier||"standard"].label}\n\n💡 فقط برای اقدام تأییدشده از سپرده قفل‌شده کسر می‌شود.`);return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);}

if(data==="buy"){const e=await getEconomy(db);const p=currentPrice(e);return edit(`💎 <b>فروشگاه</b> (قیمت: ${faNum(Math.round(p))} ت)\nانتخاب کن:`,{inline_keyboard:PACKAGES.map(k=>[{text:`${k.label} — ${faNum(Math.floor(k.toman*0.8/p))} سکه | ${k.toman.toLocaleString("fa-IR")} ت`,callback_data:"buy:"+k.toman}])});}
if(data.startsWith("buy:")){const toman=parseInt(data.slice(4));const payload=`pay_${Date.now()}_${uid}`;await db.prepare("INSERT INTO payments (user_id,payload,amount_toman) VALUES (?,?,?)").bind(uid,payload,toman).run();await bale(env,"sendInvoice",{chat_id:uid,title:"خرید سکه کشف",description:`بسته ${toman.toLocaleString("fa-IR")} تومانی`,payload,provider_token:env.WALLET_TOKEN,prices:[{label:"مبلغ (ریال)",amount:toman*TOMAN_TO_RIAL}]});return;}

if(data==="stake_start"){await setState(db,uid,"STAKE_AMOUNT");return edit("🔒 چند سکه؟ (حداقل ۱۰)");}
if(data.startsWith("stake_period:")){const days=parseInt(data.split(":")[1]);const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const now=new Date();const unlock=new Date(now.getTime()+days*86400000).toISOString();await db.prepare("UPDATE users SET balance=balance-?, staked=staked+? WHERE user_id=?").bind(d.amount,d.amount,uid).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(d.amount).run();await db.prepare("INSERT INTO stakes (user_id,amount,start_at,unlock_at) VALUES (?,?,?,?)").bind(uid,d.amount,now.toISOString(),unlock).run();const tk=Math.min(Math.floor(d.amount/10),30);for(let i=0;i<tk;i++)await db.prepare("INSERT INTO lottery_tickets (user_id,source) VALUES (?,'stake')").bind(uid).run();await logTx(db,uid,"STAKE_LOCK",-d.amount,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);await clearState(db,uid);return edit(`🔒 ${faNum(d.amount)} سکه / ${faNum(days)} روز قفل شد.\n🎰 +${faNum(tk)} بلیت\n🗓 آزادسازی: ${faDate(unlock)}`);}
if(data==="stake_unlock"){const rows=(await db.prepare("SELECT * FROM stakes WHERE user_id=? AND status='active'").bind(uid).all()).results;const now=Date.now();let msg="";for(const s of rows){if(new Date(s.unlock_at).getTime()<=now){const days=Math.floor((now-new Date(s.start_at).getTime())/86400000);const y=await mintFromBudget(db,uid,Math.floor(s.amount*STAKE_DAILY_RATE*days));await db.prepare("UPDATE users SET staked=staked-? WHERE user_id=?").bind(s.amount,uid).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(s.amount).run();await db.prepare("UPDATE stakes SET status='unlocked' WHERE id=?").bind(s.id).run();await logTx(db,uid,"STAKE_UNLOCK",s.amount,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);msg+=`✅ ${faNum(s.amount)} آزاد +${faNum(y||0)}\n`;}else msg+=`⏳ تا ${faDate(s.unlock_at)} فعال\n`;}return edit(msg||"❌ استیکی نداری.");}
if(data==="stake_report"){const rows=(await db.prepare("SELECT * FROM stakes WHERE user_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("❌ استیکی نداری.");return edit(`📊 <b>گزارش استیک</b>\n\n${rows.map(s=>`${s.status==="active"?"🟢":""} ${faNum(s.amount)} | ${faDate(s.start_at)} → ${faDate(s.unlock_at)}`).join("\n──────────\n")}`);}
if(data==="tickets"){const c=await db.prepare("SELECT COUNT(*) c FROM lottery_tickets WHERE user_id=?").bind(uid).first();return edit(`🎰 بلیت‌ها: <b>${faNum(c.c)}</b>`);}
if(data==="edit_interests"){const x=await db.prepare("SELECT interests FROM users WHERE user_id=?").bind(uid).first();const sel=JSON.parse(x.interests||"[]");await setState(db,uid,"INTERESTS",{sel,cat:null});return edit("🎨 بازبینی کن:",interestsKB({sel,cat:null}));}
if(data==="invitelink"){const x=await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();return sendMsg(env,uid,`🔗 https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}\n🎁 هر دوست = +۱۵`);}
if(data==="refs"){const t=await db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").bind(uid).first();const rows=(await db.prepare("SELECT first_name,created_at FROM users WHERE referred_by=? ORDER BY created_at DESC LIMIT 10").bind(uid).all()).results;const x=await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();return edit(`👥 کل: <b>${faNum(t.c)}</b>\n\n${rows.length?rows.map((r,i)=>`${faNum(i+1)}. ${r.first_name||"—"} - ${faDate(r.created_at)}`).join("\n"):"هنوز کسی نیست"}\n\n🔗 <code>https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}</code>`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});}

if(data==="mycams"){const rows=(await db.prepare("SELECT * FROM channels WHERE owner_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("❌ کمپینی نداری.");const list=[];const kb=[];for(const ch of rows){const g=await channelGrade(db,ch.id);const remain=Math.max(ch.target-ch.acquired,0);const pct=ch.target?Math.min(Math.round(ch.acquired/ch.target*100),100):0;list.push(`🏆${g.g} ${ch.status==="active"?"🟢":ch.status==="paused"?"🟡":""} <b>${ch.title}</b>\n📊 ${faNum(ch.acquired)}/${faNum(ch.target)} | باقی ${faNum(remain)} | ${faNum(pct)}٪\n💰 سپرده قفل‌شده: ${faNum(ch.budget_coins)} | QS: ${faNum(Math.round(g.a))}`);kb.push([{text:`👥 اعضای #${ch.id}`,callback_data:`cam_members:${ch.id}`}]);}kb.push([{text:"🔙 بازگشت",callback_data:"profile_back"}]);return edit(`📋 <b>کمپین‌های تو</b>\n\n${list.join("\n──────────\n")}`,{inline_keyboard:kb});}

if(data.startsWith("cam_members:")){
  const chId=parseInt(data.slice(12));
  const ch=await db.prepare("SELECT * FROM channels WHERE id=? AND owner_id=?").bind(chId,uid).first();
  if(!ch)return edit("❌ دسترسی ندارید.");
  const rows=(await db.prepare("SELECT m.*, u.first_name, u.username FROM memberships m JOIN users u ON m.user_id=u.user_id WHERE m.channel_id=? ORDER BY m.id DESC LIMIT 15").bind(chId).all()).results;
  if(!rows.length)return edit(`📋 <b>اعضای ${ch.title}</b>\n\nهنوز عضوی ثبت نشده.`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"mycams"}]]});
  const statusIcon=s=>({assigned:"🔘",joined:"⏳",rewarded:"✅",penalized:"⛔"}[s]||"—");
  const list=rows.map((r,i)=>`${faNum(i+1)}. <b>${r.first_name||"—"}</b> ${r.username?"@"+r.username:""}\n${statusIcon(r.status)} | QS: ${faNum(r.quality_score)} | ${faDate(r.joined_at||r.created_at)}`).join("\n──────────\n");
  return edit(`📋 <b>اعضای ${ch.title}</b>\n👥 کل: ${faNum(rows.length)} نفر\n\n${list}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"mycams"}]]});
}

if(data==="myacts"){
  const rows=(await db.prepare("SELECT m.*, c.title, c.username, c.tier FROM memberships m JOIN channels c ON m.channel_id=c.id WHERE m.user_id=? ORDER BY m.id DESC LIMIT 10").bind(uid).all()).results;
  if(!rows.length)return edit("📒 <b>فعالیت‌های من</b>\n\nهنوز تسکی انجام نداده‌ای.\nاز «🌟 کشف کانال» شروع کن!",{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});
  const statusLabel=s=>({assigned:"🔘 شروع نشده",joined:"⏳ در انتظار تأیید ۴۸h",rewarded:"✅ تأیید شده",penalized:"⛔ جریمه"}[s]||s);
  const list=rows.map(r=>{const parts=[];if(r.status==="rewarded"||r.status==="joined")parts.push("عضویت");if(r.forward_verified)parts.push("فوروارد");if(r.quiz_correct)parts.push("کوییز");if(r.retention30_verified)parts.push("ماندگاری۳۰");const tier=TIERS[r.tier]||TIERS.standard;let earned=0;if(r.status==="rewarded")earned+=tier.join;if(r.forward_verified)earned+=tier.forward;if(r.quiz_correct)earned+=tier.quiz;if(r.retention30_verified)earned+=tier.ret30;return`📢 <b>${r.title}</b> @${r.username}\n${statusLabel(r.status)}\n✓ ${parts.join(" | ")||"—"}\n🪙 کسب‌شده: <b>${faNum(earned)}</b> سکه | QS: ${faNum(r.quality_score)}\n📅 ${faDate(r.joined_at||r.created_at)}`;}).join("\n──────────\n");
  const totals=await db.prepare("SELECT SUM(quality_score) qs, COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();
  return edit(`📒 <b>فعالیت‌های من</b>\n\n${list}\n\n📊 <b>جمع کل</b>\n🎫 تسک‌های موفق: ${faNum(totals.c)}\n🏆 مجموع QS: ${faNum(totals.qs||0)}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});
}

if(data==="mytxs"){
  const x=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
  const rows=(await db.prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 15").bind(uid).all()).results;
  const txLabel={BUDGET_MINT:"🎁 پاداش سیستم",PURCHASE_MINT:"💎 خرید",TASK_JOIN:"🎯 پاداش عضویت",TASK_FORWARD:"📤 پاداش فوروارد",TASK_QUIZ:"❓ پاداش کوییز",TASK_RET30:"🏅 پاداش ماندگاری۳۰",ESCROW:"🔒 قفل کمپین",ESCROW_REFUND:"💰 بازگشت سپرده",STAKE_LOCK:"🔒 قفل استیک",STAKE_UNLOCK:"🔓 آزادسازی استیک",WELCOME:"🎁 خوش‌آمد",MISSION_CLUB:"🎯 مأموریت کانال مرکزی"};
  const head=`🪙 <b>موجودی فعلی: ${faNum(x.balance)} سکه</b>\n──────────\n`;
  if(!rows.length)return edit(`💰 <b>جزئیات سکه‌های من</b>\n\n${head}هنوز تراکنشی نداری.`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});
  const list=rows.map(t=>{const label=txLabel[t.type]||t.type;const sign=t.amount>=0?"+":"";return`${label}\n${sign}${faNum(t.amount)} → موجودی ${faNum(t.balance_after)}\n📝 ${t.note||"—"} | ${faDate(t.created_at)} ${faTime(t.created_at)}`;}).join("\n──────────\n");
  return edit(`💰 <b>جزئیات سکه‌های من</b>\n\n${head}${list}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});
}

if(data==="profile_back"){return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);}
if(data==="support_start"){await setState(db,uid,"SUPPORT_MSG");return edit("📨 پیام را بنویس:");}

if(data==="claim_club"){const got=await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND type='MISSION_CLUB'").bind(uid).first();if(got)return edit("✅ قبلاً این مأموریت را گرفته‌ای.\nاین مأموریت یک‌بارمصرف است.");const res=await bale(env,"getChatMember",{chat_id:env.CLUB_CHANNEL,user_id:uid});if(!["member","creator","administrator"].includes(res.result?.status))return edit("❌ هنوز عضو کانال مرکزی نشده‌ای!");const ok=await mintFromBudget(db,uid,5);if(ok)await logTx(db,uid,"MISSION_CLUB",5,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance);return edit(ok?"🎉 <b>+۵ سکه</b> (یک‌بار برای هر کاربر)":"💸 بودجه مأموریت خالی است. بعداً دوباره امتحان کن.");}

if(data.startsWith("mission:")){const chId=parseInt(data.slice(8));const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();if(!ch)return edit("❌");const tier=TIERS[ch.tier]||TIERS.standard;if(ch.budget_coins<tier.join)return edit("⚠️ بودجه کمپین تمام شده.");if(ch.owner_id===uid)return edit("⛔ نمی‌توانی عضو کانال خودت شوی.");const m=await db.prepare("SELECT * FROM memberships WHERE user_id=? AND channel_id=?").bind(uid,chId).first();if(m&&m.status==="assigned")return edit("🔘 قبلاً شروع کرده‌ای. «✅ عضو شدم» را بزن.");if(m&&m.status==="joined")return edit("⏳ در انتظار تأیید ۴۸h.");if(m&&m.status==="rewarded")return edit("✅ پاداش گرفته‌ای. «بعدی» را بزن.");const r=await db.prepare("INSERT INTO memberships (user_id,channel_id,status) VALUES (?,?,'assigned')").bind(uid,chId).run();return edit(`📢 عضو شو: <b>@${ch.username}</b>\n🏷 ${tier.label}`,{inline_keyboard:[[{text:"✅ عضو شدم",callback_data:"joined:"+r.meta.last_row_id},{text:"🚩 گزارش",callback_data:"report:"+chId}]]});}

if(data.startsWith("joined:")){const mId=parseInt(data.slice(7));const m=await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();const res=await bale(env,"getChatMember",{chat_id:"@"+ch.username,user_id:uid});if(!["member","creator","administrator"].includes(res.result?.status))return edit("❌ عضو نشده‌ای!",{inline_keyboard:[[{text:"🔄 بررسی",callback_data:"joined:"+mId}]]});const now=new Date(),check=new Date(now.getTime()+RETENTION_HOURS*3600*1000).toISOString();await db.prepare("UPDATE memberships SET status='joined', joined_at=?, check_at=? WHERE id=?").bind(now.toISOString(),check,mId).run();
const tier=TIERS[ch.tier]||TIERS.standard;
if(tier.quiz&&ch.quiz_question){const opts=JSON.parse(ch.quiz_options||"[]");await sendMsg(env,uid,`❓ <b>کوییز مکان‌محور</b> (+${faNum(tier.quiz)} سکه)\n\n🔗 پست مرجع:\n${ch.anchor_post_link||"لینک در کانال"}\n\n📍 جستجو: پست ${faNum(ch.post_distance||3)}ام بعد از پست مرجع\n\n${ch.quiz_question}`,{inline_keyboard:opts.map((o,i)=>[{text:o,callback_data:`quiz:${mId}:${i}`}])});}
if(tier.forward){await sendMsg(env,uid,`📤 <b>تسک فوروارد</b> (+${faNum(tier.forward)} سکه)\n\n۱) کانال <b>@${ch.username}</b> را باز کن\n۲) یکی از پست‌ها را انتخاب کن\n۳) همان پست را به <b>همین بات (پیوی کشف)</b> فوروارد کن\n\n✅ فوروارد به‌صورت خودکار تأیید و پاداش داده می‌شود.`,{inline_keyboard:[[{text:"📢 باز کردن کانال",url:`https://ble.ir/${ch.username}`}]]});}
return edit(`✅ عضویت ثبت شد!\n⏳ تأیید ماندگاری تا ${faDate(check)}\n\n🎁 تسک‌های پاداش کامل به پیوی‌ات آمد: کوییز + فوروارد.`);}}

async function showDiscover(q,env,idx){const db=env.DB,uid=q.from.id;const u=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();const my=JSON.parse(u.interests||"[]");const all=(await db.prepare("SELECT * FROM channels WHERE status IN ('active','paused') AND bot_is_admin=1").all()).results;if(!all.length)return bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text:"😴 کمپین فعالی نیست.",parse_mode:"HTML"});
const scored=[];for(const c of scored0(all,my)){scored.push(c);}
const list=scored;
const pos=((idx%list.length)+list.length)%list.length;const{c:ch,hit,w}=list[pos];const isMatch=hit>0;const overlap=Math.round(hit/Math.max(my.length,1)*100);const g=await channelGrade(db,ch.id);const tier=TIERS[ch.tier]||TIERS.standard;
const m=await db.prepare("SELECT status FROM memberships WHERE user_id=? AND channel_id=?").bind(uid,ch.id).first();
const badge=m?({joined:"\n⏳ در انتظار تأیید",rewarded:"\n✅ انجام شد",assigned:"\n🔘 شروع نشده",penalized:"\n⛔ جریمه شد"}[m.status]||""):"";
await bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text:`🌟 <b>${ch.title}</b> <i>(${faNum(pos+1)}/${faNum(list.length)})</i>\n${isMatch?`🎯 تشابه ${faNum(overlap)}٪`:"🌐 عمومی"} | 🏆 رتبه ${g.g} | 🏷 ${tier.max} سکه${badge}`,parse_mode:"HTML",reply_markup:{inline_keyboard:[[{text:"🚀 شروع مأموریت",callback_data:"mission:"+ch.id}],[{text:"⏭ بعدی",callback_data:"next:"+(pos+1)},{text:"🚩 گزارش",callback_data:"report:"+ch.id}]]}});}
function scored0(all,my){const arr=all.map(c=>({c,hit:JSON.parse(c.niches||"[]").filter(t=>my.includes(t)).length}));const matched=arr.filter(x=>x.hit>0);const others=arr.filter(x=>x.hit===0);return[...matched,...others].map(x=>({...x,w:x.hit>0?2:1})).sort((a,b)=>b.w-a.w||b.hit-a.hit);}

async function handleForward(u,env,fwdUser){const db=env.DB,uid=u.message.from.id;const m=await db.prepare("SELECT * FROM memberships WHERE user_id=? AND forward_verified=0 AND status IN ('joined','rewarded') ORDER BY id DESC LIMIT 1").bind(uid).first();if(!m)return false;const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();if(!ch||ch.username!==fwdUser)return false;const tier=TIERS[ch.tier]||TIERS.standard;if(tier.forward<=0)return false;await db.prepare("UPDATE memberships SET forward_verified=1 WHERE id=?").bind(m.id).run();await addQS(db,m.id,20);const paid=await payAction(env,db,m,"FORWARD",tier.forward,ch);await sendMsg(env,uid,`✅ فوروارد تأیید شد! <b>+${faNum(paid)}</b> سکه\n📈 امتیاز کیفیت +۲۰`);return true;}

async function handlePayment(u,env){const db=env.DB;const sp=u.message.successful_payment;const pay=await db.prepare("SELECT * FROM payments WHERE payload=?").bind(sp.invoice_payload).first();if(!pay||pay.status==="paid")return;const toman=sp.total_amount/TOMAN_TO_RIAL;const coins=await mintPurchase(db,u.message.from.id,toman);await db.prepare("UPDATE payments SET status='paid', coins_granted=?, bale_transaction_id=? WHERE payload=?").bind(coins,sp.provider_payment_charge_id||"",sp.invoice_payload).run();await sendMsg(env,u.message.from.id,`💎 خرید موفق! +<b>${faNum(coins)}</b> سکه`,MAIN_KB);}

async function handleAdmin(env,uid){const db=env.DB;const users=await db.prepare("SELECT COUNT(*) c FROM users").first();const act=await db.prepare("SELECT COUNT(*) c FROM channels WHERE status='active'").first();const e=await getEconomy(db);return sendMsg(env,uid,`🛡 <b>پنل ادمین</b>\n👥 کاربران: ${faNum(users.c)}\n📢 فعال: ${faNum(act.c)}\n💰 پشتوانه: ${faNum(Math.round(e.pool_value))} ت\n💎 قیمت: ${faNum(Math.round(currentPrice(e)))} ت`,{inline_keyboard:[[{text:"👥 کاربران",callback_data:"adm_users"},{text:"📢 کمپین‌ها",callback_data:"adm_cams"}],[{text:"📈 کیفیت کمپین‌ها",callback_data:"adm_eng"},{text:"💳 تراکنش‌ها",callback_data:"adm_txs"}],[{text:"🚩 گزارش‌ها",callback_data:"adm_rpts"},{text:"💰 اقتصاد",callback_data:"adm_econ"}],[{text:"📊 سهمیه مصرف",callback_data:"adm_quota"},{text:"🔄 تازه‌سازی",callback_data:"adm_menu"}]]});}
async function handleAdminUsers(env,uid){const db=env.DB;const rows=(await db.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT 15").all()).results;const owner=parseInt(env.OWNER_ID||"0");return sendMsg(env,uid,`👥 <b>۱۵ کاربر آخر</b>\n\n${rows.map((u,i)=>`${faNum(i+1)}. <b>${u.first_name||"—"}</b>\n🆔<code>${u.user_id}</code> 🪙${faNum(u.balance)} 🛡${faNum(u.trust_score)}`).join("\n──────────\n")}`,{inline_keyboard:rows.filter(u=>u.user_id!==owner).map(u=>[{text:`⛔ ${u.first_name||u.user_id}`,callback_data:"adm_ban:"+u.user_id}]).concat([[{text:"🔙 بازگشت",callback_data:"adm_menu"}]])});}
async function handleAdminChannels(env,uid){const db=env.DB;const rows=(await db.prepare("SELECT * FROM channels ORDER BY id DESC LIMIT 15").all()).results;const list=[];for(const ch of rows){const g=await channelGrade(db,ch.id);list.push(`${ch.status==="active"?"🟢":ch.status==="paused"?"🟡":""}#${faNum(ch.id)} 🏆${g.g} <b>${ch.title}</b>\n📊${faNum(ch.acquired)}/${faNum(ch.target)} 💰${faNum(ch.budget_coins)}`);}return sendMsg(env,uid,`📢 <b>کمپین‌ها</b>\n\n${list.join("\n──────────\n")}`,{inline_keyboard:rows.filter(c=>c.status!=="removed").flatMap(ch=>{const r=[];if(ch.status==="active")r.push({text:`⏸${ch.id}`,callback_data:"adm_pause:"+ch.id});if(ch.status==="paused")r.push({text:`▶${ch.id}`,callback_data:"adm_resume:"+ch.id});r.push({text:`❌${ch.id}`,callback_data:"adm_remove:"+ch.id});return[r];}).concat([[{text:"🔙 بازگشت",callback_data:"adm_menu"}]])});}
async function handleAdminEngage(env,uid){const db=env.DB;const rows=(await db.prepare("SELECT * FROM channels ORDER BY id DESC LIMIT 10").all()).results;const list=[];for(const ch of rows){const s=await db.prepare("SELECT COUNT(*) c, SUM(forward_verified) f, SUM(quiz_correct) q, AVG(quality_score) a FROM memberships WHERE channel_id=? AND status='rewarded'").bind(ch.id).first();const g=await channelGrade(db,ch.id);list.push(`🏆${g.g} <b>${ch.title}</b>\n👥${faNum(s.c)} | 📤فوروارد ${faNum(s.f||0)} | ❓کوییز ${faNum(s.q||0)}\n📈 QS میانگین: ${faNum(Math.round(s.a||0))}`);}return sendMsg(env,uid,`📈 <b>کیفیت کمپین‌ها</b>\n<i>نشان می‌دهد اعضای هر کمپین چقدر «فعال» بوده‌اند: فوروارد پست، پاسخ کوییز و میانگین امتیاز کیفیت (QS). هرچه بالاتر، یعنی مخاطب واقعی‌تر و رتبه بهتر.</i>\n\n${list.join("\n──────────\n")||"داده‌ای نیست"}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"adm_menu"}]]});}
async function handleAdminTxs(env,uid){const db=env.DB;const rows=(await db.prepare("SELECT * FROM transactions ORDER BY id DESC LIMIT 20").all()).results;return sendMsg(env,uid,`💳 <b>۲۰ تراکنش آخر</b>\n\n${rows.map(t=>`#${faNum(t.id)} ${t.type} <code>${t.user_id}</code>\n${faNum(t.amount)}→${faNum(t.balance_after)}`).join("\n──────────\n")}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"adm_menu"}]]});}
async function handleAdminReports(env,uid){const db=env.DB;const rows=(await db.prepare("SELECT * FROM reports WHERE target_kind!='ban' ORDER BY id DESC LIMIT 15").all()).results;if(!rows.length)return sendMsg(env,uid,"✅ گزارشی نیست.",{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"adm_menu"}]]});const catIcon=c=>c==="technical"?"⚙️":"⚠️";return sendMsg(env,uid,`🚩 <b>گزارش‌ها</b>\n<i>✅ حل = رسیدگی و اطلاع به کاربر | ⏸ = توقف کانال | ❌ = حذف کانال</i>\n\n${rows.map(r=>`${catIcon(r.category||"content")}#${faNum(r.id)} ${r.target_kind}#${r.target_id}\n👤${r.reporter_id} 📝${r.reason}\n📅${faDate(r.created_at)}`).join("\n──────────\n")}`,{inline_keyboard:rows.filter(r=>r.status==="open").map(r=>[{text:`✅ حل #${r.id}`,callback_data:"adm_resolve:"+r.id},{text:`⏸ #${r.id}`,callback_data:"adm_rpause:"+r.id},{text:`❌ #${r.id}`,callback_data:"adm_rremove:"+r.id}]).concat([[{text:"🔙 بازگشت",callback_data:"adm_menu"}]])});}
async function handleAdminEconomy(env,uid){const db=env.DB;const e=await getEconomy(db);const esc=await db.prepare("SELECT COALESCE(SUM(budget_coins),0) s FROM channels WHERE status='active'").first();const stk=await db.prepare("SELECT COALESCE(SUM(amount),0) s FROM stakes WHERE status='active'").first();return sendMsg(env,uid,`💰 پشتوانه ${faNum(Math.round(e.pool_value))} | کارمزد ${faNum(Math.round(e.weekly_commission))} | بودجه پاداش ${faNum(Math.round(e.reward_budget))}\nضرب ${faNum(e.total_minted)} سوخت ${faNum(e.total_burned)} قفل ${faNum(e.total_locked)} گردش ${faNum(circulating(e))}\nسپرده قفل‌شده ${faNum(esc.s)} استیک ${faNum(stk.s)}\n💎 ${faNum(Math.round(currentPrice(e)))} ت`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"adm_menu"}]]});}
async function handleAdminQuota(env,uid){const db=env.DB;const date=new Date().toISOString().slice(0,10);const q=await db.prepare("SELECT requests FROM quota WHERE date=?").bind(date).first();const req=q?.requests||0;
const tables=["users","channels","memberships","transactions","reports","stakes","lottery_tickets"];const counts={};let total=0;for(const t of tables){const r=await db.prepare(`SELECT COUNT(*) c FROM ${t}`).first();counts[t]=r.c;total+=r.c;}
return sendMsg(env,uid,`📊 <b>گزارش مصرف و سهمیه</b>\n📅 ${faDate(new Date().toISOString())}\n\n🌐 درخواست‌های امروز: <b>${faNum(req)}</b> / ${faNum(REQ_LIMIT)}\n✅ مانده: <b>${faNum(Math.max(REQ_LIMIT-req,0))}</b>\n\n🗄 حجم دیتابیس: <b>${faNum(total)}</b> رکورد\n👥 کاربران ${faNum(counts.users)} | 📢 کمپین ${faNum(counts.channels)}\n🎫 تسک ${faNum(counts.memberships)} | 💳 تراکنش ${faNum(counts.transactions)}\n🚩 گزارش ${faNum(counts.reports)} | 🔒 استیک ${faNum(counts.stakes)} | 🎰 بلیت ${faNum(counts.lottery_tickets)}\n\n💾 ظرفیت D1 طرح رایگان: ۵ گیگابایت`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"adm_menu"}]]});}

async function runCron(env){const db=env.DB,now=new Date().toISOString();
const e=await getEconomy(db);const refuel=Math.floor(e.weekly_commission*0.1);if(refuel>0)await db.prepare("UPDATE economy_state SET reward_budget=reward_budget+?, weekly_commission=weekly_commission-? WHERE id=1").bind(refuel,refuel).run();
const due=(await db.prepare("SELECT * FROM memberships WHERE status='joined' AND check_at<=?").bind(now).all()).results;
for(const m of due){const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();if(!ch)continue;if(await isBanned(db,m.user_id))continue;const tier=TIERS[ch.tier]||TIERS.standard;const res=await bale(env,"getChatMember",{chat_id:"@"+ch.username,user_id:m.user_id});
if(["member","creator","administrator"].includes(res.result?.status)){await db.prepare("UPDATE memberships SET status='rewarded' WHERE id=?").bind(m.id).run();await addQS(db,m.id,20);const paid=await payAction(env,db,m,"JOIN",tier.join,ch);await db.prepare("UPDATE users SET trust_score=MIN(100,trust_score+5), total_tasks=total_tasks+1 WHERE user_id=?").bind(m.user_id).run();
if(tier.ret30)await db.prepare("UPDATE memberships SET guarantee_until=? WHERE id=?").bind(new Date(Date.now()+30*86400000).toISOString(),m.id).run();
// v13.2: پیام کاربر با نام کانال + اعلان جدا به ادمین
await bale(env,"sendMessage",{chat_id:m.user_id,text:`🎉 ماندگاری ۴۸ ساعته تأیید شد! +${faNum(paid)} سکه\n📢 کانال: @${ch.username}`,parse_mode:"HTML"});
await notifyOwner(env,`📥 تأیید ماندگاری: کاربر <code>${m.user_id}</code>\n📢 @${ch.username} | +${faNum(paid)} سکه پرداخت شد`);}
else{await db.prepare("UPDATE memberships SET status='penalized' WHERE id=?").bind(m.id).run();await db.prepare("UPDATE users SET balance=MAX(0,balance-?), trust_score=MAX(0,trust_score-10) WHERE user_id=?").bind(PENALTY_COINS,m.user_id).run();await bale(env,"sendMessage",{chat_id:m.user_id,text:`⚠️ خروج زودهنگام: −${PENALTY_COINS}`,parse_mode:"HTML"});}}
const g30=(await db.prepare("SELECT * FROM memberships WHERE guarantee_until IS NOT NULL AND guarantee_until<=? AND retention30_verified=0 AND status='rewarded'").bind(now).all()).results;
for(const m of g30){const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();if(!ch)continue;const tier=TIERS[ch.tier]||TIERS.standard;const res=await bale(env,"getChatMember",{chat_id:"@"+ch.username,user_id:m.user_id});
if(["member","creator","administrator"].includes(res.result?.status)){await db.prepare("UPDATE memberships SET retention30_verified=1 WHERE id=?").bind(m.id).run();await addQS(db,m.id,20);const paid=await payAction(env,db,m,"RET30",tier.ret30,ch);
await bale(env,"sendMessage",{chat_id:m.user_id,text:`🏅 ماندگاری ۳۰ روزه تأیید شد! +${faNum(paid)} سکه\n📢 کانال: @${ch.username}`,parse_mode:"HTML"});
await notifyOwner(env,`📥 تأیید ماندگاری ۳۰ روزه: کاربر <code>${m.user_id}</code>\n📢 @${ch.username} | +${faNum(paid)} سکه`);}
else{await db.prepare("UPDATE memberships SET retention30_verified=0, status='penalized' WHERE id=?").bind(m.id).run();await db.prepare("UPDATE users SET balance=MAX(0,balance-?) WHERE user_id=?").bind(tier.join,m.user_id).run();await bale(env,"sendMessage",{chat_id:ch.owner_id,text:`💰 بازپرداخت تضمین: کاربر قبل از ۳۰ روز خارج شد (${faNum(tier.join)} سکه کسر و به شما برگشت).`,parse_mode:"HTML"});}}
const me=await bale(env,"getMe");const actives=(await db.prepare("SELECT * FROM channels WHERE status='active'").all()).results;
for(const ch of actives){const adm=await bale(env,"getChatAdministrators",{chat_id:"@"+ch.username});if(!(adm.result||[]).some(a=>a.user?.id===me.result?.id)){const v=ch.violations+1,st=v>=3?"removed":"paused";await db.prepare("UPDATE channels SET violations=?, status=?, bot_is_admin=0 WHERE id=?").bind(v,st,ch.id).run();if(v>=3){await refundEscrow(env,db,ch.id,"حذف دائم");if(ch.owner_id)await bale(env,"sendMessage",{chat_id:ch.owner_id,text:"❌ کمپین حذف دائم شد. سپرده برگشت."});}else if(ch.owner_id)await bale(env,"sendMessage",{chat_id:ch.owner_id,text:"⚠️ ربات ادمین نیست؛ کمپین متوقف شد."});}}}

export default{async fetch(req,env,ctx){const url=new URL(req.url);if(req.method==="POST"&&url.pathname==="/webhook"){const update=await req.json();ctx.waitUntil(trackQuota(env));ctx.waitUntil(route(update,env));return new Response("ok");}if(url.pathname==="/health")return new Response("🌱 KashfBot v13.2 alive");return new Response("Not Found",{status:404});},async scheduled(_e,env,ctx){ctx.waitUntil(runCron(env));}};

async function route(u,env){
if(u.pre_checkout_query)return bale(env,"answerPreCheckoutQuery",{pre_checkout_query_id:u.pre_checkout_query.id,ok:true});
if(u.message?.successful_payment)return handlePayment(u,env);
if(u.message?.text?.startsWith("/start"))return handleStart(u,env);
if(u.message&&(u.message.forward_from_chat||u.message.forward_from)){const f=u.message.forward_from_chat||u.message.forward_from;if(f?.username){if(await handleForward(u,env,f.username))return;}}
if(u.message?.text==="/draw"&&isAdmin(env,u.message.from.id)){const db=env.DB;const t=(await db.prepare("SELECT * FROM lottery_tickets WHERE draw_id IS NULL").all()).results;if(!t.length)return sendMsg(env,u.message.from.id,"❌ بلیطی نیست.");const w=t[Math.floor(Math.random()*t.length)];const r=await db.prepare("INSERT INTO draws (period,prize_title,status,winner_id,draw_at) VALUES ('manual','قرعه‌کشی','completed',?,datetime('now'))").bind(w.user_id).run();await db.prepare("UPDATE lottery_tickets SET draw_id=? WHERE draw_id IS NULL").bind(r.meta.last_row_id).run();await bale(env,"sendMessage",{chat_id:w.user_id,text:"🏆 تبریک! برنده شدی! 🎉"});return sendMsg(env,u.message.from.id,`🏆 برنده: <code>${w.user_id}</code>`);}
if(u.message?.text==="/admin"&&isAdmin(env,u.message.from.id))return handleAdmin(env,u.message.from.id);
if(u.message?.text==="/users"&&isAdmin(env,u.message.from.id))return handleAdminUsers(env,u.message.from.id);
if(u.message?.text==="/channels"&&isAdmin(env,u.message.from.id))return handleAdminChannels(env,u.message.from.id);
if(u.message?.text==="/engage"&&isAdmin(env,u.message.from.id))return handleAdminEngage(env,u.message.from.id);
if(u.message?.text==="/txs"&&isAdmin(env,u.message.from.id))return handleAdminTxs(env,u.message.from.id);
if(u.message?.text==="/reports"&&isAdmin(env,u.message.from.id))return handleAdminReports(env,u.message.from.id);
if(u.callback_query)return handleCb(u.callback_query,env);
if(u.message?.text){if(await isBanned(env.DB,u.message.from.id))return;const t=u.message.text;const MENU=["🌟 کشف کانال، گروه و ربات","📢 ثبت کمپین رشد","🎯 مأموریت‌های امروز","👤 پروفایل من","❓ راهنما و پشتیبانی"];if(MENU.includes(t)){await clearState(env.DB,u.message.from.id);return handleMenu(u,env);}const st=await getState(env.DB,u.message.from.id);if(st)return handleStateText(u,env,st);return handleMenu(u,env);}}