// ═══════════════════════════════════════════
// 🌱 KashfBot v14.4 — Full Clean Build
// ═══════════════════════════════════════════
const BOT_NAME = "کشف", CLUB_CHANNEL = "@Kashf Club";
const BOT_USERNAME = "kashfbot";
const BASE_PRICE = 100, COMMISSION_RATE = 0.2, RETENTION_HOURS = 48;
const WELCOME_BONUS = 10, PENALTY_COINS = 8;
const COST_PER_MEMBER = 4, MIN_CAMPAIGN = 25, TOMAN_TO_RIAL = 10;
const STAKE_DAILY_RATE = 0.005;
const REQ_LIMIT = 100000;
const QUIZ_MAX_ATTEMPTS = 2;
const MAX_REFERRALS = 10; // 🔒 Fix #3: سقف رفرال

const TIERS = {
  standard:   { join:1, forward:0, quiz:0, ret30:0, max:1, label:"استاندارد (۱ سکه/عضو)" },
  guaranteed: { join:1, forward:0, quiz:0, ret30:1, max:2, label:"تضمینی (۲ سکه/عضو)" },
  premium:    { join:1, forward:1, quiz:2, ret30:1, max:5, label:"پریمیوم (۵ سکه/عضو)" },
};
const MTYPES = [
  { id:"club", label:"📢 عضویت کانال مرکزی" },
  { id:"task", label:"🎯 انجام تسک کشف" },
  { id:"referral", label:"👥 دعوت دوست" },
  { id:"stake", label:"🔒 استیک سکه" },
];
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
  { name:"خدمات کسب و کار", emoji:"💼", subs:["مشاوره کسب و کار","املاک و عمرانی","خدمات مالی و بیمه","سایر"] },
  { name:"فروشگاهی", emoji:"🛍️", subs:["آرایشی و بهداشتی","آموزشی","اسباب بازی و عروسک","پوشاک","پوشاک آقایان","پوشاک بانوان","پوشاک خانواده","پوشاک کودک و نوجوان","خانه و آشپزخانه","خوراکی و مواد غذایی","شال و روسری","فرهنگی و هنری","کتاب و لوازم تحریر","کالای دیجیتال","کیف و کفش","لوازم شخصی","سایر"] },
  { name:"آموزشی", emoji:"🎓", subs:["زبان‌های خارجی","کنکور","مدرسه","برنامه نویسی","محتوای آموزشی","سایر"] },
  { name:"سرگرمی", emoji:"🎭", subs:["سرگرمی"] },
  { name:"سلامت و زیبایی", emoji:"💄", subs:["سلامت و زیبایی"] },
  { name:"خانه و آشپزخانه", emoji:"🏠", subs:["خانه و آشپزخانه"] },
  { name:"تربیت و روانشناسی", emoji:"🧠", subs:["تربیت و روانشناسی"] },
  { name:"خیریه و مسئولیت اجتماعی", emoji:"🤝", subs:["خیریه و مسئولیت اجتماعی"] },
  { name:"خبری", emoji:"📰", subs:["خبری"] },
  { name:"مذهبی", emoji:"🕌", subs:["مذهبی"] }
];
const leaf = (c, s) => `${c} > ${s}`;
const JALALI_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const faNum = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
function g2j(gy,gm,gd){const g=[0,31,59,90,120,151,181,212,243,273,304,334];let jy=(gy>1600)?(gy+1):gy;let d=(365*gy)+Math.floor((gy*2+3)/4)-Math.floor((gy*2+99)/100)+Math.floor((gy*2+399)/400)-80+gd+g[gm-1];jy+=33*Math.floor(d/12053);d%=12053;jy+=4*Math.floor(d/1461);d%=1461;if(d>365){jy+=Math.floor((d-1)/365);d=(d-1)%365;}const jm=(d<186)?1+Math.floor(d/31):7+Math.floor((d-186)/30);const jd=1+((d<186)?(d%31):((d-186)%30));return[jy,jm,jd];}
const IR = iso => new Date(new Date(iso).getTime()+3.5*3600*1000);
function faDate(iso){const d=IR(iso);const[jy,jm,jd]=g2j(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate());return`${faNum(jd)} ${JALALI_MONTHS[jm-1]} ${faNum(jy)}`;}
function faTime(iso){const d=IR(iso);return faNum(String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0"));}
const chunk=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n));
const toEn=s=>String(s||"").replace(/[۰-۹٠-٩]/g,d=>{const c=d.charCodeAt(0);if(c>=1776&&c<=1785)return String(c-1776);if(c>=1632&&c<=1641)return String(c-1632);return d;});

const HELP_TEXT = `🌱 راهنمای کشف\n\n🪙 کسب سکه:\n• عضویت: +۱ سکه\n• فوروارد پست: +۱ سکه\n• کوییز مکان‌محور: +۲ سکه\n• ماندگاری ۳۰ روزه: +۱ سکه\n• مأموریت‌های روزانه: پاداش متغیر\n\n⏳ قانون ۴۸ ساعت: ماندگاری = مخاطب واقعی\n🛡 اعتماد: هرچه فعال‌تر، پاداش بیشتر\n💎 قیمت سکه: پویا بر اساس عرضه/تقاضا\n🔒 استیک: سود ۰.۵٪ + بلیت قرعه‌کشی\n🏆 کیفیت: ما «مخاطب فعال تأییدشده» می‌فروشیم`;

async function bale(env,method,payload={}){const r=await fetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});return await r.json();}
const sendMsg=(env,c,t,rm)=>bale(env,"sendMessage",{chat_id:c,text:t,parse_mode:"HTML",...(rm?{reply_markup:rm}:{})});
const answerCb=(env,id)=>bale(env,"answerCallbackQuery",{callback_query_id:id});
const isAdmin=(env,uid)=>uid===parseInt(env.OWNER_ID||"1381797564");
const isBanned=async(db,uid)=>!!(await db.prepare("SELECT 1 FROM reports WHERE target_kind='ban' AND target_id=? LIMIT 1").bind(String(uid)).first());
async function notify(env,db,uid,text){try{const u=await db.prepare("SELECT 1 FROM users WHERE user_id=?").bind(uid).first();if(u)await bale(env,"sendMessage",{chat_id:uid,text,parse_mode:"HTML"});}catch(e){}}
async function notifyOwner(env,text){const o=parseInt(env.OWNER_ID||"1381797564");if(o)try{await bale(env,"sendMessage",{chat_id:o,text,parse_mode:"HTML"});}catch(e){}}
async function getEconomy(db){let e=await db.prepare("SELECT * FROM economy_state WHERE id=1").first();if(!e){await db.prepare("INSERT INTO economy_state (id) VALUES (1)").run();e=await db.prepare("SELECT * FROM economy_state WHERE id=1").first();}return e;}
const circulating=e=>Math.max(e.total_minted-e.total_burned-e.total_locked,0);
const currentPrice=e=>{const c=circulating(e);return c>0?Math.max(BASE_PRICE,e.pool_value/c):BASE_PRICE;};
async function logTx(db,uid,type,amount,after,note=""){await db.prepare("INSERT INTO transactions (user_id,type,amount,balance_after,note) VALUES (?,?,?,?,?)").bind(uid,type,amount,after,note).run();}
async function mintFromBudget(db,uid,coins){const e=await getEconomy(db);const cost=coins*currentPrice(e);if(e.reward_budget<cost)return false;await db.prepare("UPDATE economy_state SET reward_budget=reward_budget-?, total_minted=total_minted+? WHERE id=1").bind(cost,coins).run();await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins,uid).run();return true;}
async function payAction(env,db,m,action,coins,ch){const paid=await mintFromBudget(db,m.user_id,coins);if(paid){await logTx(db,m.user_id,"TASK_"+action,coins,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(m.user_id).first()).balance,ch?.title||"");await db.prepare("UPDATE channels SET acquired=acquired+1 WHERE id=?").bind(m.channel_id).run();}return coins;}
async function addQS(db,mId,pts){await db.prepare("UPDATE memberships SET quality_score=quality_score+? WHERE id=?").bind(pts,mId).run();}
async function refundEscrow(env,db,chId,reason=""){const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();if(!ch||!ch.owner_id||ch.budget_coins<=0)return;await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(ch.budget_coins,ch.owner_id).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(ch.budget_coins).run();await logTx(db,ch.owner_id,"ESCROW_REFUND",ch.budget_coins,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(ch.owner_id).first()).balance,reason);await db.prepare("UPDATE channels SET budget_coins=0 WHERE id=?").bind(chId).run();}
async function channelGrade(db,chId){const s=await db.prepare("SELECT COUNT(*) c, COALESCE(AVG(quality_score),0) a FROM memberships WHERE channel_id=? AND status='rewarded'").bind(chId).first();const a=s.a||0;const g=a>=80?"A":a>=60?"B":a>=40?"C":"D";const w={A:4,B:3,C:2,D:1}[g];return{g,w,a};}
async function setState(db,uid,step,data={}){await db.prepare("INSERT INTO user_states (user_id,step,data) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step, data=excluded.data, updated_at=datetime('now')").bind(uid,step,JSON.stringify(data)).run();}
const getState=(db,uid)=>db.prepare("SELECT * FROM user_states WHERE user_id=?").bind(uid).first();
const clearState=(db,uid)=>db.prepare("DELETE FROM user_states WHERE user_id=?").bind(uid).run();
async function trackQuota(env){try{const db=env.DB;const date=new Date().toISOString().slice(0,10);await db.prepare("INSERT INTO quota(date,requests) VALUES(?,1) ON CONFLICT(date) DO UPDATE SET requests=requests+1").bind(date).run();}catch(e){}}

const MAIN_KB={keyboard:[[{text:"🌟 کشف کانال، گروه و ربات"},{text:"📢 ثبت کمپین رشد"}],[{text:"🎯 مأموریت‌های امروز"},{text:"👤 پروفایل من"}],[{text:"❓ راهنما و پشتیبانی"}]],resize_keyboard:true};
const CANCEL_KB={inline_keyboard:[[{text:"❌ انصراف",callback_data:"cancel"}]]};
function interestsKB(d){const sel=d.sel||[];if(d.cat==null)return{inline_keyboard:[...chunk(CATEGORIES.map((c,i)=>({text:`${c.subs.some(s=>sel.includes(leaf(c.name,s)))?"✅ ":""}${c.emoji} ${c.name}`,callback_data:"cat:"+i})),2),[{text:"✅ ثبت علایق من",callback_data:"tags_done"}]]};const c=CATEGORIES[d.cat];return{inline_keyboard:[[{text:`${c.emoji} ${c.name} — زیرشاخه`,callback_data:"noop"}],...c.subs.map((s,j)=>[{text:`${sel.includes(leaf(c.name,s))?"✅ ":""}${s}`,callback_data:`sub:${d.cat}:${j}`}]),[{text:"🔙 بازگشت",callback_data:"catback"}],[{text:"✅ ثبت علایق من",callback_data:"tags_done"}]]};}
function campTagsKB(d){const sel=d.csel||[];if(d.ccat==null)return{inline_keyboard:[...chunk(CATEGORIES.map((c,i)=>({text:`${c.subs.some(s=>sel.includes(leaf(c.name,s)))?"✅ ":""}${c.emoji} ${c.name}`,callback_data:"ccat:"+i})),2),[{text:"✅ ادامه",callback_data:"ctags_done"}],[{text:"❌ انصراف",callback_data:"cancel"}]]};const c=CATEGORIES[d.ccat];return{inline_keyboard:[[{text:`${c.emoji} ${c.name} — زیرشاخه`,callback_data:"noop"}],...c.subs.map((s,j)=>[{text:`${sel.includes(leaf(c.name,s))?"✅ ":""}${s}`,callback_data:`csub:${d.ccat}:${j}`}]),[{text:"🔙 بازگشت",callback_data:"ccatback"}],[{text:"✅ ادامه",callback_data:"ctags_done"}],[{text:"❌ انصراف",callback_data:"cancel"}]]};}
const tierKB=()=>({inline_keyboard:[Object.entries(TIERS).map(([k,v])=>({text:v.label,callback_data:"tier:"+k})),[{text:"❌ انصراف",callback_data:"cancel"}]]});

async function seedMissions(db){const c=await db.prepare("SELECT COUNT(*) c FROM missions").first();if(c.c>0)return;await db.prepare("INSERT INTO missions (title,description,type,reward) VALUES (?,?,?,?)").bind("عضویت در کانال مرکزی","عضو کانال "+CLUB_CHANNEL+" شو.","club",5).run();await db.prepare("INSERT INTO missions (title,description,type,reward) VALUES (?,?,?,?)").bind("انجام اولین تسک تأییدشده","یک تسک کشف را کامل کن و پاداش بگیر.","task",5).run();await db.prepare("INSERT INTO missions (title,description,type,reward) VALUES (?,?,?,?)").bind("دعوت یک دوست","با لینک دعوتت یک دوست را عضو کن.","referral",15).run();}

async function handleStart(u,env){
  const uid=u.message.from.id,db=env.DB;
  if(await isBanned(db,uid))return sendMsg(env,uid,"⛔ حساب شما مسدود است.");
  const text=u.message.text||"";
  const ref=text.includes("ref_")?text.split("ref_")[1].trim():null;
  const ex=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  if(!ex){
    const code=String(Math.floor(100000+Math.random()*900000));
    let ru=null;
    if(ref){const r=await db.prepare("SELECT user_id FROM users WHERE ref_code=?").bind(ref).first();if(r)ru=r.user_id;}
    await db.prepare("INSERT INTO users (user_id,username,first_name,ref_code,referred_by) VALUES (?,?,?,?,?)").bind(uid,u.message.from.username||"",u.message.from.first_name||"",code,ru).run();
    // 🔒 Fix #3: سقف رفرال
    if(ru){
      const refCount=await db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").bind(ru).first();
      if(refCount.c<=MAX_REFERRALS){
        const ok=await mintFromBudget(db,ru,15);
        if(ok)await bale(env,"sendMessage",{chat_id:ru,text:`🎉 یک دوست با لینک تو عضو شد! +۱۵ سکه\n👥 رفرال‌های موفق: ${faNum(refCount.c)}/${faNum(MAX_REFERRALS)}`,parse_mode:"HTML"});
      }
    }
    await setState(db,uid,"INTERESTS",{sel:[],cat:null});
    return sendMsg(env,uid,`🌱 به ${BOT_NAME} خوش آمدی!\nیک دسته را بزن و زیرشاخه‌ها را انتخاب کن (حداکثر ۵):`,interestsKB({sel:[],cat:null}));
  }
  await sendMsg(env,uid,`👋 خوش برگشتی!\n🪙 موجودی: ${ex.balance} سکه`,MAIN_KB);
}

async function handleMenu(u,env){
  const t=u.message.text,uid=u.message.from.id,db=env.DB;
  if(t==="🌟 کشف کانال، گروه و ربات")return sendMsg(env,uid,"دکمه «🌟 نمایش پیشنهاد» را بزن:",{inline_keyboard:[[{text:"🌟 نمایش پیشنهاد",callback_data:"disc"}]]});
  if(t==="📢 ثبت کمپین رشد"){await setState(db,uid,"CAMP_USERNAME");return sendMsg(env,uid,`📢 ثبت کمپین رشد\n\nشناسه کانال/گروه/ربات را بفرست (با @):\n⚠️ ربات باید ادمین باشد.`,CANCEL_KB);}
  if(t==="🎯 مأموریت‌های امروز")return missionsHandler(uid,env);
  if(t==="👤 پروفایل من"){const x=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();const link=`https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`;return sendMsg(env,uid,`👤 ${x.first_name}\n🪙 موجودی: ${x.balance}\n🔒 استیک: ${x.staked}\n🛡 اعتماد: ${x.trust_score}/100\n\n🔗 لینک دعوت:\n${link}`,{inline_keyboard:[[{text:"📤 لینک دعوت",callback_data:"invitelink"}],[{text:"👥 زیرمجموعه‌ها",callback_data:"refs"},{text:"📋 کمپین‌های من",callback_data:"mycams"}],[{text:"📒 فعالیت‌های من",callback_data:"myacts"},{text:"💰 جزئیات سکه‌ها",callback_data:"mytxs"}],[{text:"💎 خرید سکه",callback_data:"buy"}],[{text:"🔒 قفل سکه",callback_data:"stake_start"},{text:"🔓 آزادسازی",callback_data:"stake_unlock"}],[{text:"📊 گزارش استیک",callback_data:"stake_report"},{text:"🎰 بلیت‌ها",callback_data:"tickets"}],[{text:"🎨 ویرایش علایق",callback_data:"edit_interests"},{text:"🎁 تسک‌های فعال",callback_data:"active_tasks"}]]});}
  if(t==="❓ راهنما و پشتیبانی")return sendMsg(env,uid,HELP_TEXT,{inline_keyboard:[[{text:"📨 پیام به پشتیبانی",callback_data:"support_start"}]]});
}

async function missionsHandler(uid,env){
  const db=env.DB;await seedMissions(db);
  const now=new Date().toISOString();
  const rows=(await db.prepare("SELECT * FROM missions WHERE status='active' AND (start_at IS NULL OR start_at<=?) AND (expire_at IS NULL OR expire_at>=?) ORDER BY id ASC LIMIT 12").bind(now,now).all()).results;
  if(!rows.length)return sendMsg(env,uid,"🎯 مأموریت‌های امروز\n\nفعلاً مأموریت فعالی نیست.\nبه‌زودی مأموریت‌های جدید اضافه می‌شوند!",{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});
  const list=[];const kb=[];
  for(const m of rows){
    const claimed=await db.prepare("SELECT 1 FROM mission_claims WHERE mission_id=? AND user_id=?").bind(m.id,uid).first();
    const exp=m.expire_at?`\n⏳ تا ${faDate(m.expire_at)}`:"";
    list.push(`${claimed?"✅":"🔸"} ${m.title} (+${faNum(m.reward)} سکه)\n${m.description||""}${exp}`);
    kb.push([{text:(claimed?"✅ ":"")+m.title+` (+${faNum(m.reward)})`,callback_data:"mclaim:"+m.id}]);
  }
  return sendMsg(env,uid,`🎯 مأموریت‌های امروز\n\n${list.join("\n──────────\n")}`,{inline_keyboard:kb});
}

async function handleStateText(u,env,st){
  const db=env.DB,uid=u.message.from.id,text=(u.message.text||"").trim();
  const d=JSON.parse(st.data||"{}");
  if(["INTERESTS","CAMP_TAGS","REPORT_REASON"].includes(st.step))return sendMsg(env,uid,"لطفاً فقط از دکمه‌ها استفاده کن 🙂");

  // ✅ Fix #1: سیستم پشتیبانی دوطرفه
  if(st.step==="SUPPORT_MSG"){
    if(!text)return sendMsg(env,uid,"❌ پیام خالی است. لطفاً متن بنویس.");
    if(text.length>2000)return sendMsg(env,uid,"❌ پیام بیش از ۲۰۰۰ کاراکتر است.");
    await clearState(db,uid);
    const owner=parseInt(env.OWNER_ID||"1381797564");
    const uInfo=await db.prepare("SELECT first_name,username FROM users WHERE user_id=?").bind(uid).first();
    const who=`${uInfo?.first_name||"—"} ${uInfo?.username?"@"+uInfo.username:""} (${uid})`;
    if(owner){
      await bale(env,"sendMessage",{chat_id:owner,text:`📨 پیام پشتیبانی جدید\n👤 ${who}\n📅 ${faDate(new Date().toISOString())} ${faTime(new Date().toISOString())}\n\n💬 ${text}\n\n──────────\nبرای پاسخ:\n/reply ${uid} متن پاسخ`,parse_mode:"HTML",reply_markup:{inline_keyboard:[[{text:"✅ پاسخ سریع",callback_data:"sup_reply:"+uid}]]}});
    }
    return sendMsg(env,uid,"✅ پیام شما به تیم پشتیبانی ارسال شد.\n⏳ پاسخ در اسرع وقت به شما اعلام می‌شود.\n──────────\nبرای بازگشت به منو از دکمه‌های زیر استفاده کنید.",MAIN_KB);
  }

  if(st.step==="BROADCAST_TEXT"){if(text.length>4000)return sendMsg(env,uid,"❌ متن بیش از ۴۰۰۰ کاراکتر است.");const allUsers=(await db.prepare("SELECT COUNT(*) c FROM users").first()).c;d.broadcast_text=text;await setState(db,uid,"BROADCAST_CONFIRM",d);return sendMsg(env,uid,`📨 پیش‌نمایش پیام همگانی\n\n${text}\n\n👥 گیرندگان: ${faNum(allUsers)} کاربر\n\nتأیید می‌کنی؟`,{inline_keyboard:[[{text:"✅ ارسال به همه",callback_data:"broadcast_send"},{text:"❌ انصراف",callback_data:"cancel"}]]});}
  if(st.step==="MISSION_TITLE"){d.m_title=text;await setState(db,uid,"MISSION_DESC",d);return sendMsg(env,uid,"📝 توضیح کوتاه مأموریت (چه کاری باید انجام شود) را بنویس:",CANCEL_KB);}
  if(st.step==="MISSION_DESC"){d.m_desc=text;await setState(db,uid,"MISSION_TYPE",d);return sendMsg(env,uid,"🧩 نوع مأموریت (شرط تأیید خودکار) را انتخاب کن:",{inline_keyboard:[...MTYPES.map(t=>[{text:t.label,callback_data:"mtype:"+t.id}]),[{text:"❌ انصراف",callback_data:"cancel"}]]});}
  if(st.step==="MISSION_REWARD"){const r=parseInt(toEn(text));if(!r||r<1||r>100)return sendMsg(env,uid,"❌ عدد بین ۱ تا ۱۰۰.",CANCEL_KB);d.m_reward=r;await setState(db,uid,"MISSION_EXPIRE",d);return sendMsg(env,uid,"⏰ انقضا چند ساعت دیگر؟ (۰ = بدون انقضا)",{inline_keyboard:[[{text:"۲۴ ساعت",callback_data:"mexp:24"},{text:"۴۸ ساعت",callback_data:"mexp:48"},{text:"۷۲ ساعت",callback_data:"mexp:72"}],[{text:"♾ بدون انقضا",callback_data:"mexp:0"}],[{text:"❌ انصراف",callback_data:"cancel"}]]});}
  if(st.step==="CAMP_USERNAME"){
    if(!text.startsWith("@"))return sendMsg(env,uid,"❌ باید با @ شروع شود.",CANCEL_KB);
    const un=text.slice(1);
    const res=await bale(env,"getChat",{chat_id:"@"+un});
    if(!res.ok)return sendMsg(env,uid,"❌ کانال/گروه یافت نشد.",CANCEL_KB);
    const me=await bale(env,"getChatMember",{chat_id:"@"+un,user_id:(await bale(env,"getMe",{})).result?.id});
    if(!me.ok||!["administrator","creator"].includes(me.result?.status))return sendMsg(env,uid,"❌ ربات ادمین نیست.",CANCEL_KB);
    d.chat={chat_id:String(res.result.id),username:un,title:res.result.title||un,type:res.result.type||"channel"};
    d.csel=[];d.ccat=null;
    await setState(db,uid,"CAMP_TAGS",d);
    return sendMsg(env,uid,`✅ «${d.chat.title}» تأیید شد.\nدسته موضوعی را انتخاب کن (۱ تا ۵):`,campTagsKB(d));
  }
  if(st.step==="CAMP_ANCHOR"){d.anchor_post_link=text;await setState(db,uid,"CAMP_DISTANCE",d);return sendMsg(env,uid,"✅ لینک پست مرجع ثبت شد.\nچند پست بعد از این پست باید جستجو شود؟ (۳ تا ۱۰)",CANCEL_KB);}
  if(st.step==="CAMP_DISTANCE"){const dist=parseInt(toEn(text));if(!dist||dist<3||dist>10)return sendMsg(env,uid,"❌ عدد بین ۳ تا ۱۰.",CANCEL_KB);d.post_distance=dist;await setState(db,uid,"CAMP_QUIZ_Q",d);return sendMsg(env,uid,`✅ ${faNum(dist)} پست بعد.\nحالا سؤال کوییز را بنویس:`,CANCEL_KB);}
  if(st.step==="CAMP_QUIZ_Q"){d.quiz_question=text;await setState(db,uid,"CAMP_QUIZ_O",d);return sendMsg(env,uid,"✅ سؤال ثبت شد.\nحالا گزینه‌ها را با ویرگول (،) جدا کرده و بفرست:",CANCEL_KB);}
  if(st.step==="CAMP_QUIZ_O"){d.quiz_options=JSON.stringify(text.split("،").map(s=>s.trim()).filter(Boolean));await setState(db,uid,"CAMP_QUIZ_A",d);return sendMsg(env,uid,"✅ گزینه‌ها ثبت شد.\nحالا پاسخ صحیح را دقیقاً مثل یکی از گزینه‌ها بفرست:",CANCEL_KB);}
  if(st.step==="CAMP_QUIZ_A"){d.quiz_answer=text;await setState(db,uid,"CAMP_TARGET",d);return sendMsg(env,uid,"✅ کوییز ثبت شد.\nتعداد عضو هدف را بفرست (حداقل ۲۵):",CANCEL_KB);}
  if(st.step==="CAMP_TARGET"){
    const n=parseInt(toEn(text));
    if(!n||n<MIN_CAMPAIGN)return sendMsg(env,uid,`❌ حداقل ${faNum(MIN_CAMPAIGN)} عضو.`,CANCEL_KB);
    d.target=n;
    const cost=n*COST_PER_MEMBER;
    d.cost=cost;
    await setState(db,uid,"CAMP_CONFIRM",d);
    return sendMsg(env,uid,`🧾 پیش‌نمایش کمپین\n\n📢 ${d.chat.title}\n👥 هدف: ${faNum(n)} عضو\n💰 هزینه: ${faNum(cost)} سکه (${faNum(cost*4)} تومان)\n🏷 سطح: ${TIERS[d.tier]?.label||"—"}\n\nتأیید و قفل سپرده؟`,{inline_keyboard:[[{text:"✅ تأیید و شروع",callback_data:"camp_confirm"},{text:"❌ انصراف",callback_data:"cancel"}]]});
  }
  if(st.step==="STAKE_AMOUNT"){
    const n=parseInt(toEn(text));
    if(!n||n<10)return sendMsg(env,uid,"❌ حداقل ۱۰ سکه.",CANCEL_KB);
    const x=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
    if(x.balance<n)return sendMsg(env,uid,`❌ کافی نیست (داری ${x.balance}).`,CANCEL_KB);
    d.amount=n;
    await setState(db,uid,"STAKE_PERIOD",d);
    return sendMsg(env,uid,`🔒 مقدار: ${n}\nدوره را انتخاب کن:`,{inline_keyboard:[[{text:"۷ روز (۰.۵٪)",callback_data:"stake_period:7"},{text:"۳۰ روز (۰.۵٪)",callback_data:"stake_period:30"}],[{text:"❌ انصراف",callback_data:"cancel"}]]});
  }
  return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);
}

async function submitReport(env,db,reporterId,targetKind,targetId,reason,category){
  await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason,category) VALUES (?,?,?,?,?)").bind(reporterId,targetKind,targetId,reason,category).run();
  const owner=parseInt(env.OWNER_ID||"1381797564");
  if(owner){
    const reporter=await db.prepare("SELECT first_name,username FROM users WHERE user_id=?").bind(reporterId).first();
    const who=`${reporter?.first_name||"—"} ${reporter?.username?"@"+reporter.username:""} (${reporterId})`;
    let extra="";
    if(targetKind==="channel"){const ch=await db.prepare("SELECT title,username,owner_id FROM channels WHERE id=?").bind(targetId).first();extra=`\n📢 کانال: ${ch?.title||"—"} (@${ch?.username||"—"})\n👤 مالک: ${ch?.owner_id||"—"}`;}
    const catLabel=category==="technical"?"⚙️ فنی":"⚠️ محتوایی";
    await bale(env,"sendMessage",{chat_id:owner,text:`🚩 گزارش جدید [${catLabel}]\n👤 گزارش‌دهنده: ${who}${extra}\n📝 ${reason}\n📅 ${faDate(new Date().toISOString())} ${faTime(new Date().toISOString())}`,parse_mode:"HTML"});
    if(targetKind==="channel"&&category==="technical"){
      const techCount=await db.prepare("SELECT COUNT(*) c FROM reports WHERE target_kind='channel' AND target_id=? AND category='technical'").bind(targetId).first();
      if(techCount.c>=3){await db.prepare("UPDATE channels SET status='paused', violations=violations+1 WHERE id=?").bind(targetId).run();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(targetId).first();if(ch?.owner_id)await bale(env,"sendMessage",{chat_id:ch.owner_id,text:`⚠️ کمپین «${ch.title}» به دلیل ۳ گزارش فنی موقتاً متوقف شد.`,parse_mode:"HTML"});await bale(env,"sendMessage",{chat_id:owner,text:`⛔ کانال #${targetId} خودکار متوقف شد (۳ گزارش فنی).`,parse_mode:"HTML"});}
    }
  }
}

async function handleCb(q,env){
  const db=env.DB,uid=q.from.id,data=q.data;
  await answerCb(env,q.id);
  const edit=(t,rm)=>bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text:t,parse_mode:"HTML",...(rm?{reply_markup:rm}:{})});
  const setKB=rm=>bale(env,"editMessageReplyMarkup",{chat_id:q.message.chat.id,message_id:q.message.message_id,reply_markup:rm});
  const toggle=(a,v,m=5)=>{if(a.includes(v))a.splice(a.indexOf(v),1);else if(a.length<m)a.push(v);};

  if(data==="cancel"){await clearState(db,uid);return edit("❌ لغو شد.");}
  if(data==="noop")return;
  if(data==="disc")return showDiscover(q,env,0);
  if(data.startsWith("prev:"))return showDiscover(q,env,parseInt(data.slice(5)));
  if(data.startsWith("next:"))return showDiscover(q,env,parseInt(data.slice(5)));

  if(data.startsWith("quiz:")){
    const parts=data.split(":");const mId=parseInt(parts[1]);const idx=parseInt(parts[2]);
    const m=await db.prepare("SELECT * FROM memberships WHERE id=?").bind(mId).first();
    if(!m)return edit("❌");
    const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
    if(!ch)return edit("❌");
    if((m.quiz_attempts||0)>=QUIZ_MAX_ATTEMPTS)return edit(`⛔ ${faNum(QUIZ_MAX_ATTEMPTS)} تلاش ناموفق. پاداش کوییز از دست رفت.`);
    await db.prepare("UPDATE memberships SET quiz_attempts=COALESCE(quiz_attempts,0)+1 WHERE id=?").bind(mId).run();
    const opts=JSON.parse(ch.quiz_options||"[]");
    const tier=TIERS[ch.tier]||TIERS.standard;
    if(opts[idx]===ch.quiz_answer){
      await db.prepare("UPDATE memberships SET quiz_correct=1 WHERE id=?").bind(mId).run();
      await addQS(db,mId,40);
      const paid=await payAction(env,db,m,"QUIZ",tier.quiz,ch);
      return edit(`✅ درست! +${faNum(paid)} سکه\n📈 امتیاز کیفیت +۴۰`);
    }
    const remaining=QUIZ_MAX_ATTEMPTS-(m.quiz_attempts||0)-1;
    return edit(`❌ اشتباه. ${faNum(Math.max(remaining,0))} تلاش باقی مانده.`);
  }

  if(data.startsWith("mclaim:")){
    const mId=parseInt(data.slice(7));
    const m=await db.prepare("SELECT * FROM missions WHERE id=? AND status='active'").bind(mId).first();
    if(!m)return edit("❌ مأموریت فعال نیست.");
    const now=new Date().toISOString();
    if(m.start_at&&m.start_at>now)return edit("⏰ این مأموریت هنوز شروع نشده.");
    if(m.expire_at&&m.expire_at<now)return edit("⏰ این مأموریت منقضی شده.");
    const claimed=await db.prepare("SELECT 1 FROM mission_claims WHERE mission_id=? AND user_id=?").bind(mId,uid).first();
    if(claimed)return edit("⛔ قبلاً انجام داده‌ای.");
    if(m.max_claims>0){const c=await db.prepare("SELECT COUNT(*) c FROM mission_claims WHERE mission_id=?").bind(mId).first();if(c.c>=m.max_claims)return edit("⛔ ظرفیت مأموریت پر شده.");}
    await db.prepare("INSERT INTO mission_claims (mission_id,user_id) VALUES (?,?)").bind(mId,uid).run();
    const paid=await mintFromBudget(db,uid,m.reward);
    if(paid)await logTx(db,uid,"MISSION_"+mId,m.reward,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,m.title);
    return edit(paid?`🎉 +${faNum(m.reward)} سکه\nمأموریت «${m.title}» انجام شد!`:"💸 بودجه پاداش خالی است. بعداً امتحان کن.");
  }

  if(data.startsWith("report:")){const chId=data.slice(7);const existing=await db.prepare("SELECT 1 FROM reports WHERE reporter_id=? AND target_kind='channel' AND target_id=? LIMIT 1").bind(uid,chId).first();if(existing)return edit("⛔ قبلاً روی این کانال گزارش ثبت کرده‌ای.");await setState(db,uid,"REPORT_REASON",{channelId:chId});return edit("🚩 نوع گزارش را انتخاب کن:",{inline_keyboard:[...chunk(REPORT_TYPES.map(r=>({text:r.label,callback_data:`rtype:${chId}:${r.id}`})),1),[{text:"❌ انصراف",callback_data:"cancel"}]]});}
  if(data.startsWith("rtype:")){const st=await getState(db,uid);if(!st)return;const[,chId,rId]=data.split(":");const rt=REPORT_TYPES.find(r=>r.id===rId);if(!rt)return;await submitReport(env,db,uid,"channel",chId,rt.label,rt.cat);await clearState(db,uid);return edit(rt.cat==="technical"?"🚩 گزارش ثبت شد.\n⚙️ تیم فنی بررسی می‌کند.":"🚩 گزارش ثبت شد.\n⚠️ تیم محتوا بررسی می‌کند.");}

  // ✅ Fix #1: پاسخ سریع پشتیبانی (ادمین)
  if(data.startsWith("sup_reply:")&&isAdmin(env,uid)){
    const targetUid=parseInt(data.slice(10));
    await setState(db,uid,"ADMIN_REPLY",{targetUid});
    return edit(`✍️ پاسخ به کاربر ${targetUid}\n\nمتن پاسخ را بنویس:`);
  }

  if(data==="adm_menu"&&isAdmin(env,uid))return handleAdmin(env,uid);
  if(data==="adm_users"&&isAdmin(env,uid))return handleAdminUsers(env,uid);
  if(data==="adm_cams"&&isAdmin(env,uid))return handleAdminChannels(env,uid);
  if(data==="adm_txs"&&isAdmin(env,uid))return handleAdminTxs(env,uid);
  if(data==="adm_rpts"&&isAdmin(env,uid))return handleAdminReports(env,uid);
  if(data==="adm_econ"&&isAdmin(env,uid))return handleAdminEconomy(env,uid);
  if(data==="adm_eng"&&isAdmin(env,uid))return handleAdminEngage(env,uid);
  if(data==="adm_quota"&&isAdmin(env,uid))return handleAdminQuota(env,uid);
  if(data==="adm_missions"&&isAdmin(env,uid))return handleAdminMissions(env,uid);
  if(data==="adm_mnew"&&isAdmin(env,uid)){await setState(db,uid,"MISSION_TITLE",{});return edit("➕ مأموریت جدید\n\nعنوان مأموریت را بنویس:");}
  if(data==="adm_bc"&&isAdmin(env,uid)){await setState(db,uid,"BROADCAST_TEXT",{});return edit("📨 متن پیام همگانی را بفرست (حداکثر ۴۰۰۰ کاراکتر):");}
  if(data.startsWith("mtype:")&&isAdmin(env,uid)){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.m_type=data.slice(6);await setState(db,uid,"MISSION_REWARD",d);return edit("🎁 مقدار پاداش (سکه) را بنویس:");}
  if(data.startsWith("mexp:")&&isAdmin(env,uid)){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const h=parseInt(data.slice(5));const nowMs=Date.now();d.m_start=new Date(nowMs).toISOString();d.m_expire=h>0?new Date(nowMs+h*3600*1000).toISOString():null;await setState(db,uid,"MISSION_CONFIRM",d);return edit(`🧾 پیش‌نمایش مأموریت\n\n📌 ${d.m_title}\n📝 ${d.m_desc||"—"}\n🧩 نوع: ${d.m_type}\n🎁 پاداش: ${faNum(d.m_reward)} سکه\n⏰ انقضا: ${d.m_expire?faDate(d.m_expire):"ندارد"}\n\nثبت می‌کنی؟`,{inline_keyboard:[[{text:"✅ ثبت مأموریت",callback_data:"mcreate"},{text:"❌ انصراف",callback_data:"cancel"}]]});}
  if(data==="mcreate"&&isAdmin(env,uid)){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");await db.prepare("INSERT INTO missions (title,description,type,reward,start_at,expire_at,created_by) VALUES (?,?,?,?,?,?,?)").bind(d.m_title,d.m_desc||"",d.m_type,d.m_reward,d.m_start,d.m_expire,uid).run();await clearState(db,uid);return handleAdminMissions(env,uid);}
  if(data.startsWith("mdel:")&&isAdmin(env,uid)){await db.prepare("UPDATE missions SET status='deleted' WHERE id=?").bind(parseInt(data.slice(5))).run();return handleAdminMissions(env,uid);}
  if(data.startsWith("adm_pause:")&&isAdmin(env,uid)){await db.prepare("UPDATE channels SET status='paused' WHERE id=?").bind(parseInt(data.slice(10))).run();return handleAdminChannels(env,uid);}
  if(data.startsWith("adm_resume:")&&isAdmin(env,uid)){await db.prepare("UPDATE channels SET status='active' WHERE id=?").bind(parseInt(data.slice(11))).run();return handleAdminChannels(env,uid);}
  if(data.startsWith("adm_remove:")&&isAdmin(env,uid)){const id=parseInt(data.slice(11));await refundEscrow(env,db,id,"حذف توسط ادمین");await db.prepare("UPDATE channels SET status='removed' WHERE id=?").bind(id).run();return handleAdminChannels(env,uid);}
  if(data.startsWith("adm_ban:")&&isAdmin(env,uid)){const t=data.slice(8);if(t===String(uid))return sendMsg(env,uid,"⛔ نمی‌توانی خودت را بن کنی!");await db.prepare("INSERT INTO reports (reporter_id,target_kind,target_id,reason,category) VALUES (?,?,?,'بن ادمین','content')").bind(uid,"ban",t).run();return sendMsg(env,uid,`⛔ ${t} مسدود شد.`);}
  if(data.startsWith("adm_unban:")&&isAdmin(env,uid)){await db.prepare("DELETE FROM reports WHERE target_kind='ban' AND target_id=?").bind(data.slice(10)).run();return sendMsg(env,uid,"✅ از مسدودی خارج شد.");}
  if(data.startsWith("adm_resolve:")&&isAdmin(env,uid)){const id=parseInt(data.slice(12));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما بررسی و رسیدگی شد. 🌱");return handleAdminReports(env,uid);}
  if(data.startsWith("adm_rpause:")&&isAdmin(env,uid)){const id=parseInt(data.slice(11));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();if(r&&r.target_kind==="channel"){await db.prepare("UPDATE channels SET status='paused' WHERE id=?").bind(r.target_id).run();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(r.target_id).first();if(ch?.owner_id)await notify(env,db,ch.owner_id,`⚠️ کمپین «${ch.title}» توسط ادمین موقتاً متوقف شد.`);}await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما رسیدگی شد و کانال موقتاً متوقف شد.");return handleAdminReports(env,uid);}
  if(data.startsWith("adm_rremove:")&&isAdmin(env,uid)){const id=parseInt(data.slice(12));const r=await db.prepare("SELECT * FROM reports WHERE id=?").bind(id).first();if(r&&r.target_kind==="channel"){await refundEscrow(env,db,r.target_id,"حذف به دلیل گزارش");await db.prepare("UPDATE channels SET status='removed' WHERE id=?").bind(r.target_id).run();const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(r.target_id).first();if(ch?.owner_id)await notify(env,db,ch.owner_id,`❌ کمپین «${ch.title}» به دلیل گزارش حذف شد.`);}await db.prepare("UPDATE reports SET status='resolved' WHERE id=?").bind(id).run();if(r)await notify(env,db,r.reporter_id,"✅ گزارش شما رسیدگی شد و کانال حذف شد.");return handleAdminReports(env,uid);}
  if(data==="broadcast_send"&&isAdmin(env,uid)){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");if(!d.broadcast_text)return edit("❌ متنی ثبت نشده.");await clearState(db,uid);ctx_broadcast(env,db,d.broadcast_text,uid);return edit("📤 ارسال همگانی شروع شد.\nگزارش نهایی پس از اتمام می‌آید.");}

  if(data.startsWith("cat:")||data==="catback"||data.startsWith("sub:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.sel=d.sel||[];if(data==="catback")d.cat=null;else if(data.startsWith("cat:")){const c=CATEGORIES[parseInt(data.slice(4))];if(c.subs.length===1){toggle(d.sel,leaf(c.name,c.subs[0]));d.cat=null;}else d.cat=CATEGORIES.indexOf(c);}else{const[i,j]=data.slice(4).split(":").map(Number);toggle(d.sel,leaf(CATEGORIES[i].name,CATEGORIES[i].subs[j]));}await setState(db,uid,st.step,d);return setKB(interestsKB(d));}
  if(data==="tags_done"){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const sel=d.sel||[];if(!sel.length)return edit("❌ حداقل یک زیرشاخه.");await db.prepare("UPDATE users SET interests=? WHERE user_id=?").bind(JSON.stringify(sel),uid).run();let bonus="";const got=await db.prepare("SELECT 1 x FROM transactions WHERE user_id=? AND note='welcome'").bind(uid).first();if(!got){const ok=await mintFromBudget(db,uid,WELCOME_BONUS);if(ok){await logTx(db,uid,"WELCOME",0,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,"welcome");bonus=`\n🎁 +${WELCOME_BONUS}`;}}await clearState(db,uid);await edit(`✅ علایق ثبت شد (${faNum(sel.length)})!${bonus}`);return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);}
  if(data.startsWith("ccat:")||data==="ccatback"||data.startsWith("csub:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.csel=d.csel||[];if(data==="ccatback")d.ccat=null;else if(data.startsWith("ccat:")){const c=CATEGORIES[parseInt(data.slice(5))];if(c.subs.length===1){toggle(d.csel,leaf(c.name,c.subs[0]));d.ccat=null;}else d.ccat=CATEGORIES.indexOf(c);}else{const[i,j]=data.slice(5).split(":").map(Number);toggle(d.csel,leaf(CATEGORIES[i].name,CATEGORIES[i].subs[j]));}await setState(db,uid,st.step,d);return setKB(campTagsKB(d));}
  if(data==="ctags_done"){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");const sel=d.csel||[];if(!sel.length)return edit("❌ حداقل یک زیرشاخه.");d.tags=sel;await setState(db,uid,"CAMP_TIER",d);return edit(`✅ تگ‌ها: ${sel.join("، ")}\n\n🏷 سطح کمپین را انتخاب کن:`,tierKB());}
  if(data.startsWith("tier:")){const st=await getState(db,uid);if(!st)return;const d=JSON.parse(st.data||"{}");d.tier=data.slice(5);await setState(db,uid,st.step,d);if(d.tier==="premium"){await setState(db,uid,"CAMP_ANCHOR",d);return edit("🏆 سطح پریمیوم.\n\n🔗 لینک پست مرجع را بفرست:");}await setState(db,uid,"CAMP_TARGET",d);return edit(`✅ سطح: ${TIERS[d.tier].label}\nتعداد عضو هدف را بفرست (حداقل ۲۵):`);}

  // 🔒 Fix #2: آپدیت اتمیک موجودی در ثبت کمپین
  if(data==="camp_confirm"){
    const st=await getState(db,uid);if(!st)return;
    const d=JSON.parse(st.data||"{}");
    const cost=d.cost||0;
    // Atomic: فقط اگر موجودی کافی باشد کسر می‌شود
    const result=await db.prepare("UPDATE users SET balance=balance-? WHERE user_id=? AND balance>=?").bind(cost,uid,cost).run();
    if(result.meta.changes===0){
      const x=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();
      return edit(`❌ موجودی کافی نیست.\nنیاز: ${faNum(cost)} | داری: ${faNum(x?.balance||0)}\n\nاز «💎 خرید سکه» شارژ کن.`);
    }
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(cost).run();
    await logTx(db,uid,"ESCROW",-cost,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,d.chat?.title||"");
    await db.prepare("INSERT INTO channels (owner_id,chat_id,username,title,type,tier,niches,target,budget_coins,bot_is_admin,quiz_question,quiz_options,quiz_answer,anchor_post_link,post_distance) VALUES (?,?,?,?,?,?,?,?,1,?,?,?,?,?)").bind(uid,d.chat.chat_id,d.chat.username,d.chat.title,d.chat.type,d.tier,JSON.stringify(d.tags||[]),d.target,cost,d.quiz_question||"",d.quiz_options||"[]",d.quiz_answer||"",d.anchor_post_link||"",d.post_distance||5).run();
    await clearState(db,uid);
    return edit(`🎉 کمپین «${d.chat.title}» فعال شد!\n💰 ${faNum(cost)} سکه قفل شد.\n📊 هدف: ${faNum(d.target)} عضو`);
  }

  if(data==="buy"){const e=await getEconomy(db);const p=currentPrice(e);const packs=[{toman:10000,label:"۱۰ هزار"},{toman:50000,label:"۵۰ هزار"},{toman:100000,label:"۱۰۰ هزار"}];return edit(`💎 خرید سکه (قیمت: ${faNum(Math.round(p))} ت)\n──────────\n${packs.map(k=>`${k.label} — ${faNum(Math.floor(k.toman*0.8/p))} سکه`).join("\n")}`,{inline_keyboard:packs.map(k=>[{text:`${k.label} — ${faNum(Math.floor(k.toman*0.8/p))} سکه | ${k.toman.toLocaleString("fa-IR")} ت`,callback_data:"buy:"+k.toman}])});}
  if(data.startsWith("buy:")){const toman=parseInt(data.slice(4));const payload=`pay_${Date.now()}_${uid}`;await db.prepare("INSERT INTO payments (user_id,payload,amount_toman) VALUES (?,?,?)").bind(uid,payload,toman).run();await bale(env,"sendInvoice",{chat_id:uid,title:"خرید سکه کشف",description:`بسته ${toman.toLocaleString("fa-IR")} تومانی`,payload,provider_token:env.WALLET_TOKEN,prices:[{label:"مبلغ (ریال)",amount:toman*TOMAN_TO_RIAL}]});return;}

  // 🔒 Fix #2: آپدیت اتمیک استیک
  if(data==="stake_start"){await setState(db,uid,"STAKE_AMOUNT");return edit("🔒 چند سکه؟ (حداقل ۱۰)");}
  if(data.startsWith("stake_period:")){
    const days=parseInt(data.split(":")[1]);
    const st=await getState(db,uid);if(!st)return;
    const d=JSON.parse(st.data||"{}");
    const amount=d.amount||0;
    // Atomic
    const result=await db.prepare("UPDATE users SET balance=balance-?, staked=staked+? WHERE user_id=? AND balance>=?").bind(amount,amount,uid,amount).run();
    if(result.meta.changes===0){await clearState(db,uid);return edit("❌ موجودی کافی نیست.");}
    const now=new Date();const unlock=new Date(now.getTime()+days*86400000).toISOString();
    await db.prepare("UPDATE economy_state SET total_locked=total_locked+? WHERE id=1").bind(amount).run();
    await db.prepare("INSERT INTO stakes (user_id,amount,start_at,unlock_at) VALUES (?,?,?,?)").bind(uid,amount,now.toISOString(),unlock).run();
    const tk=Math.min(Math.floor(amount/10),30);
    for(let i=0;i<tk;i++)await db.prepare("INSERT INTO lottery_tickets (user_id) VALUES (?)").bind(uid).run();
    await logTx(db,uid,"STAKE_LOCK",-amount,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,`${days} روز`);
    await clearState(db,uid);
    return edit(`🔒 ${faNum(amount)} سکه قفل شد (${faNum(days)} روز)\n🎰 ${faNum(tk)} بلیت قرعه‌کشی دریافت کردی!`);
  }
  if(data==="stake_unlock"){const rows=(await db.prepare("SELECT * FROM stakes WHERE user_id=? AND status='active'").bind(uid).all()).results;if(!rows.length)return edit("❌ استیک فعالی نداری.");const now=new Date().toISOString();let unlocked=0;for(const s of rows){if(s.unlock_at<=now){await db.prepare("UPDATE stakes SET status='completed' WHERE id=?").bind(s.id).run();await db.prepare("UPDATE users SET balance=balance+?, staked=staked-? WHERE user_id=?").bind(s.amount,s.amount,uid).run();await db.prepare("UPDATE economy_state SET total_locked=total_locked-? WHERE id=1").bind(s.amount).run();unlocked+=s.amount;}}return edit(unlocked>0?`🔓 ${faNum(unlocked)} سکه آزاد شد!`:"⏳ هنوز موعد آزادسازی نرسیده.");}
  if(data==="stake_report"){const rows=(await db.prepare("SELECT * FROM stakes WHERE user_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("❌ استیکی نداری.");return edit(`📊 استیک‌های تو\n\n${rows.map(s=>`${s.status==="active"?"🟢":"✅"} ${faNum(s.amount)} | ${faDate(s.start_at)} → ${faDate(s.unlock_at)}`).join("\n──────────\n")}`);}
  if(data==="tickets"){const c=await db.prepare("SELECT COUNT(*) c FROM lottery_tickets WHERE user_id=?").bind(uid).first();return edit(`🎰 بلیت‌ها: ${faNum(c.c)}`);}
  if(data==="edit_interests"){const x=await db.prepare("SELECT interests FROM users WHERE user_id=?").bind(uid).first();const sel=JSON.parse(x.interests||"[]");await setState(db,uid,"INTERESTS",{sel,cat:null});return edit("🎨 بازبینی کن:",interestsKB({sel,cat:null}));}
  if(data==="invitelink"){const x=await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();return sendMsg(env,uid,`🔗 https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}\n\n🎁 هر دوست = +۱۵ سکه (حداکثر ${faNum(MAX_REFERRALS)} نفر)`);}
  if(data==="refs"){const t=await db.prepare("SELECT COUNT(*) c FROM users WHERE referred_by=?").bind(uid).first();const rows=(await db.prepare("SELECT first_name,created_at FROM users WHERE referred_by=? ORDER BY created_at DESC LIMIT 10").bind(uid).all()).results;const x=await db.prepare("SELECT ref_code FROM users WHERE user_id=?").bind(uid).first();return edit(`👥 کل: ${faNum(t.c)}/${faNum(MAX_REFERRALS)}\n\n${rows.length?rows.map((r,i)=>`${faNum(i+1)}. ${r.first_name||"—"} - ${faDate(r.created_at)}`).join("\n"):"هنوز کسی نیست"}\n\n🔗 https://ble.ir/${BOT_USERNAME}?start=ref_${x.ref_code}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});}
  if(data==="mycams"){const rows=(await db.prepare("SELECT * FROM channels WHERE owner_id=? ORDER BY id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("❌ کمپینی نداری.");const list=[];const kb=[];for(const ch of rows){const g=await channelGrade(db,ch.id);const remain=Math.max(ch.target-ch.acquired,0);const pct=ch.target?Math.min(Math.round(ch.acquired/ch.target*100),100):0;list.push(`🏆${g.g} ${ch.status==="active"?"🟢":ch.status==="paused"?"🟡":""} ${ch.title}\n📊 ${faNum(ch.acquired)}/${faNum(ch.target)} | باقی ${faNum(remain)} | ${faNum(pct)}٪\n💰 سپرده: ${faNum(ch.budget_coins)} | QS: ${faNum(Math.round(g.a))}`);kb.push([{text:`👥 اعضای #${ch.id}`,callback_data:`cam_members:${ch.id}`}]);}kb.push([{text:"🔙 بازگشت",callback_data:"profile_back"}]);return edit(`📋 کمپین‌های تو\n\n${list.join("\n──────────\n")}`,{inline_keyboard:kb});}
  if(data.startsWith("cam_members:")){const chId=parseInt(data.slice(12));const ch=await db.prepare("SELECT * FROM channels WHERE id=? AND owner_id=?").bind(chId,uid).first();if(!ch)return edit("❌ دسترسی ندارید.");const rows=(await db.prepare("SELECT m.*, u.first_name, u.username FROM memberships m JOIN users u ON m.user_id=u.user_id WHERE m.channel_id=? ORDER BY m.id DESC LIMIT 15").bind(chId).all()).results;if(!rows.length)return edit(`📋 اعضای ${ch.title}\n\nهنوز عضوی ثبت نشده.`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"mycams"}]]});const statusIcon=s=>({assigned:"🔘",joined:"⏳",rewarded:"✅",penalized:"⛔"}[s]||"—");const list=rows.map((r,i)=>`${faNum(i+1)}. ${r.first_name||"—"} ${r.username?"@"+r.username:""}\n${statusIcon(r.status)} | QS: ${faNum(r.quality_score)} | ${r.joined_at?faDate(r.joined_at):"—"}`).join("\n──────────\n");return edit(`📋 اعضای ${ch.title}\n👥 کل: ${faNum(rows.length)} نفر\n\n${list}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"mycams"}]]});}
  if(data==="myacts"){const rows=(await db.prepare("SELECT m.*, c.title, c.username, c.tier FROM memberships m JOIN channels c ON m.channel_id=c.id WHERE m.user_id=? ORDER BY m.id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("📒 فعالیت‌های من\n\nهنوز تسکی انجام نداده‌ای.",{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});const statusLabel=s=>({assigned:"🔘 شروع نشده",joined:"⏳ در انتظار تأیید",rewarded:"✅ تأیید شده",penalized:"⛔ جریمه"}[s]||s);const list=rows.map(r=>{const parts=[];if(r.status==="rewarded"||r.status==="joined")parts.push("عضویت");if(r.forward_verified)parts.push("فوروارد");if(r.quiz_correct)parts.push("کوییز");if(r.retention30_verified)parts.push("ماندگاری۳۰");const tier=TIERS[r.tier]||TIERS.standard;let earned=0;if(r.status==="rewarded")earned+=tier.join;if(r.forward_verified)earned+=tier.forward;if(r.quiz_correct)earned+=tier.quiz;if(r.retention30_verified)earned+=tier.ret30;return`📢 ${r.title} @${r.username}\n${statusLabel(r.status)}\n✓ ${parts.join(" | ")||"—"}\n🪙 کسب‌شده: ${faNum(earned)} | QS: ${faNum(r.quality_score)}\n📅 ${r.joined_at?faDate(r.joined_at):"—"}`;}).join("\n──────────\n");const totals=await db.prepare("SELECT SUM(quality_score) qs, COUNT(*) c FROM memberships WHERE user_id=? AND status='rewarded'").bind(uid).first();return edit(`📒 فعالیت‌های من\n\n${list}\n\n📊 جمع کل\n🎫 تسک موفق: ${faNum(totals.c)} | 🏆 QS: ${faNum(totals.qs||0)}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});}
  if(data==="active_tasks"){const rows=(await db.prepare("SELECT m.*, c.title, c.username, c.tier, c.quiz_question, c.quiz_options, c.anchor_post_link, c.post_distance FROM memberships m JOIN channels c ON m.channel_id=c.id WHERE m.user_id=? AND m.status IN ('assigned','joined') ORDER BY m.id DESC LIMIT 10").bind(uid).all()).results;if(!rows.length)return edit("🎁 تسک‌های فعال\n\nتسکی نداری.\nاز «🌟 کشف کانال، گروه و ربات» شروع کن!",{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});const summary=[];let sent=0;for(const r of rows){const tier=TIERS[r.tier]||TIERS.standard;if(r.status==="assigned"){summary.push(`🔘 ${r.title} — هنوز عضو نشده‌ای`);if(sent<3){await sendMsg(env,uid,`🚀 مأموریت: ${r.title}\n@${r.username}\n\nعضو شو و دکمه «🚀 شروع مأموریت» را بزن.`,{inline_keyboard:[[{text:"📢 باز کردن کانال",url:`https://ble.ir/${r.username}`}],[{text:"🚀 شروع مأموریت",callback_data:"mission:"+r.channel_id}]]});sent++;}}else{summary.push(`⏳ ${r.title} — در انتظار تأیید`);if(tier.quiz&&!r.quiz_correct&&sent<3){const opts=JSON.parse(r.quiz_options||"[]");await sendMsg(env,uid,`❓ کوییز (+${faNum(tier.quiz)} سکه)\n📢 ${r.title}\n\n${r.quiz_question}`,{inline_keyboard:opts.map((o,i)=>[{text:o,callback_data:`quiz:${r.id}:${i}`}])});sent++;}if(tier.forward&&!r.forward_verified&&sent<3){await sendMsg(env,uid,`📤 تسک فوروارد (+${faNum(tier.forward)} سکه)\n📢 ${r.title}\nیک پست کانال را به همین بات فوروارد کن.`,{inline_keyboard:[[{text:"📢 باز کردن کانال",url:`https://ble.ir/${r.username}`}]]});sent++;}}}return edit(`🎁 تسک‌های فعال\n\n${summary.join("\n")}\n\n📨 دکمه‌ها و جزئیات به پیوی‌ات ارسال شد.`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});}
  if(data==="mytxs"){const x=await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first();const rows=(await db.prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 15").bind(uid).all()).results;const txLabel={BUDGET_MINT:"🎁 پاداش سیستم",PURCHASE_MINT:"💎 خرید",TASK_JOIN:"🎯 پاداش عضویت",TASK_FORWARD:"📤 پاداش فوروارد",TASK_QUIZ:"❓ پاداش کوییز",TASK_RET30:"🏅 پاداش ماندگاری۳۰",ESCROW:"🔒 قفل کمپین",ESCROW_REFUND:"💰 بازگشت سپرده",STAKE_LOCK:"🔒 قفل استیک",STAKE_UNLOCK:"🔓 آزادسازی استیک",WELCOME:"🎁 خوش‌آمد"};const head=`🪙 موجودی فعلی: ${faNum(x.balance)} سکه\n──────────\n`;if(!rows.length)return edit(`💰 جزئیات سکه‌های من\n\n${head}هنوز تراکنشی نداری.`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});const list=rows.map(t=>{const label=t.type&&t.type.startsWith("MISSION")?"🎯 مأموریت: "+(t.note||""):(txLabel[t.type]||t.type);const sign=t.amount>=0?"+":"";return`${label}\n${sign}${faNum(t.amount)} → موجودی ${faNum(t.balance_after)}\n📝 ${t.note||"—"} | ${faDate(t.created_at)} ${faTime(t.created_at)}`;}).join("\n──────────\n");return edit(`💰 جزئیات سکه‌های من\n\n${head}${list}`,{inline_keyboard:[[{text:"🔙 بازگشت",callback_data:"profile_back"}]]});}
  if(data==="profile_back"){return sendMsg(env,uid,"منوی اصلی:",MAIN_KB);}
  if(data==="support_start"){await setState(db,uid,"SUPPORT_MSG");return edit("📨 پیام خود را بنویسید:\n(حداکثر ۲۰۰۰ کاراکتر)");}

  if(data.startsWith("mission:")){
    const chId=parseInt(data.slice(8));
    const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(chId).first();
    if(!ch)return edit("❌");
    const tier=TIERS[ch.tier]||TIERS.standard;
    if(ch.budget_coins<=0)return edit("⛔ بودجه این کمپین تمام شده.");
    const existing=await db.prepare("SELECT * FROM memberships WHERE user_id=? AND channel_id=?").bind(uid,chId).first();
    if(existing){
      if(existing.status==="rewarded")return edit("✅ قبلاً انجام شده.");
      if(existing.status==="penalized")return edit("⛔ جریمه شده‌ای.");
      if(existing.status==="joined")return edit("⏳ در انتظار تأیید.");
    }
    await db.prepare("INSERT INTO memberships (user_id,channel_id,status,joined_at,check_at) VALUES (?,?,?,datetime('now'),datetime('now','+"+RETENTION_HOURS+" hours'))").bind(uid,chId,"joined").run();
    const m=await db.prepare("SELECT * FROM memberships WHERE user_id=? AND channel_id=?").bind(uid,chId).first();
    const mId=m.id;
    const check=m.check_at;
    await payAction(env,db,m,"JOIN",tier.join,ch);
    await addQS(db,mId,20);
    if(tier.quiz){const opts=JSON.parse(ch.quiz_options||"[]");await sendMsg(env,uid,`❓ کوییز (+${faNum(tier.quiz)} سکه)\n📢 ${ch.title}\n\n${ch.quiz_question}`,{inline_keyboard:opts.map((o,i)=>[{text:o,callback_data:`quiz:${mId}:${i}`}])});}
    if(tier.forward){await sendMsg(env,uid,`📤 تسک فوروارد (+${faNum(tier.forward)} سکه)\n\n۱) کانال @${ch.username} را باز کن\n۲) یکی از پست‌ها را انتخاب کن\n۳) همان پست را به همین بات فوروارد کن`,{inline_keyboard:[[{text:"📢 باز کردن کانال",url:`https://ble.ir/${ch.username}`}]]});}
    return edit(`✅ عضویت ثبت شد!\n⏳ تأیید ماندگاری تا ${faDate(check)}\n\n🎁 تسک‌های پاداش کامل به پیوی‌ات آمد: کوییز + فوروارد.`);
  }
}

async function showDiscover(q,env,idx){
  const db=env.DB,uid=q.from.id;
  const u=await db.prepare("SELECT * FROM users WHERE user_id=?").bind(uid).first();
  const my=JSON.parse(u.interests||"[]");
  const all=(await db.prepare("SELECT * FROM channels WHERE status='active' AND bot_is_admin=1 AND owner_id!=?").bind(uid).all()).results;
  if(!all.length)return bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text:"😴 کمپین فعالی نیست.",parse_mode:"HTML"});
  const list=scored0(all,my);
  const pos=((idx%list.length)+list.length)%list.length;
  const{c:ch,hit}=list[pos];
  const isMatch=hit>0;
  const overlap=Math.round(hit/Math.max(my.length,1)*100);
  const g=await channelGrade(db,ch.id);
  const tier=TIERS[ch.tier]||TIERS.standard;
  const gradeEmoji={A:"🥇",B:"🥈",C:"🥉",D:"🏆"}[g.g]||"🏆";
  const rewardEmoji=tier.max>=5?"💎":"🪙";
  const m=await db.prepare("SELECT status FROM memberships WHERE user_id=? AND channel_id=?").bind(uid,ch.id).first();
  const badge=m?({joined:"⏳ در انتظار تأیید",rewarded:"✅ انجام شد",assigned:"🔘 شروع نشده",penalized:"⛔ جریمه شد"}[m.status]||""):"";
  const text=`🌟 ${ch.title} (${faNum(pos+1)}/${faNum(list.length)})\n${isMatch?`🎯 تشابه ${faNum(overlap)}٪`:"🌐 عمومی"}\n${gradeEmoji} رتبه: ${g.g}\n${rewardEmoji} پاداش: ${faNum(tier.max)} سکه${badge?"\n"+badge:""}`;
  await bale(env,"editMessageText",{chat_id:q.message.chat.id,message_id:q.message.message_id,text,parse_mode:"HTML",reply_markup:{inline_keyboard:[[{text:"🚀 شروع مأموریت",callback_data:"mission:"+ch.id}],[{text:"⏮ قبلی",callback_data:"prev:"+(pos-1)},{text:"⏭ بعدی",callback_data:"next:"+(pos+1)},{text:"🚩 گزارش",callback_data:"report:"+ch.id}]]}});
}
function scored0(all,my){const arr=all.map(c=>({c,hit:JSON.parse(c.niches||"[]").filter(t=>my.includes(t)).length}));const matched=arr.filter(x=>x.hit>0);const others=arr.filter(x=>x.hit===0);return[...matched,...others].map(x=>({...x,w:x.hit>0?2:1})).sort((a,b)=>b.w-a.w||b.hit-a.hit);}

async function handleForward(u,env,fwdUser){
  const db=env.DB,uid=u.message.from.id;
  const m=await db.prepare("SELECT m.* FROM memberships m JOIN channels c ON m.channel_id=c.id WHERE m.user_id=? AND m.forward_verified=0 AND m.status IN ('joined','rewarded') AND c.username=? ORDER BY m.id DESC LIMIT 1").bind(uid,fwdUser).first();
  if(!m){
    const pending=await db.prepare("SELECT 1 FROM memberships m JOIN channels c ON m.channel_id=c.id WHERE m.user_id=? AND m.forward_verified=0 AND m.status IN ('joined','rewarded') AND c.tier IN ('premium','guaranteed')").bind(uid).first();
    if(pending)await sendMsg(env,uid,"ℹ️ این فوروارد به هیچ تسک فعال تو مربوط نیست.\nلطفاً پست را از همان کانالی فوروارد کن که تسکش را شروع کرده‌ای.");
    return false;
  }
  const ch=await db.prepare("SELECT * FROM channels WHERE id=?").bind(m.channel_id).first();
  if(!ch)return false;
  const tier=TIERS[ch.tier]||TIERS.standard;
  if(tier.forward>0&&!m.forward_verified){
    await db.prepare("UPDATE memberships SET forward_verified=1 WHERE id=?").bind(m.id).run();
    await addQS(db,m.id,30);
    await payAction(env,db,m,"FORWARD",tier.forward,ch);
    await sendMsg(env,uid,`✅ فوروارد تأیید شد! +${faNum(tier.forward)} سکه`);
    return true;
  }
  return false;
}

async function handlePayment(u,env){
  const db=env.DB,uid=u.message.from.id;
  const payload=u.message.successful_payment.invoice_payload;
  const p=await db.prepare("SELECT * FROM payments WHERE payload=?").bind(payload).first();
  if(!p)return;
  await db.prepare("UPDATE payments SET status='paid' WHERE id=?").bind(p.id).run();
  const e=await getEconomy(db);
  const price=currentPrice(e);
  const coins=Math.floor(p.amount_toman*0.8/price);
  await db.prepare("UPDATE users SET balance=balance+? WHERE user_id=?").bind(coins,uid).run();
  await db.prepare("UPDATE economy_state SET total_minted=total_minted+?, pool_value=pool_value+? WHERE id=1").bind(coins,p.amount_toman).run();
  await logTx(db,uid,"PURCHASE_MINT",coins,(await db.prepare("SELECT balance FROM users WHERE user_id=?").bind(uid).first()).balance,`${p.amount_toman} ت`);
  await sendMsg(env,uid,`✅ پرداخت موفق!\n🪙 +${faNum(coins)} سکه به موجودیت اضافه شد.`);
}

async function handleAdmin(env,uid){
  return sendMsg(env,uid,"⚙️ پنل مدیریت");
}