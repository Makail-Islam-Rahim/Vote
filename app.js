const $ = (id) => document.getElementById(id);

const generator = $("generator");
const question = $("question");
const yay = $("yay");

const fromInput = $("fromInput");
const toInput = $("toInput");
const createBtn = $("createBtn");
const previewBtn = $("previewBtn");

const linkBox = $("linkBox");
const linkOut = $("linkOut");
const copyBtn = $("copyBtn");
const copyToast = $("copyToast");

const namesChip = $("namesChip");
const questionTitle = $("questionTitle");
const loveFrom = $("loveFrom");

const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const zone = $("zone");

const backBtn = $("backBtn");
const yayBackBtn = $("yayBackBtn");
const againBtn = $("againBtn");

const lockText = $("lockText");
const secEl = $("sec");

let noClicks = 0;
let noUnlocked = false;
let timer = null;

const noMessages = [
  "এইহ! না? 🥺",
  "প্লিজ চলো না… আমি ট্রিট দিবো 😭🍟",
  "তুমি যাকে বলবা তাকেই ভোট দিবো 😤",
  "তুমি বললে বিএনপি 😅",
  "তুমি বললে জামাত 🙈",
  "তুমি বললে কলি 😆",
  "শুধু তোমাকেই ভোট দিবো 💘",
  "চলো না প্লিজ… পরে চা/ফুচকা 😊"
];


function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function getParams(){
  const u = new URL(location.href);
  return {
    from: (u.searchParams.get("from") || "").trim(),
    to: (u.searchParams.get("to") || "").trim()
  };
}

function buildLink(from,to){
  const u = new URL(location.href);
  u.searchParams.set("from", from);
  u.searchParams.set("to", to);
  return u.toString();
}

function resetQuestion(){
  noClicks = 0;
  noUnlocked = false;

  noBtn.textContent = "NO 🙄";

  yesBtn.style.setProperty("--yesScale", "1");
  noBtn.style.setProperty("--noX", "0px");
  noBtn.style.setProperty("--noY", "0px");

  noBtn.classList.add("locked");
  noBtn.setAttribute("aria-disabled", "true");
  lockText.classList.remove("hidden");
  secEl.textContent = "5";

  if (timer) clearInterval(timer);
  timer = null;
}

function unlockNo(){
  noUnlocked = true;
  noBtn.classList.remove("locked");
  noBtn.setAttribute("aria-disabled", "false");
  lockText.classList.add("hidden");
}

function startCountdown(seconds=5){
  let s = seconds;
  secEl.textContent = String(s);

  timer = setInterval(() => {
    s -= 1;
    secEl.textContent = String(s);
    if (s <= 0){
      clearInterval(timer);
      timer = null;
      unlockNo();
    }
  }, 1000);
}

function showGenerator(){
  show(generator); hide(question); hide(yay);
  linkBox.classList.add("hidden");
}

function showQuestion(from,to){
  resetQuestion();
  hide(generator); show(question); hide(yay);

  const safeFrom = from || "Someone";
  const safeTo = to || "You";

  namesChip.textContent = `${safeFrom} → ${safeTo}`;
  questionTitle.textContent = `${safeTo}, চলো একসাথে ভোট দিতে যাই? 🗳️😄🥺`;
  loveFrom.textContent = `${safeFrom} তোমাকে একটা কথা বলতে চাই... 💌`;

  startCountdown(5);
}

/* Move NO inside zone (run away on hover) */
function moveNoRunAway(){
  const pad = 10;
  const zoneW = zone.clientWidth;
  const zoneH = zone.clientHeight;

  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;

  const baseX = noBtn.offsetLeft + w/2;
  const baseY = noBtn.offsetTop + h/2;

  const minDx = (pad + w/2) - baseX;
  const maxDx = (zoneW - pad - w/2) - baseX;

  const minDy = (pad + h/2) - baseY;
  const maxDy = (zoneH - pad - h/2) - baseY;

  const dx = minDx + Math.random() * (maxDx - minDx);
  const dy = minDy + Math.random() * (maxDy - minDy);

  noBtn.style.setProperty("--noX", `${Math.round(dx)}px`);
  noBtn.style.setProperty("--noY", `${Math.round(dy)}px`);
}

function validateNames(){
  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  if(!from || !to){
    alert("Please enter both names 🙂");
    return null;
  }
  return {from,to};
}

/* Create link */
createBtn.addEventListener("click", () => {
  const v = validateNames();
  if(!v) return;

  linkOut.value = buildLink(v.from, v.to);
  linkBox.classList.remove("hidden");
});

/* Preview */
previewBtn.addEventListener("click", () => {
  const v = validateNames();
  if(!v) return;
  showQuestion(v.from, v.to);
});

/* Copy */
copyBtn.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(linkOut.value);
    copyToast.classList.remove("hidden");
    setTimeout(()=>copyToast.classList.add("hidden"), 1200);
  }catch{
    linkOut.select();
    document.execCommand("copy");
  }
});

/* YES */
yesBtn.addEventListener("click", () => {
  hide(question);
  show(yay);
});

/* NO runs away on hover (locked or unlocked) */
noBtn.addEventListener("mouseenter", moveNoRunAway);

/* NO click only after unlock */
noBtn.addEventListener("click", () => {
  if(!noUnlocked) return;

  noClicks++;
  const idx = Math.min(noClicks - 1, noMessages.length - 1);
  noBtn.textContent = noMessages[idx];

  const scale = Math.min(1 + noClicks * 0.12, 2.2);
  yesBtn.style.setProperty("--yesScale", String(scale));
});

/* Back */
backBtn.addEventListener("click", () => {
  history.pushState({}, "", location.pathname);
  showGenerator();
});

yayBackBtn.addEventListener("click", () => {
  history.pushState({}, "", location.pathname);
  showGenerator();
});

/* Make another link */
againBtn.addEventListener("click", () => {
  history.pushState({}, "", location.pathname);
  fromInput.value = "";
  toInput.value = "";
  showGenerator();
});

/* INIT */
(function init(){
  const {from,to} = getParams();
  if(from && to){
    showQuestion(from,to);
    history.replaceState({}, "", location.pathname);
  }else{
    showGenerator();
  }
})();
