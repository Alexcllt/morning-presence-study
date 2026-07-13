const ENDPOINT = "https://script.google.com/macros/s/AKfycbxq1yb4ISh0k5to_PUJS2RRZk9gp648A_KHL4KeKrqaazDRyAF0iP9xcE5zoKjhYQ91kg/exec";
const $ = id => document.getElementById(id);

let language = localStorage.getItem("mp_language") || (navigator.language || "en").slice(0,2);
if (!I18N[language]) language = "en";
let step = 0;
let answers = JSON.parse(localStorage.getItem("mp_answers") || "{}");
let variant = localStorage.getItem("mp_variant") || (Math.random() < .5 ? "A" : "B");
localStorage.setItem("mp_variant", variant);

const priceMap = {
  france:{bands:["< 20 €","20–30 €","30–40 €","40–50 €","> 50 €"],currency:"EUR"},
  germany:{bands:["< 20 €","20–30 €","30–40 €","40–50 €","> 50 €"],currency:"EUR"},
  spain:{bands:["< 20 €","20–30 €","30–40 €","40–50 €","> 50 €"],currency:"EUR"},
  italy:{bands:["< 20 €","20–30 €","30–40 €","40–50 €","> 50 €"],currency:"EUR"},
  uk:{bands:["< £20","£20–30","£30–40","£40–50","> £50"],currency:"GBP"},
  usa:{bands:["< $25","$25–35","$35–45","$45–55","> $55"],currency:"USD"},
  canada:{bands:["< CA$25","CA$25–35","CA$35–45","CA$45–55","> CA$55"],currency:"CAD"},
  other:{bands:["< 20","20–30","30–40","40–50","> 50"],currency:"LOCAL"}
};


function conditionMet(q){
  if(!q.condition) return true;
  const value = answers[q.condition.field];
  if(Object.prototype.hasOwnProperty.call(q.condition, "equals")) return value === q.condition.equals;
  if(Object.prototype.hasOwnProperty.call(q.condition, "notEquals")) return value !== q.condition.notEquals;
  return true;
}

function activeQuestions(){
  return QUESTIONS.filter(conditionMet);
}

function t(){ return I18N[language]; }
function setText(id, value){ $(id).textContent = value; }
function optionText(key){ return t().o[key] || key; }

function hydrate(){
  document.documentElement.lang = language;
  $("languageSelect").value = language;
  setText("languageLabel", t().language);
  setText("title", t().title);
  setText("subtitle", t().subtitle);
  setText("heroText", t().hero);
  setText("beginButton", t().begin);
  setText("meta", t().meta);
  setText("privacy", t().privacy);
  setText("backButton", t().back);
  setText("nextButton", t().next);
  setText("submitButton", t().submit);
  setText("thanksTitle", t().thanks_title);
  setText("thanksText", t().thanks_text);
  setText("restartButton", t().restart);
  if (!$("surveyScreen").classList.contains("hidden")) renderQuestion();
}

$("languageSelect").addEventListener("change", e => {
  language = e.target.value;
  localStorage.setItem("mp_language", language);
  hydrate();
});

$("beginButton").addEventListener("click", () => {
  $("hero").classList.add("hidden");
  $("surveyScreen").classList.remove("hidden");
  $("progressTop").classList.remove("hidden");
  renderQuestion();
  window.scrollTo({top:0,behavior:"smooth"});
});

function priceLabels(){
  return (priceMap[answers.country || "france"] || priceMap.other).bands;
}

function fieldHTML(q){
  const stored = answers[q.id];
  if(q.type === "select"){
    return `<select class="field" name="${q.id}">
      <option value="">—</option>
      ${q.options.map(o=>`<option value="${o}" ${stored===o?"selected":""}>${optionText(o)}</option>`).join("")}
    </select>`;
  }
  if(q.type === "textarea"){
    return `<textarea class="field" name="${q.id}" placeholder="…">${stored || ""}</textarea>`;
  }
  const type = q.type === "checkbox" ? "checkbox" : "radio";
  const current = Array.isArray(stored) ? stored : [stored];
  const labels = q.id === "price_band" ? priceLabels() : null;
  return `<div class="options">${q.options.map((o,i)=>`
    <label class="option">
      <input type="${type}" name="${q.id}" value="${o}" ${current.includes(o)?"checked":""}>
      <span>${labels ? labels[i] : optionText(o)}</span>
    </label>`).join("")}</div>`;
}

function saveCurrent(){
  const q = activeQuestions()[step];
  const wrap = $("questionWrap");
  if(q.type === "checkbox"){
    answers[q.id] = [...wrap.querySelectorAll(`input[name="${q.id}"]:checked`)].map(el=>el.value);
  }else{
    const el = wrap.querySelector(`[name="${q.id}"]`);
    answers[q.id] = el ? el.value.trim() : "";
  }
  if(q.id === "product_use" && answers.product_use === "product_never"){
    delete answers.product_types;
  }
  localStorage.setItem("mp_answers", JSON.stringify(answers));
}

function valid(q){
  if(!q.required) return true;
  const v = answers[q.id];
  return Array.isArray(v) ? v.length > 0 : String(v || "").trim().length > 0;
}

function renderQuestion(error=false){
  const active = activeQuestions();
  if(step >= active.length) step = Math.max(0, active.length - 1);
  const q = active[step];
  setText("chapterName", t().chapters[q.chapter]);
  setText("chapterLine", t().chapterLines[q.chapter]);
  setText("progressTop", t().progress.replace("{current}", String(step+1).padStart(2,"0")).replace("{total}", active.length));
  const concept = q.id === "concept_interest" ? `<p class="concept-note">${variant==="A"?t().conceptA:t().conceptB}</p>` : "";
  $("questionWrap").innerHTML = `
    <div class="question-number">${String(step+1).padStart(2,"0")} / ${active.length}</div>
    ${concept}
    <h2 class="question-title">${t().q[q.id]}</h2>
    ${fieldHTML(q)}
    ${error?`<p class="error">${t().required}</p>`:""}
  `;
  $("backButton").style.visibility = step===0 ? "hidden":"visible";
  $("nextButton").classList.toggle("hidden", step===active.length-1);
  $("submitButton").classList.toggle("hidden", step!==active.length-1);
  window.scrollTo({top:0,behavior:"smooth"});
}

$("nextButton").addEventListener("click", ()=>{
  saveCurrent();
  if(!valid(activeQuestions()[step])) return renderQuestion(true);
  step++;
  renderQuestion();
});

$("backButton").addEventListener("click", ()=>{
  saveCurrent();
  if(step>0) step--;
  renderQuestion();
});

$("surveyForm").addEventListener("submit", async e=>{
  e.preventDefault();
  saveCurrent();
  if(!valid(activeQuestions()[step])) return renderQuestion(true);

  const currencyInfo = priceMap[answers.country || "other"];
  const payload = {
    ...answers,
    study_language: language,
    concept_variant: variant,
    price_display_currency: currencyInfo.currency,
    submitted_at: new Date().toISOString(),
    respondent_id: localStorage.getItem("mp_respondent_id") || crypto.randomUUID(),
    device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop"
  };
  localStorage.setItem("mp_respondent_id", payload.respondent_id);
  $("submitButton").disabled = true;

  try{
    if(ENDPOINT.startsWith("PASTE_")) throw new Error("Endpoint missing");
    const body = new URLSearchParams();
    body.set("payload", JSON.stringify(payload));
    await fetch(ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
    $("surveyScreen").classList.add("hidden");
    $("progressTop").classList.add("hidden");
    $("thanksScreen").classList.remove("hidden");
    localStorage.removeItem("mp_answers");
    window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){
    alert("Add your Google Apps Script /exec URL in app.js before publishing.");
    $("submitButton").disabled = false;
  }
});

$("restartButton").addEventListener("click", ()=>{
  answers = {};
  step = 0;
  variant = Math.random() < .5 ? "A":"B";
  localStorage.setItem("mp_variant",variant);
  localStorage.removeItem("mp_answers");
  $("thanksScreen").classList.add("hidden");
  $("hero").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

hydrate();
