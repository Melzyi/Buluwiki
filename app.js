const BASE_URL = 'https://raw.githubusercontent.com/Melzyi/Buluwiki/main/';

// Remove sufixos que variam entre os JSONs (_solo, _single, número final),
// deixando só o "nome base" do monstro — usado tanto pra achar a imagem
// quanto pra achar o mega item dele, não importa como cada JSON escreveu o nome.
function cleanMonsterKey(rawName) {
  return rawName.replace(/_solo/g,'').replace(/_single$/,'').replace(/_\d+$/,'');
}

// ══════════ MEGA ITEMS ══════════
let megaItems = {};
let megaItemsByCleanKey = {};
let megaItemsReady = fetch(BASE_URL + 'data/mega_items.json')
  .then(function(r){ return r.json(); })
  .then(function(data){
    megaItems = data;
    Object.keys(megaItems).forEach(function(k){ megaItemsByCleanKey[cleanMonsterKey(k)] = megaItems[k]; });
  })
  .catch(function(){ console.warn('mega_items.json não pôde ser carregado'); });

function getMegaItem(rawName) {
  return megaItems[rawName] || megaItemsByCleanKey[cleanMonsterKey(rawName)] || null;
}

// ══════════ MONSTER TYPES ══════════
const MONSTER_TYPES = ['common','dragon','earth','evil','fire','ice','lightning','mythic','spirit','water','wind'];
const MONSTER_TYPES_WITH_UMBRAL = MONSTER_TYPES.concat(['umbral']);

function renderTypeFilterButtons(containerId, opts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const types = opts.includeUmbral ? MONSTER_TYPES_WITH_UMBRAL : MONSTER_TYPES;
  const btnClass = opts.btnClass;
  const allLabel = opts.allLabel || 'All';
  const buttonsHTML = ['<button class="'+btnClass+' active" data-type="all">'+esc(allLabel)+'</button>']
    .concat(types.map(function(t) {
      return '<button class="'+btnClass+'" data-type="'+t+'">'+esc(t.charAt(0).toUpperCase()+t.slice(1))+'</button>';
    }))
    .join('');
  container.insertAdjacentHTML('beforeend', buttonsHTML);
}

renderTypeFilterButtons('skills-type-filters', { btnClass: 'filter-btn skill-filter-btn', allLabel: 'All', includeUmbral: true });
renderTypeFilterButtons('potentials-filters', { btnClass: 'filter-btn potential-filter-btn', allLabel: 'All Types', includeUmbral: true });

// ══════════ PROGRESS BAR ══════════
window.addEventListener('scroll', function() {
  const bar = document.getElementById('progress-bar');
  const scrollTop = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
}, { passive: true });

// ══════════ STATS COUNTER ══════════
setTimeout(function() {
  document.querySelectorAll('.hstat-num[data-target]').forEach(function(el) {
    const target = parseInt(el.dataset.target);
    let val = 0;
    const step = target / 50;
    const tick = setInterval(function() {
      val = Math.min(val + step, target);
      el.textContent = Math.floor(val);
      if (val >= target) clearInterval(tick);
    }, 20);
  });
}, 300);

// ══════════ THEME TOGGLE (topbar mobile + sidebar desktop) ══════════
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

function syncThemeIcons(t) {
  var i1 = document.getElementById('themeIcon');
  var i2 = document.getElementById('themeIconDesktop');
  var icon = t === 'dark' ? '🌙' : '☀️';
  if (i1) i1.textContent = icon;
  if (i2) i2.textContent = icon;
}
syncThemeIcons(savedTheme);

function toggleTheme() {
  const t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  syncThemeIcons(t);
}
['themeToggle','themeToggleDesktop'].forEach(function(id){
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', toggleTheme);
});

// ══════════ SIDEBAR (mobile drawer) ══════════
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');

function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }
if (menuToggle) menuToggle.addEventListener('click', openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// ══════════ TROCA DE IMAGEM SEM "PISCAR" ══════════
function swapImgSmooth(imgEl, newSrc) {
  if (!imgEl || imgEl.src === newSrc) return;
  const pre = new Image();
  pre.onload = function() { imgEl.src = newSrc; };
  pre.onerror = function() { imgEl.src = newSrc; };
  pre.src = newSrc;
}

// ══════════ DATA ══════════
let monsterData = {};
let monsterDataReady = fetch(BASE_URL + 'data/anniversary_monsters.json')
  .then(function(r){ return r.json(); })
  .then(function(data){ monsterData = data; })
  .catch(function(){ console.warn('anniversary_monsters.json não pôde ser carregado'); });

let legendaryCupData = {};
let legendaryCupDataReady = fetch(BASE_URL + 'data/legendary_cup.json')
  .then(function(r){ return r.json(); })
  .then(function(data){
    legendaryCupData = data;
    if (window.__renderLCBanner) window.__renderLCBanner();
    if (window.__updateLCBadge) window.__updateLCBadge();
  })
  .catch(function(){ console.warn('legendary_cup.json não pôde ser carregado'); });

const typeData = {
  common:{weak:['earth','fire','lightning','water','wind'],strong:[],openingSkill:{name:'Chaos Enchantment',effect:'Create a Chaos Enchantment to reverse the rules of world. For next 5 turns, Common type skill has advantage on all other type monsters.'}},
  dragon:{weak:['dragon','mythic'],strong:['dragon'],openingSkill:{name:'Drakflame Enchantment',effect:'Create a Drakflame Enchantment to enhance dragon power. For next 5 turns, Dragon type skill has advantage on Mythic monsters.'}},
  earth:{weak:['wind','mythic'],strong:['common','lightning'],openingSkill:{name:'Sandstorm Enchantment',effect:'Create a Sandstorm Enchantment to enhance earth power. For next 5 turns, Earth type skill has advantage on Wind monsters.'}},
  evil:{weak:['spirit','umbral'],strong:['spirit'],openingSkill:{name:'Shade Enchantment',effect:'Create a Shade Enchantment to enhance evil power. For next 5 turns, Spirit type skill does not have advantage on Evil monsters.'}},
  fire:{weak:['mythic','water'],strong:['common','umbral','ice'],openingSkill:{name:'Wildfire Enchantment',effect:'Create a Wildfire Enchantment to enhance fire power. For next 5 turns, Fire type skill has advantage on Water monsters.'}},
  ice:{weak:['fire','wind'],strong:['mythic','wind'],openingSkill:{name:'Frozen Enchantment',effect:'Create a Frozen Enchantment to enhance ice power. For next 5 turns, Ice type skill has advantage on Fire monsters.'}},
  lightning:{weak:['earth','spirit'],strong:['common','water','wind','umbral'],openingSkill:{name:'Charge Enchantment',effect:'Create a Charge Enchantment to enhance lightning power. For next 5 turns, Lightning type skill has advantage on Earth monsters.'}},
  mythic:{weak:['ice'],strong:['dragon','earth','fire','water'],openingSkill:{name:'Ancient Enchantment',effect:'Create an Ancient Enchantment to enhance mythic power. For next 5 turns, Mythic type skill has advantage on Ice monsters.'}},
  spirit:{weak:['evil','umbral'],strong:['evil','lightning'],openingSkill:{name:'Psycho Enchantment',effect:'Create a Psycho Enchantment to enhance psychic power. For next 5 turns, Evil type skill does not have advantage on Spirit monsters.'}},
  water:{weak:['lightning','mythic'],strong:['common','fire'],openingSkill:{name:'Rainstorm Enchantment',effect:'Create a Rainstorm Enchantment to enhance water power. For next 5 turns, Water type skill has advantage on Lightning monsters.'}},
  wind:{weak:['lightning','ice'],strong:['earth','ice','common'],openingSkill:{name:'Tornado Enchantment',effect:'Create a Tornado Enchantment to enhance wind power. For next 5 turns, Wind type skill does not have advantage on Lightning monsters.'}},
  umbral:{weak:['fire','lightning'],strong:['evil','spirit'],openingSkill:null}
};

// ══════════ HELPERS ══════════
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatMonsterName(filename) {
  return filename.replace(/_\d+$/,'').replace(/_solo/g,'').replace(/_single$/,'').split('_').map(function(w){ return w.charAt(0).toUpperCase()+w.slice(1); }).join(' ');
}
function formatMonsterDisplayName(rawName) {
  const key = cleanMonsterKey(rawName);
  const fixed = MONSTER_NAME_FIXES[key] || key;
  return fixed.split('_').map(function(w){ return w.charAt(0).toUpperCase()+w.slice(1); }).join(' ');
}

// ══════════ MONSTER IMAGES ══════════
let monsterImagesManifest = {};
let monsterImagesManifestReady = fetch(BASE_URL + 'data/monster_images_manifest.json')
  .then(function(r){ return r.json(); })
  .then(function(data){ monsterImagesManifest = data; })
  .catch(function(){ console.warn('monster_images_manifest.json não pôde ser carregado'); });

const MONSTER_VARIANT_ALIASES = { natal: 'christmas', first_birthday: '1th' };

const MONSTER_NAME_FIXES = {
  icefishy: 'icyfishy',
  areochett: 'aerochtte',
  gaiachett: 'gaiachette',
  ultichett: 'ultichette',
  hydrellion: 'hydreilion'
};

function getMonsterImage(type, rawName, variant) {
  variant = MONSTER_VARIANT_ALIASES[variant] || variant || 'default';
  let key = cleanMonsterKey(rawName);
  key = MONSTER_NAME_FIXES[key] || key;
  const entry = monsterImagesManifest[type] && monsterImagesManifest[type][key];
  if (!entry) return BASE_URL + 'imagens/placeholder.webp';
  const variantEntry = entry[variant] || entry['default'];
  if (!variantEntry) return BASE_URL + 'imagens/placeholder.webp';
  const path = Object.values(variantEntry)[0];
  return BASE_URL + path;
}

// ══════════ ANNIVERSARY ══════════
function loadMonsters(num) {
  const display = document.getElementById('monster-display');
  const data = monsterData[num];
  if (!data) { display.innerHTML = ''; return; }
  const numStr = num.toString().padStart(2,'0');
  let html = '';
  for (const type in data) {
    const typeKey = type.toLowerCase();
    const cardGlow = TYPE_COLORS[typeKey] || '#f2a93c';
    const cardBg = BASE_URL+'imagens/book_background/'+(BOOK_BG[typeKey] || 'monster_book_common.webp');
    html += '<div class="monster-type-section"><div class="type-header"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/type_icon/'+esc(type)+'_type_icon.png" class="type-icon" alt="'+esc(type)+' type icon"><div class="type-name">'+esc(type)+' Type</div></div>';
    data[type].forEach(function(group, idx) {
      const lineId = 'line-'+type+'-'+idx;
      html += '<div class="evolution-line-container" id="'+lineId+'">';
      if (group.variants.length > 0) {
        html += '<div class="variant-buttons"><button class="variant-btn active" data-variant="normal" data-line-id="'+lineId+'">Normal</button>';
        group.variants.forEach(function(v) {
          const vName = v.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
          html += '<button class="variant-btn" data-variant="'+esc(v)+'" data-line-id="'+lineId+'">'+esc(vName)+'</button>';
        });
        html += '</div>';
      }
      html += '<div class="evolution-stages">';
      group.line.forEach(function(monster, i) {
        const isMega = !!getMegaItem(monster) || monster.includes('_04') || (monster.includes('_03') && group.line.length===3) || (monster.includes('_02') && group.line.length===2);
        html += '<div class="evolution-stage" style="background-image:url(\''+cardBg+'\');--card-glow:'+cardGlow+';"><img loading="lazy" decoding="async" src="'+getMonsterImage(type, monster, 'default')+'" class="evo-stage-img'+(isMega?' mega-evolution':'')+'" data-base="'+esc(monster)+'" data-type="'+esc(type)+'" data-num="'+numStr+'" alt="'+esc(formatMonsterDisplayName(monster))+'"><div class="evolution-stage-name">'+esc(formatMonsterDisplayName(monster))+'</div></div>';
        if (i < group.line.length-1) html += '<div class="evolution-arrow">→</div>';
      });
      html += '</div>';
      const lastM = group.line[group.line.length-1];
      if (getMegaItem(lastM)) {
        const mi = getMegaItem(lastM);
        html += '<div class="mega-item-container"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_evolution_items/'+esc(mi.image)+'.webp" alt="Mega evolution item"><div class="mega-item-label">'+esc(mi.name)+'</div></div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  display.innerHTML = html;
  display.querySelectorAll('.variant-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const lineId = this.dataset.lineId;
      const variant = this.dataset.variant;
      const container = document.getElementById(lineId);
      container.querySelectorAll('.variant-btn').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      container.querySelectorAll('.evo-stage-img').forEach(function(img) {
        const base = img.dataset.base, tp = img.dataset.type;
        swapImgSmooth(img, getMonsterImage(tp, base, variant==='normal' ? 'default' : variant));
      });
    });
  });
}

document.querySelectorAll('.anniversary-card').forEach(function(card) {
  card.addEventListener('click', async function() {
    await monsterDataReady;
    loadMonsters(parseInt(this.dataset.anniversary));
    setTimeout(function(){ document.getElementById('monster-display').scrollIntoView({behavior:'smooth',block:'start'}); }, 100);
  });
});

// ══════════ YEAR TAB ══════════
// The JSON can be one object (legacy, single champion) or an array of entries —
// e.g. this year's revealed champion plus a { comingSoon: true, year: 2026 } placeholder
// for the next one, so both can sit side by side as soon as it's ready.
let monsterOfTheYearEntries = [];
let yearShinyState = {};
let monsterOfTheYearReady = fetch(BASE_URL + 'data/monster_of_the_year/monster_of_the_year.json')
  .then(function(r){ return r.json(); })
  .then(function(data){ monsterOfTheYearEntries = Array.isArray(data) ? data : [data]; })
  .catch(function(){ console.warn('monster_of_the_year.json não pôde ser carregado'); monsterOfTheYearEntries = []; });

function renderYearTab() {
  const grid = document.getElementById('year-grid');
  if (!grid) return;
  if (!monsterOfTheYearEntries.length) { grid.innerHTML = '<div class="no-results">No Monster of the Year data yet</div>'; return; }

  if (!grid.dataset.built) {
    grid.innerHTML = monsterOfTheYearEntries.map(function(entry, idx) {
      if (entry.comingSoon) {
        return '<div class="year-card year-card-soon">'
          + '<div class="year-card-year">'+esc(entry.year)+'</div>'
          + '<div class="year-card-soon-icon">🔒</div>'
          + '<div class="year-card-soon-label">Revealing Soon</div>'
          + '</div>';
      }
      return '<div class="year-card" data-idx="'+idx+'">'
        + '<div class="year-card-year">'+esc(entry.year)+(entry.title ? ' · '+esc(entry.title) : '')+'</div>'
        + '<div class="main-monster-card"><img loading="lazy" decoding="async" class="main-monster-img mega-evolution" data-role="main" src="" alt=""></div>'
        + '<div class="evolution-line" data-role="line"></div>'
        + '<button class="shiny-toggle" data-role="shiny">✦ Toggle Shyne Variant</button>'
        + '</div>';
    }).join('');
    grid.dataset.built = '1';

    grid.querySelectorAll('.year-card[data-idx]').forEach(function(card) {
      const idx = parseInt(card.dataset.idx, 10);
      const btn = card.querySelector('[data-role="shiny"]');
      if (!btn) return;
      btn.addEventListener('click', function() {
        yearShinyState[idx] = !yearShinyState[idx];
        renderYearCard(idx);
        btn.textContent = yearShinyState[idx] ? '✦ Show Normal Version' : '✦ Toggle Shyne Variant';
      });
    });
  }

  monsterOfTheYearEntries.forEach(function(entry, idx) {
    if (!entry.comingSoon) renderYearCard(idx);
  });
}

function renderYearCard(idx) {
  const entry = monsterOfTheYearEntries[idx];
  if (!entry || entry.comingSoon) return;
  const variant = yearShinyState[idx] ? 'shyne' : 'default';
  const grid = document.getElementById('year-grid');
  const card = grid && grid.querySelector('.year-card[data-idx="'+idx+'"]');
  if (!card) return;

  const last = entry.line[entry.line.length - 1];
  const mainImg = card.querySelector('[data-role="main"]');
  if (mainImg) {
    mainImg.alt = last.name;
    swapImgSmooth(mainImg, getMonsterImage(entry.type, last.key, variant));
  }

  const lineEl = card.querySelector('[data-role="line"]');
  if (lineEl) {
    if (!lineEl.dataset.built) {
      lineEl.innerHTML = entry.line.map(function(m){
        return '<div class="evolution-card"><img loading="lazy" decoding="async" class="evo-img" data-key="'+esc(m.key)+'" src="" alt="'+esc(m.name)+'"><div class="evolution-name">'+esc(m.name)+'</div></div>';
      }).join('');
      lineEl.dataset.built = '1';
    }
    lineEl.querySelectorAll('.evo-img').forEach(function(img){
      swapImgSmooth(img, getMonsterImage(entry.type, img.dataset.key, variant));
    });
  }
}

Promise.all([monsterOfTheYearReady, monsterImagesManifestReady]).then(renderYearTab);

// ══════════ LC PRIZES ══════════
let lcPrizesData = null;

async function loadLCPrizes() {
  if (lcPrizesData) return;
  try {
    const response = await fetch(BASE_URL + 'data/legendary_cup_rank.json');
    lcPrizesData = await response.json();
  } catch (error) {
    console.error('Error loading LC prizes:', error);
  }
}

function getPrizeIcon(itemName, preferredType) {
  const name = itemName.toLowerCase();

  if (name.includes('ice cream')) return BASE_URL + 'imagens/itens/candys/ice_cream.webp';
  if (name.includes('lollipop')) return BASE_URL + 'imagens/itens/candys/lollipop.webp';
  if (name.includes('candy')) return BASE_URL + 'imagens/itens/candys/candy.webp';
  if (name.includes('glass cup')) return BASE_URL + 'imagens/itens/candys/glass_cup.webp';
  if (name.includes('monster ticket')) return BASE_URL + 'imagens/itens/ticket/monster_ticket.png';
  if (name.includes('item draw ticket')) return BASE_URL + 'imagens/itens/ticket/item_draw_ticket.png';
  if (name.includes('memory feather')) return BASE_URL + 'imagens/itens/skill/memory_feather.webp';

  if (name.includes('volcano armor'))    return BASE_URL + 'imagens/mega_evolution_items/volcagon_evo_volcano_armor.webp';
  if (name.includes('saurpunch'))        return BASE_URL + 'imagens/mega_evolution_items/ultisaur_evo_saurpunch.webp';
  if (name.includes('crystal protect'))  return BASE_URL + 'imagens/mega_evolution_items/ardizlord_evo_crystal_protect.webp';
  if (name.includes('heavenly feather')) return BASE_URL + 'imagens/mega_evolution_items/ventragon_evo_heavenly_feather.webp';
  if (name.includes('tidal might'))      return BASE_URL + 'imagens/mega_evolution_items/aquarion_evo_tidal_might.webp';
  if (name.includes('burning wing'))     return BASE_URL + 'imagens/mega_evolution_items/king_lion_evo_burning_wing.webp';
  if (name.includes('oceanspirit'))      return BASE_URL + 'imagens/mega_evolution_items/sqauidon_evo_oceanspirit.webp';
  if (name.includes('king bear claw'))   return BASE_URL + 'imagens/mega_evolution_items/king_bear_evo_king_bear_claw.webp';
  if (name.includes('feather of tribe')) return BASE_URL + 'imagens/mega_evolution_items/charmedard_evo_feather_of_tribe.webp';
  if (name.includes('forgotten pearl'))  return BASE_URL + 'imagens/mega_evolution_items/captain_due_evo_porgotten_pearl.webp';
  if (name.includes('energy topaz'))     return BASE_URL + 'imagens/mega_evolution_items/alphamid_evo_energy_topaz.webp';
  if (name.includes('psycho spike'))     return BASE_URL + 'imagens/mega_evolution_items/psychobra_evo_psycho_spike.webp';
  if (name.includes('thunder horn'))     return BASE_URL + 'imagens/mega_evolution_items/thunder_demon_evo_thunder_horn.webp';
  if (name.includes('duo hammer'))       return BASE_URL + 'imagens/mega_evolution_items/polar_ogre_evo_duo_hammer.webp';
  if (name.includes('frost nutrition'))  return BASE_URL + 'imagens/mega_evolution_items/snowlomon_evo_frost_nutrition.webp';
  if (name.includes('puddin crown'))     return BASE_URL + 'imagens/mega_evolution_items/puuking_evo_puddin_crown.webp';
  if (name.includes('fortune crest'))   return BASE_URL + 'imagens/mega_evolution_items/fortunarch_evo_fortune_crest.webp';
  if (name.includes('glacial armor'))   return BASE_URL + 'imagens/mega_evolution_items/froscorium_evo_glacial_armor.webp';

  const monsterMap = {
    'kiric': 'mythic', 'kenga': 'dragon', 'arctery': 'mythic', 'lievi': 'dragon',
    'griffie': 'mythic', 'kolter': 'mythic', 'glacic': 'dragon', 'pandy': 'ice',
    'grety': 'mythic', 'kruso': 'dragon', 'lampiz': 'dragon', 'medy': 'mythic',
    'blazhin': 'dragon', 'voltio': 'mythic', 'necio': 'evil', 'nighty': 'dragon',
    'whindz': 'wind'
  };

  for (const [monsterName, type] of Object.entries(monsterMap)) {
    if (name.includes(monsterName)) {
      // Se sabemos o tipo real da edição (vindo do legendary_cup.json), ele manda:
      // o mapa fixo acima é só um "chute" de reserva e pode estar desatualizado
      // em relação ao manifesto de imagens, causando ícone quebrado.
      const realType = preferredType || type;
      const img = getMonsterImage(realType, monsterName, 'default');
      if (img.indexOf('placeholder.webp') === -1) return img;
      // se o tipo preferido não bateu no manifesto, tenta o tipo do mapa fixo como reserva
      if (preferredType && preferredType !== type) return getMonsterImage(type, monsterName, 'default');
      return img;
    }
  }

  return BASE_URL + 'imagens/logos/bulu_monster_logo.png';
}

function parsePrizes(prizeString, preferredType) {
  const prizes = [];
  const parts = prizeString.split(',').map(s => s.trim());
  parts.forEach(part => {
    const match = part.match(/^(\d+)\s+(.+?)(?:\s+\(.*\))?$/);
    if (match) {
      prizes.push({ name: match[2], text: part, icon: getPrizeIcon(match[2], preferredType), quantity: match[1] });
    } else {
      const itemName = part.replace(/\(.*\)/, '').trim();
      prizes.push({ name: itemName, text: part, icon: getPrizeIcon(itemName, preferredType), quantity: '1' });
    }
  });
  return prizes;
}

function generatePrizesHTML(weekNumber, editionName) {
  if (!lcPrizesData || !lcPrizesData.weeks) return '';
  const prizeData = lcPrizesData.weeks.find(w => w.number === weekNumber && w.name === editionName);
  if (!prizeData) return '';

  // Busca o tipo real da edição no legendary_cup.json (a mesma fonte que faz
  // as imagens do carrossel do topo funcionarem) pra usar como preferência
  // na hora de achar o ícone do monstro premiado.
  let preferredType = null;
  const weekKey = 'week_' + weekNumber;
  if (legendaryCupData[weekKey] && legendaryCupData[weekKey].editions) {
    const ed = legendaryCupData[weekKey].editions.find(e => e.name === editionName);
    if (ed) preferredType = ed.type;
  }

  let html = '<div class="prizes-section" id="prizes-'+weekNumber+'-'+editionName.replace(/ /g,'-')+'">';
  html += '<div class="prizes-title">🏆 Rankings & Rewards</div>';
  html += '<div class="rank-prizes">';

  const ranks = [
    { key: '1', label: '1st Place' },
    { key: '2', label: '2nd Place' },
    { key: '3', label: '3rd Place' },
    { key: '4_10', label: '4th - 10th' }
  ];

  ranks.forEach(rank => {
    if (!prizeData[rank.key]) return;
    html += '<div class="rank-row"><div class="rank-label">' + rank.label + '</div><div class="prize-items">';
    parsePrizes(prizeData[rank.key], preferredType).forEach(prize => {
      html += '<div class="prize-item"><img loading="lazy" decoding="async" src="' + prize.icon + '" class="prize-icon" alt="' + esc(prize.name) + '" onerror="this.onerror=null;this.src=\'' + BASE_URL + 'imagens/placeholder.webp\';"><span class="prize-text">' + esc(prize.text) + '</span></div>';
    });
    html += '</div></div>';
  });

  html += '</div>';

  if (lcPrizesData['standard premiums']) {
    html += '<div class="standard-prizes"><div class="standard-prizes-title">Standard Rewards (11th - 1000th)</div><div class="rank-prizes">';
    const standardRanks = [
      { key: '11_20', label: '11th - 20th' },
      { key: '21_50', label: '21st - 50th' },
      { key: '51_100', label: '51st - 100th' },
      { key: '101_300', label: '101st - 300th' },
      { key: '301_500', label: '301st - 500th' },
      { key: '501_1000', label: '501st - 1000th' }
    ];
    standardRanks.forEach(rank => {
      const prizeText = lcPrizesData['standard premiums'][rank.key];
      if (!prizeText) return;
      html += '<div class="rank-row"><div class="rank-label">' + rank.label + '</div><div class="prize-items">';
      parsePrizes(prizeText, preferredType).forEach(prize => {
        html += '<div class="prize-item"><img loading="lazy" decoding="async" src="' + prize.icon + '" class="prize-icon" alt="' + esc(prize.name) + '" onerror="this.onerror=null;this.src=\'' + BASE_URL + 'imagens/placeholder.webp\';"><span class="prize-text">' + esc(prize.text) + '</span></div>';
      });
      html += '</div></div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

// ══════════ LEGENDARY CUPS ══════════
async function loadLegendaryCupWithPrizes() {
  await legendaryCupDataReady;
  loadLegendaryCups();
  await loadLCPrizes();
  injectPrizesIntoDOM();
}

function injectPrizesIntoDOM() {
  if (!lcPrizesData) return;
  document.querySelectorAll('.edition-poster').forEach(function(container) {
    if (container.querySelector('.prizes-section')) return;
    var week = container.dataset.week;
    var editionName = container.dataset.edition;
    var html = generatePrizesHTML(week, editionName);
    if (!html) return;
    var btn = container.querySelector('.mi-open-btn');
    if (btn) btn.insertAdjacentHTML('beforebegin', html);
    else container.insertAdjacentHTML('beforeend', html);
  });
}

function loadLegendaryCups() {
  const display = document.getElementById('legendary-display');
  let html = '';
  for (const weekKey in legendaryCupData) {
    const weekNum = weekKey.replace('week_','');
    html += '<div class="week-section"><div class="week-title">Week ' + weekNum + '</div><div class="edition-grid">';
    legendaryCupData[weekKey].editions.forEach(function(edition, editionIndex) {
      const edId = weekKey+'-'+editionIndex;
      const hasVariants = edition.monsters.some(function(m){return m.hasVariant;});
      const typeKey = (edition.type||'').toLowerCase();
      const typeGlow = TYPE_COLORS[typeKey] || '#f2a93c';
      html += '<div class="edition-poster" id="edition-'+edId+'" data-week="'+weekNum+'" data-edition="'+esc(edition.name)+'" style="--card-glow:'+typeGlow+';">';
      html += '<div class="edition-poster-art">';
      html += '<img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/lc_banner/'+esc(edition.banner)+'" alt="'+esc(edition.name)+'" class="edition-poster-bg">';
      html += '<div class="edition-poster-scrim"></div>';
      html += '<div class="edition-poster-top">';
      html += '<span class="edition-type-badge" style="color:'+typeGlow+';border-color:'+typeGlow+'88;background:'+typeGlow+'22;">'+esc(edition.type)+'</span>';
      html += '<button class="prizes-chip" data-toggle-prizes aria-label="Ver rankings e premiações"><span class="prizes-chip-icon">✦</span>Prizes</button>';
      html += '</div>';
      html += '<div class="edition-poster-monsters">';
      edition.monsters.forEach(function(monster,i) {
        const isMega = monster.hasMega||false;
        html += '<div class="poster-monster"><img loading="lazy" decoding="async" src="'+getMonsterImage(edition.type, monster.name, 'default')+'" alt="'+esc(formatMonsterDisplayName(monster.name))+'" class="legendary-monster-img'+(isMega?' mega-evolution':'')+'" data-base="'+esc(monster.name)+'" data-type="'+esc(edition.type)+'" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.6)) drop-shadow(0 0 10px '+typeGlow+'bb);"><div class="poster-monster-name">'+esc(formatMonsterDisplayName(monster.name))+'</div></div>';
        if (i < edition.monsters.length-1) html += '<div class="evolution-arrow">→</div>';
      });
      html += '</div></div>';
      const lastM = edition.monsters[edition.monsters.length-1];
      const lastMegaItem = getMegaItem(lastM.name);
      html += '<div class="edition-poster-bottom"><div class="edition-name">'+esc(edition.name)+'</div>';
      if (hasVariants) {
        html += '<div class="variant-buttons"><button class="variant-btn active" data-edition-id="'+edId+'" data-variant="normal">Normal</button><button class="variant-btn" data-edition-id="'+edId+'" data-variant="shyne">Shyne</button></div>';
      }
      if (lastM.hasMega && lastMegaItem) {
        html += '<div class="mega-item-container"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_evolution_items/'+esc(lastMegaItem.image)+'.webp" alt="Mega evolution item"><div class="mega-item-label">'+esc(lastMegaItem.name)+'</div></div>';
      }
      html += '<button class="mi-btn mi-open-btn" data-lc="' + esc(edition.name) + '">View Status <span class="mi-btn-arrow">→</span></button></div>';
      html += '</div>';
    });

    html += '</div></div>';
  }
  display.innerHTML = html;

  display.addEventListener('click', function(e) {
    var btn = e.target.closest('.mi-open-btn');
    if (btn) openMonsterInfo(btn.dataset.lc);
  });

  display.addEventListener('click', function(e) {
    var el = e.target.closest('[data-toggle-prizes]');
    if (!el) return;
    const container = el.closest('.edition-poster');
    const prizesSection = container.querySelector('.prizes-section');
    if (prizesSection) prizesSection.classList.toggle('active');
  });

  display.querySelectorAll('.variant-btn[data-edition-id]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const edId = this.dataset.editionId, variant = this.dataset.variant;
      const container = document.getElementById('edition-'+edId);
      container.querySelectorAll('.variant-btn').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      container.querySelectorAll('.legendary-monster-img').forEach(function(img) {
        const base=img.dataset.base,tp=img.dataset.type;
        swapImgSmooth(img, getMonsterImage(tp, base, variant==='shyne' ? 'shyne' : 'default'));
      });
    });
  });
}

// ══════════ EVENTS ══════════
// One JSON file per year (data/event/events_<year>.json). Add new years here
// as they go live — everything else (tabs, grid, modal) picks them up automatically.
const EVENT_YEARS = [2025];
let eventsDataByYear = {};
let currentEventsYear = EVENT_YEARS[EVENT_YEARS.length - 1];

async function loadEventsData(year) {
  if (eventsDataByYear[year]) return eventsDataByYear[year];
  try {
    const res = await fetch(BASE_URL + 'data/event/events_' + year + '.json');
    const data = await res.json();
    eventsDataByYear[year] = data;
    return data;
  } catch (e) {
    console.warn('events_' + year + '.json não pôde ser carregado');
    return null;
  }
}

function renderEventsYearTabs() {
  const container = document.getElementById('events-year-tabs');
  if (!container) return;
  container.innerHTML = EVENT_YEARS.slice().reverse().map(function(y) {
    return '<button class="events-year-btn' + (y === currentEventsYear ? ' active' : '') + '" data-year="' + y + '">' + y + '</button>';
  }).join('');
  container.querySelectorAll('.events-year-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const year = parseInt(this.dataset.year, 10);
      if (year === currentEventsYear) return;
      currentEventsYear = year;
      container.querySelectorAll('.events-year-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      loadEventsTab();
    });
  });
}

function formatEventDate(ev) {
  if (!ev.date) return 'Data a confirmar';
  const d = new Date(ev.date + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getEventStatus(ev) {
  if (!ev.date) return null;
  const now = new Date();
  const d = new Date(ev.date + 'T00:00:00');
  return now < d ? 'upcoming' : null;
}

async function loadEventsTab() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  createSkeletons('events-grid', 6, 'event');
  const data = await loadEventsData(currentEventsYear);
  if (!data || !data.length) {
    grid.innerHTML = '<div class="events-empty">Nenhum evento encontrado para ' + currentEventsYear + '.</div>';
    return;
  }
  renderEventsGrid(data);
}

function renderEventsGrid(events) {
  const grid = document.getElementById('events-grid');
  grid.innerHTML = events.map(function(ev) {
    const status = getEventStatus(ev);
    const statusLabel = status === 'upcoming' ? 'Em Breve' : '';
    const accent = ev.accent || '#f2a93c';
    const bannerUrl = BASE_URL + 'imagens/banner/' + ev.banner;
    const groups = ev.groups || [];
    const lineCount = groups.length;
    const typeChips = groups.map(function(g) {
      const c = TYPE_COLORS[(g.type || '').toLowerCase()] || accent;
      return '<span class="event-type-dot" style="background:' + c + ';" title="' + esc(g.type) + '"></span>';
    }).join('');
    return '<div class="event-card" data-event-id="' + esc(ev.id) + '" style="--ev-glow:' + accent + ';" tabindex="0" role="button" aria-label="' + esc(ev.event) + '">' +
      '<div class="event-card-art">' +
        '<img loading="lazy" decoding="async" src="' + bannerUrl + '" alt="' + esc(ev.event) + '" class="event-card-bg">' +
        '<div class="event-card-scrim"></div>' +
        (statusLabel ? '<span class="event-status-badge event-status-' + status + '">' + statusLabel + '</span>' : '') +
        (lineCount ? '<span class="event-lines-badge">🧬 ' + lineCount + ' linha' + (lineCount > 1 ? 's' : '') + '</span>' : '') +
      '</div>' +
      '<div class="event-card-bottom">' +
        '<div class="event-card-name">' + esc(ev.event) + '</div>' +
        '<div class="event-card-date">' + esc(formatEventDate(ev)) + '</div>' +
        (typeChips ? '<div class="event-type-dots">' + typeChips + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.event-card').forEach(function(card) {
    card.addEventListener('click', function() { openEventDetail(card.dataset.eventId); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEventDetail(card.dataset.eventId); }
    });
  });
}

// ── Evolution lab: per-group state for the active modal ──
const EVOLVE_MS = 3400;
const EVOLVE_SWAP_MS = 1650;
let evGroupState = [];

function openEventDetail(id) {
  const data = eventsDataByYear[currentEventsYear];
  if (!data) return;
  const ev = data.find(function(e) { return e.id === id; });
  if (!ev) return;
  const accent = ev.accent || '#f2a93c';

  document.getElementById('ev-modal').style.setProperty('--ev-glow', accent);
  const bannerImg = document.getElementById('ev-modal-banner-img');
  bannerImg.src = BASE_URL + 'imagens/banner/' + ev.banner;
  bannerImg.alt = ev.event;
  document.getElementById('ev-modal-title').textContent = ev.event;
  document.getElementById('ev-modal-dates').textContent = formatEventDate(ev);

  const descEl = document.getElementById('ev-modal-desc');
  if (ev.description) { descEl.textContent = ev.description; descEl.style.display = ''; }
  else { descEl.textContent = ''; descEl.style.display = 'none'; }

  const monstersEl = document.getElementById('ev-modal-monsters');
  evGroupState = [];
  if (ev.groups && ev.groups.length) {
    monstersEl.innerHTML = '<div class="ev-modal-monsters-title">🧬 Laboratório de Evolução</div>' +
      ev.groups.map(function(g, gi) {
        const typeKey = (g.type || '').toLowerCase();
        const typeColor = TYPE_COLORS[typeKey] || '#f2a93c';
        const line = g.monsters.map(function(m) {
          const rawKey = m.name.toLowerCase();
          return { key: rawKey, display: formatMonsterDisplayName(rawKey), img: getMonsterImage(typeKey, rawKey, 'default') };
        });
        evGroupState[gi] = { type: typeKey, line: line, stage: 0, busy: false };
        const canEvolve = line.length > 1;
        const dots = line.map(function(_, i) {
          return '<span class="ev-dot' + (i === 0 ? ' active' : '') + '" data-dot="' + i + '"></span>';
        }).join('');
        return '<div class="ev-group" data-group-idx="' + gi + '">' +
          '<div class="ev-group-head">' +
            '<span class="ev-group-type" style="color:' + typeColor + ';border-color:' + typeColor + '55;background:' + typeColor + '1a;">' + esc(g.type) + '</span>' +
            (canEvolve ? '<div class="ev-group-progress">' + dots + '</div>' : '') +
          '</div>' +
          '<div class="ev-evolve-card" style="--m-glow:' + typeColor + ';">' +
            '<div class="ev-evolve-rays"></div>' +
            '<div class="ev-evolve-stage-wrap">' +
              '<img loading="lazy" decoding="async" class="ev-evolve-img" src="' + line[0].img + '" alt="' + esc(line[0].display) + '">' +
              '<div class="ev-evolve-flash"></div>' +
            '</div>' +
            '<div class="ev-evolve-name">' + esc(line[0].display) + '</div>' +
          '</div>' +
          (canEvolve ? '<button class="ev-evolve-btn" data-group-idx="' + gi + '">⬆ Evoluir</button>' : '') +
        '</div>';
      }).join('');

    monstersEl.querySelectorAll('.ev-evolve-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { evolveGroup(parseInt(this.dataset.groupIdx, 10)); });
    });
  } else {
    monstersEl.innerHTML = '<div class="ev-modal-monsters-empty">Lista de monstros em breve.</div>';
  }

  document.getElementById('ev-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function evolveGroup(gi) {
  const state = evGroupState[gi];
  if (!state || state.busy || state.stage >= state.line.length - 1) return;
  const groupEl = document.querySelector('.ev-group[data-group-idx="' + gi + '"]');
  if (!groupEl) return;
  const wrap = groupEl.querySelector('.ev-evolve-stage-wrap');
  const imgEl = groupEl.querySelector('.ev-evolve-img');
  const nameEl = groupEl.querySelector('.ev-evolve-name');
  const btn = groupEl.querySelector('.ev-evolve-btn');

  state.busy = true;
  if (btn) { btn.disabled = true; btn.textContent = 'Evoluindo…'; }
  wrap.classList.add('evolving');

  const nextStage = state.stage + 1;
  const next = state.line[nextStage];
  const pre = new Image();
  pre.src = next.img;

  setTimeout(function() {
    imgEl.src = next.img;
    imgEl.alt = next.display;
    nameEl.textContent = next.display;
  }, EVOLVE_SWAP_MS);

  setTimeout(function() {
    wrap.classList.remove('evolving');
    state.stage = nextStage;
    state.busy = false;
    const dot = groupEl.querySelector('.ev-dot[data-dot="' + nextStage + '"]');
    if (dot) dot.classList.add('active');
    if (btn) {
      if (state.stage >= state.line.length - 1) {
        btn.textContent = '✦ Forma Final';
        btn.disabled = true;
        btn.classList.add('ev-evolve-btn-maxed');
      } else {
        btn.textContent = '⬆ Evoluir';
        btn.disabled = false;
      }
    }
  }, EVOLVE_MS);
}

function closeEventDetail() {
  const overlay = document.getElementById('ev-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function() {
  const evClose = document.getElementById('ev-close');
  if (evClose) evClose.addEventListener('click', closeEventDetail);
  const evOverlay = document.getElementById('ev-overlay');
  if (evOverlay) evOverlay.addEventListener('click', function(e) { if (e.target === this) closeEventDetail(); });
});
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeEventDetail(); });

// ══════════ SKILLS ══════════
let allSkills = [], currentFilter = 'all', currentSort = 'name';
let displayedSkills = [];

// Card artwork used as the background of the left page inside an open skill book, per type
const CARD_BG = {
  common:'common_card.jpg', dragon:'dragon_card.jpg', earth:'earth_card.jpg', evil:'evil_card.jpg',
  fire:'fire_card.jpg', ice:'ice_card.jpg', lightning:'lightning_card.jpg', mythic:'mythic_card.jpg',
  spirit:'spirit_card.jpg', umbral:'umbral_card.jpg', water:'water_card.jpg', wind:'wind_card.jpg'
};

// Particle "recipe" per type — count, size range, shapes and color palette,
// so every book feels different (embers for fire, snow for ice, sparks for lightning, etc.)
const TYPE_PARTICLES = {
  fire:      { count: 22, shapes: ['spark','orb'],   sizeMin: 5,  sizeMax: 15, colors: ['#ff8a3d','#ffcf6b','#ff5a3c'] },
  ice:       { count: 20, shapes: ['shard','orb'],   sizeMin: 5,  sizeMax: 13, colors: ['#bdf2f9','#7fd8e6','#e8fbff'] },
  water:     { count: 20, shapes: ['orb','shard'],   sizeMin: 6,  sizeMax: 16, colors: ['#6fc2ff','#3f7fc9','#bfe6ff'] },
  earth:     { count: 18, shapes: ['cell','orb'],    sizeMin: 6,  sizeMax: 17, colors: ['#c99a45','#8a6a30','#e0bd75'] },
  wind:      { count: 22, shapes: ['shard','cell'],  sizeMin: 4,  sizeMax: 12, colors: ['#c9f2d3','#6fae7a','#eafff0'] },
  lightning: { count: 26, shapes: ['spark','shard'], sizeMin: 4,  sizeMax: 12, colors: ['#fff3a0','#e3b93f','#fffde0'] },
  dragon:    { count: 20, shapes: ['orb','shard'],   sizeMin: 5,  sizeMax: 14, colors: ['#7fa6ff','#4f7fd1','#bcd2ff'] },
  spirit:    { count: 20, shapes: ['orb','cell'],    sizeMin: 5,  sizeMax: 14, colors: ['#b3c8ea','#6f97c9','#eef4ff'] },
  evil:      { count: 18, shapes: ['cell','shard'],  sizeMin: 5,  sizeMax: 14, colors: ['#c3a8ee','#8a6fb8','#a98fcf'] },
  mythic:    { count: 22, shapes: ['orb','spark'],   sizeMin: 5,  sizeMax: 15, colors: ['#f6a8c6','#d9799a','#ffe1ee'] },
  umbral:    { count: 20, shapes: ['cell','orb'],    sizeMin: 5,  sizeMax: 14, colors: ['#aab0cc','#767ca0','#d6dbf2'] },
  common:    { count: 16, shapes: ['orb','cell'],    sizeMin: 5,  sizeMax: 13, colors: ['#d8d0a8','#a9a173','#efe9cf'] }
};

function renderBookParticles(type) {
  const layer = document.getElementById('sb-page-particles');
  if (!layer) return;
  const recipe = TYPE_PARTICLES[type] || TYPE_PARTICLES.common;
  let html = '';
  for (let i = 0; i < recipe.count; i++) {
    const shape = recipe.shapes[Math.floor(Math.random() * recipe.shapes.length)];
    const color = recipe.colors[Math.floor(Math.random() * recipe.colors.length)];
    const size = (recipe.sizeMin + Math.random() * (recipe.sizeMax - recipe.sizeMin)).toFixed(1);
    const left = (Math.random() * 100).toFixed(1);
    const top = (Math.random() * 100).toFixed(1);
    const dur = (4 + Math.random() * 5).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);
    const drift = (Math.random() * 40 - 20).toFixed(1);
    const opacity = (0.65 + Math.random() * 0.35).toFixed(2);
    html += '<span class="sb-particle sb-particle-'+shape+'" style="'
      + 'left:'+left+'%;top:'+top+'%;'
      + 'width:'+size+'px;height:'+size+'px;'
      + '--particle-color:'+color+';'
      + '--particle-dur:'+dur+'s;'
      + '--particle-delay:'+delay+'s;'
      + '--particle-drift:'+drift+'px;'
      + '--particle-opacity:'+opacity+';'
      + '"></span>';
  }
  layer.innerHTML = html;
}

function normalizeSkill(raw, type) {
  return {
    name: raw.Name !== undefined ? raw.Name : raw.name,
    pp: raw.PP !== undefined ? raw.PP : raw.pp,
    power: raw.Power !== undefined ? raw.Power : raw.power,
    precision: raw.Percentage !== undefined ? raw.Percentage : raw.precision,
    effect: raw.Effect !== undefined ? raw.Effect : raw.effect,
    type: type
  };
}

async function loadAllSkills() {
  await monsterImagesManifestReady;
  const types = ['common','dragon','earth','evil','fire','ice','lightning','mythic','spirit','umbral','water','wind'];
  const results = await Promise.all(types.map(function(type) {
    return Promise.all([
      fetch(BASE_URL+'data/skill/'+type+'.json').then(function(r){return r.json();}).catch(function(){return [];}),
      fetch(BASE_URL+'data/upgrade_skill/'+type+'_type_skill.json').then(function(r){return r.json();}).catch(function(){return [];})
    ]).then(function(pair){
      const normalSkills = pair[0].map(function(s){return normalizeSkill(s, type);});
      const upgradeSkills = pair[1].map(function(s){return normalizeSkill(s, type);});
      return normalSkills.map(function(s){
        const match = upgradeSkills.find(function(u){return u.name.trim().toLowerCase() === s.name.trim().toLowerCase();});
        if (match) s.upgrade = match;
        return s;
      });
    });
  }));
  allSkills = results.flat();
  displaySkills();
}

function displaySkills() {
  const searchTerm = document.getElementById('skill-search').value.toLowerCase();
  let filtered = allSkills;
  if (currentFilter !== 'all') filtered = filtered.filter(function(s){return s.type===currentFilter;});
  if (searchTerm) filtered = filtered.filter(function(s){return s.name.toLowerCase().includes(searchTerm);});
  filtered = filtered.slice().sort(function(a,b){
    if (currentSort==='name') return a.name.localeCompare(b.name);
    if (currentSort==='power-desc') return b.power-a.power;
    if (currentSort==='power-asc') return a.power-b.power;
    if (currentSort==='pp-desc') return b.pp-a.pp;
    if (currentSort==='pp-asc') return a.pp-b.pp;
    return 0;
  });
  displayedSkills = filtered;
  document.getElementById('skills-count').textContent = 'Showing '+filtered.length+' of '+allSkills.length+' skills';
  if (!filtered.length) { document.getElementById('skills-grid').innerHTML='<div class="no-results">No skills found</div>'; return; }
  document.getElementById('skills-grid').innerHTML = filtered.map(function(skill, idx) {
    return renderSkillBookTile(skill, idx);
  }).join('');
}

function renderSkillBookTile(skill, idx) {
  const iconPath = BASE_URL+'imagens/book_skill/item_icon_skillbook_type'+esc(skill.type)+'.webp';
  const glow = TYPE_COLORS[skill.type] || '#f2a93c';
  const delay = ((idx % 5) * 0.35).toFixed(2);
  return '<button type="button" class="skill-book-tile'+(skill.upgrade?' has-upgrade':'')+'" data-idx="'+idx+'" style="--book-glow:'+glow+';--book-delay:'+delay+'s;">'
    + '<div class="skill-book-tile-icon-wrap"><div class="skill-book-tile-glow"></div><img loading="lazy" decoding="async" src="'+iconPath+'" class="skill-book-tile-icon" alt="'+esc(skill.name)+'"></div>'
    + '<div class="skill-book-tile-name">'+esc(skill.name)+'</div>'
    + '</button>';
}

document.getElementById('skills-grid').addEventListener('click', function(e) {
  const tile = e.target.closest('.skill-book-tile');
  if (!tile) return;
  openSkillBook(parseInt(tile.dataset.idx, 10));
});

let sbShowingUpgrade = false;
function openSkillBook(idx) {
  const skill = displayedSkills[idx];
  if (!skill) return;
  sbShowingUpgrade = false;
  const book = document.getElementById('sb-book');
  book.classList.remove('open');
  book.classList.remove('is-upgraded');
  const boltFx = document.getElementById('sb-bolt-fx');
  if (boltFx) { boltFx.classList.remove('active'); clearTimeout(boltFx._timer); }
  renderSkillBookContent(skill, false);
  document.getElementById('sb-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function() {
    setTimeout(function(){ book.classList.add('open'); }, 200);
  });
}

// Plays the 6s 3D lightning strike and switches the book into its golden foil / type-glow state
// Plays the 6s 3D type-icon reveal and switches the book into its golden foil / type-glow state
function triggerUpgradeLightning(type) {
  const glow = TYPE_COLORS[type] || '#f2a93c';
  const book = document.getElementById('sb-book');
  const boltFx = document.getElementById('sb-bolt-fx');
  book.classList.add('is-upgraded');
  if (!boltFx) return;
  const icon = document.getElementById('sb-bolt-icon');
  if (icon) icon.src = BASE_URL+'imagens/type_icon/'+esc(type)+'_type_icon.png';
  boltFx.style.setProperty('--bolt-color', glow);
  boltFx.classList.remove('active');
  void boltFx.offsetWidth; // restart the CSS animation from scratch
  boltFx.classList.add('active');
  clearTimeout(boltFx._timer);
  boltFx._timer = setTimeout(function(){ boltFx.classList.remove('active'); }, 6000);
}

function renderSkillBookContent(skill, showUpgrade) {
  const data = showUpgrade ? skill.upgrade : skill;
  const glow = TYPE_COLORS[skill.type] || '#f2a93c';
  const book = document.getElementById('sb-book');
  book.style.setProperty('--book-glow', glow);
  book.classList.toggle('showing-upgrade', showUpgrade);

  const coverIcon = showUpgrade
    ? BASE_URL+'imagens/book_upgrade_skill/item_icon_skill_book_upgrade_type_'+esc(skill.type)+'.webp'
    : BASE_URL+'imagens/book_skill/item_icon_skillbook_type'+esc(skill.type)+'.webp';
  document.getElementById('sb-cover-icon').src = coverIcon;
  document.getElementById('sb-cover-title').textContent = data.name;
  document.getElementById('sb-cover-type').textContent = skill.type + ' type';

  const cardBg = BASE_URL+'imagens/card/'+(CARD_BG[skill.type] || 'common_card.jpg');
  document.getElementById('sb-book').style.backgroundImage = "url('"+cardBg+"')";
  renderBookParticles(skill.type);

  document.getElementById('sb-upgrade-tag').textContent = 'UPGRADE';
  document.getElementById('sb-skill-name').textContent = data.name;
  const badge = document.getElementById('sb-type-badge');
  badge.textContent = skill.type + ' type';
  badge.style.color = glow;
  badge.style.borderColor = glow + '55';
  badge.style.background = glow + '20';
  document.getElementById('sb-pp').textContent = data.pp;
  document.getElementById('sb-power').textContent = data.power;
  document.getElementById('sb-precision').textContent = data.precision;
  document.getElementById('sb-effect').textContent = data.effect;

  const upgradeBtn = document.getElementById('sb-upgrade-btn');
  if (skill.upgrade) {
    upgradeBtn.classList.add('visible');
    upgradeBtn.textContent = showUpgrade ? '↩ Voltar para Normal' : '⇪ Ver Upgrade';
    upgradeBtn.onclick = function() {
      const turningOn = !sbShowingUpgrade;
      sbShowingUpgrade = turningOn;
      if (turningOn) {
        triggerUpgradeLightning(skill.type);
      } else {
        document.getElementById('sb-book').classList.remove('is-upgraded');
        const boltFx = document.getElementById('sb-bolt-fx');
        if (boltFx) { boltFx.classList.remove('active'); clearTimeout(boltFx._timer); }
      }
      renderSkillBookContent(skill, sbShowingUpgrade);
    };
  } else {
    upgradeBtn.classList.remove('visible');
    upgradeBtn.onclick = null;
  }
}

function closeSkillBook() {
  document.getElementById('sb-overlay').classList.remove('open');
  document.getElementById('sb-book').classList.remove('open');
  document.getElementById('sb-book').classList.remove('is-upgraded');
  const boltFx = document.getElementById('sb-bolt-fx');
  if (boltFx) { boltFx.classList.remove('active'); clearTimeout(boltFx._timer); }
  document.body.style.overflow = '';
}
document.getElementById('sb-close').addEventListener('click', closeSkillBook);
document.getElementById('sb-overlay').addEventListener('click', function(e) {
  if (e.target.id === 'sb-overlay') closeSkillBook();
});

document.getElementById('skill-search').addEventListener('input', displaySkills);
document.getElementById('skill-sort').addEventListener('change', function(e){ currentSort=e.target.value; displaySkills(); });
document.querySelectorAll('.skill-filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.skill-filter-btn').forEach(function(b){b.classList.remove('active');});
    this.classList.add('active'); currentFilter=this.dataset.type; displaySkills();
  });
});

// ══════════ TYPE CHART ══════════
function loadTypeChart() {
  let typeHTML='', openHTML='';
  for (const typeName in typeData) {
    const data=typeData[typeName];
    const strong=data.strong.length?data.strong.map(function(t){return'<span class="type-badge type-'+esc(t)+'">'+esc(t)+'</span>';}).join(''):'<span style="opacity:.5;font-size:.75rem">None</span>';
    const weak=data.weak.map(function(t){return'<span class="type-badge type-'+esc(t)+'">'+esc(t)+'</span>';}).join('');
    typeHTML+='<div class="type-card type-'+typeName+'"><div class="type-card-header"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/type_icon/'+typeName+'_type_icon.png" class="type-card-icon" alt="'+typeName+' type icon"><div class="type-card-name">'+typeName+'</div></div><div class="type-body"><div class="type-info-section"><div class="type-info-label strong">⚔ Strong Against:</div><div class="type-badges">'+strong+'</div></div><div class="type-info-section"><div class="type-info-label weak">⚠ Weak Against:</div><div class="type-badges">'+weak+'</div></div></div></div>';
    if (data.openingSkill) {
      const skillBanner=BASE_URL+'imagens/openig_skill/opening_skill_'+data.openingSkill.name.toLowerCase().replace(/ /g,'_')+'.webp';
      openHTML+='<div class="opening-skill-card type-'+typeName+'" style="--osk-img:url(\''+skillBanner+'\')"><span class="enchantment-badge">5 Turns</span><div class="opening-skill-header"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/type_icon/'+typeName+'_type_icon.png" class="opening-skill-icon" alt="'+typeName+' opening skill icon"><div><div class="opening-skill-name">'+esc(data.openingSkill.name)+'</div><div class="opening-skill-type">'+esc(typeName)+' Type</div></div></div><div class="opening-skill-effect">'+esc(data.openingSkill.effect)+'</div></div>';
    }
  }
  document.getElementById('type-grid').innerHTML=typeHTML;
  document.getElementById('opening-skills-grid').innerHTML=openHTML;
  loadAttackSkills();
}

async function loadAttackSkills() {
  try {
    const skills=await fetch(BASE_URL+'data/opening/opening_skill_attack.json').then(function(r){return r.json();});
    document.getElementById('attack-skills-grid').innerHTML=skills.map(function(skill){
      const tc='type-'+skill.type.toLowerCase();
      const banner=BASE_URL+'imagens/opening_attack/opening_skill_attack_'+skill.name.toLowerCase().replace(/ /g,'_')+'.webp';
      const sprite=BASE_URL+'imagens/opening_attack/monster_'+skill.monster.toLowerCase().replace(/ /g,'_')+'.webp';
      return '<div class="attack-skill-card '+tc+'" style="--bg-image:url(\''+banner+'\')"><span class="attack-badge">Attack Opening Skill</span><div class="attack-skill-header"><img loading="lazy" decoding="async" src="'+sprite+'" class="monster-sprite" alt="'+esc(skill.monster)+'"><div class="attack-skill-info"><div class="attack-skill-name">'+esc(skill.name)+'</div><div class="monster-name-label">'+esc(skill.monster)+'</div><div class="attack-skill-type">'+esc(skill.type)+' Type</div></div></div><div class="attack-skill-stats"><div class="attack-stat-item"><div class="attack-stat-label">Power</div><div class="attack-stat-value">'+esc(skill.power)+'</div></div><div class="attack-stat-item"><div class="attack-stat-label">Precision</div><div class="attack-stat-value">'+esc(skill.precision)+'</div></div></div><div class="attack-skill-effect">'+esc(skill.effect)+'</div></div>';
    }).join('');
  } catch(e) {
    document.getElementById('attack-skills-grid').innerHTML='<div class="no-results">Failed to load attack skills</div>';
  }
}

// ══════════ ITEMS ══════════
let allItems=[], currentCategory='all';

const imageMap={
  'Common Ball':'ball/common_ball.webp','Ice Ball':'ball/ice_ball.webp','Lightning Ball':'ball/lightning_ball.webp',
  'Spirit Ball':'ball/spirit_ball.webp','Dragon Ball':'ball/dragon_ball.webp','Evil Ball':'ball/evil_ball.webp',
  'Land Ball':'ball/earth_ball.webp','Wind Ball':'ball/wind_ball.webp','Water Ball':'ball/water_ball.webp',
  'Fire Ball':'ball/fire_ball.webp','Master Ball':'ball/master_ball.webp','Candy':'candys/candy.webp',
  'Lollipop':'candys/lollipop.webp','Ice Cream':'candys/ice_cream.webp','Huge Ice Cream':'candys/huge_ice_cream.webp',
  'Bulu Point':'money_and_token/bulu_point.webp','Honor Point':'money_and_token/honor_point.webp',
  'Monster Coin':'money_and_token/monster_coin.webp','Apprentice Coin':'money_and_token/apprentice_coin.webp',
  'Special Assignment':'money_and_token/special_assignment.webp','Sigma Game Nium':'money_and_token/sigma_game_nium.webp',
  'Sacred Potion':'potion/item_sacred_potion.webp','Power Potion':'potion/power_potion.webp',
  'Monster Repel':'potion/monster_repel.webp','Tiny Potion':'potion/item_tiny_potion.webp',
  'Small Potion':'potion/item_small_potion.webp','Normal Potion':'potion/item_normal_potion.webp',
  'Big Potion':'potion/item_big_potion.webp','Super Potion':'potion/item_super_potion.webp',
  'Max Potion':'potion/item_max_potion.webp','Normal Revive':'potion/item_normal_revive.webp',
  'Big Revive':'potion/item_big_revive.webp','Super Revive':'potion/item_super_revive.webp',
  'Max Revive':'potion/item_max_revive.webp','Powder':'potion/item_powder.webp',
  'Capsule':'potion/item_capsule.webp','Remedy':'potion/item_remedy.webp',
  'Vitality Heal':'potion/item_vitality_heal.webp','Element Heal':'potion/item_element_heal.webp',
  'Awake Powder':'potion/item_awake_powder.webp','Unseal Amulet':'potion/item_unseal_amulet.webp',
  'Item Draw Ticket':'ticket/item_draw_ticket.png','Monster Ticket':'ticket/monster_ticket.png',
  'Bulu League Ticket':'ticket/regular_ticket.png','Legendary Ticket':'ticket/legendery_ticket.png',
  'Sigma Voucher':'ticket/sigma_voucher.png'
};

async function loadItems() {
  try {
    const [balls,candies,money,potions,tickets]=await Promise.all([
      fetch(BASE_URL+'data/itens/ball.json').then(function(r){return r.json();}),
      fetch(BASE_URL+'data/itens/candy.json').then(function(r){return r.json();}),
      fetch(BASE_URL+'data/itens/money_and_token.json').then(function(r){return r.json();}),
      fetch(BASE_URL+'data/itens/potion.json').then(function(r){return r.json();}),
      fetch(BASE_URL+'data/itens/ticket.json').then(function(r){return r.json();})
    ]);
    allItems=[
      ...balls.map(function(i){return Object.assign({},i,{category:'ball'});}),
      ...candies.map(function(i){return Object.assign({},i,{category:'candy'});}),
      ...money.map(function(i){return Object.assign({},i,{category:'money'});}),
      ...potions.map(function(i){return Object.assign({},i,{category:'potion'});}),
      ...tickets.map(function(i){return Object.assign({},i,{category:'ticket'});})
    ];
    displayItems();
  } catch(e) {
    document.getElementById('items-grid').innerHTML='<div class="no-results">Failed to load items</div>';
  }
}

function displayItems() {
  const filtered=currentCategory==='all'?allItems:allItems.filter(function(i){return i.category===currentCategory;});
  document.getElementById('items-grid').innerHTML=filtered.map(function(item){
    const imgPath=imageMap[item.name]||'placeholder.webp';
    const text=item.description||item.effect||'';
    const tip=item.tip||'';
    return '<div class="item-card"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/itens/'+esc(imgPath)+'" class="item-image" alt="'+esc(item.name)+'" onerror="this.src=\''+BASE_URL+'imagens/placeholder.webp\'"><div class="item-name">'+esc(item.name)+'</div><span class="item-type">'+esc(item.type)+'</span><div class="item-description">'+esc(text)+'</div>'+(tip?'<div class="item-tip">'+esc(tip)+'</div>':'')+'</div>';
  }).join('');
}

document.querySelectorAll('.category-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.category-btn').forEach(function(b){b.classList.remove('active');});
    this.classList.add('active'); currentCategory=this.dataset.category; displayItems();
  });
});

// ══════════ POTENTIALS ══════════
let allPotentials=[], currentPotentialType='all';

async function loadPotentials() {
  try {
    const types=['common','dragon','earth','evil','fire','ice','lightning','mythic','spirit','water','wind','umbral'];
    const nameMapping={'Ancient Edurance':'ancient_edurance','Isolating Shell':'isolating_shell','Shadow Revenger':'shadow_revenge'};
    const results=await Promise.all(types.map(function(type){
      return fetch(BASE_URL+'data/potential/'+type+'_potencial.json')
        .then(function(r){return r.json();})
        .then(function(data){return data.map(function(item){
          const fileName=nameMapping[item.name]||item.name.toLowerCase().replace(/ /g,'_').replace(/'/g,'');
          return Object.assign({},item,{type:type,image:'potential_active/'+type+'_type/'+fileName+'.webp'});
        });})
        .catch(function(){return [];});
    }));
    allPotentials=results.flat();
    displayPotentials();
  } catch(e) {
    document.getElementById('potentials-grid').innerHTML='<div class="no-results">Failed to load potentials</div>';
  }
}

function displayPotentials() {
  const filtered=currentPotentialType==='all'?allPotentials:allPotentials.filter(function(p){return p.type===currentPotentialType;});
  document.getElementById('potentials-grid').innerHTML=filtered.map(function(p){
    const t = p.type || 'common';
    return '<div class="potential-card sk-'+esc(t)+'"><div class="pot-bar"></div><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/'+esc(p.image)+'" class="potential-image" alt="'+esc(p.name)+'" onerror="this.src=\''+BASE_URL+'imagens/placeholder.webp\'"><div class="potential-name">'+esc(p.name)+'</div><span class="potential-type">'+esc(p.Type||p.type)+'</span><div class="potential-description">'+esc(p.description)+'</div></div>';
  }).join('');
}

document.querySelectorAll('.potential-filter-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.potential-filter-btn').forEach(function(b){b.classList.remove('active');});
    this.classList.add('active'); currentPotentialType=this.dataset.type; displayPotentials();
  });
});

// ══════════ SKELETON LOADING ══════════
function createSkeletons(containerId, count, type) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var html = '';
  for (var i = 0; i < count; i++) {
    if (type === 'skill') {
      html += '<div class="skeleton-card">' +
        '<div class="skeleton-header">' +
          '<div class="skeleton skeleton-icon"></div>' +
          '<div class="skeleton-header-info">' +
            '<div class="skeleton skeleton-line medium"></div>' +
            '<div class="skeleton skeleton-line short"></div>' +
          '</div>' +
        '</div>' +
        '<div class="skeleton-stats">' +
          '<div class="skeleton skeleton-stat"></div>' +
          '<div class="skeleton skeleton-stat"></div>' +
          '<div class="skeleton skeleton-stat"></div>' +
        '</div>' +
        '<div class="skeleton skeleton-line full" style="height:52px;margin-top:0.2rem;"></div>' +
      '</div>';
    } else if (type === 'card') {
      html += '<div class="skeleton-card">' +
        '<div class="skeleton-header">' +
          '<div class="skeleton skeleton-icon"></div>' +
          '<div class="skeleton-header-info">' +
            '<div class="skeleton skeleton-line medium"></div>' +
            '<div class="skeleton skeleton-line short"></div>' +
          '</div>' +
        '</div>' +
        '<div class="skeleton skeleton-line full" style="height:38px;"></div>' +
        '<div class="skeleton skeleton-line medium"></div>' +
      '</div>';
    } else if (type === 'event') {
      html += '<div class="skeleton-card" style="padding:0;overflow:hidden;">' +
        '<div class="skeleton skeleton-icon" style="width:100%;height:130px;border-radius:0;margin:0;"></div>' +
        '<div style="padding:.9rem 1rem 1rem;display:flex;flex-direction:column;gap:.4rem;">' +
          '<div class="skeleton skeleton-line medium"></div>' +
          '<div class="skeleton skeleton-line short"></div>' +
        '</div>' +
      '</div>';
    } else if (type === 'item') {
      html += '<div class="skeleton-card" style="align-items:center;text-align:center;">' +
        '<div class="skeleton skeleton-icon" style="width:64px;height:64px;margin:0 auto;border-radius:6px;"></div>' +
        '<div class="skeleton skeleton-line medium" style="margin:0 auto;"></div>' +
        '<div class="skeleton skeleton-line short" style="margin:0 auto;"></div>' +
        '<div class="skeleton skeleton-line full" style="height:36px;"></div>' +
      '</div>';
    }
  }
  container.innerHTML = html;
}

var originalLoadAllSkills = loadAllSkills;
loadAllSkills = function() { createSkeletons('skills-grid', 9, 'skill'); return originalLoadAllSkills.apply(this, arguments); };

var originalLoadItems = loadItems;
loadItems = function() { createSkeletons('items-grid', 12, 'item'); return originalLoadItems.apply(this, arguments); };

var originalLoadPotentials = loadPotentials;
loadPotentials = function() { createSkeletons('potentials-grid', 9, 'card'); return originalLoadPotentials.apply(this, arguments); };

// ══════════ TAB / SIDEBAR NAVIGATION ══════════
const tabState = { legendary: false, events: false, skills: false, types: false, items: false, potentials: false };

function goToTab(target) {
  document.querySelectorAll('.nav-link').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  if (target !== 'legendary') {
    var ld = document.getElementById('legendary-display');
    if (ld) ld.innerHTML = '';
    tabState.legendary = false;
  }
  var navBtn = document.querySelector('.nav-link[data-tab="'+target+'"]');
  if (navBtn) navBtn.classList.add('active');
  var tabEl = document.getElementById(target + '-tab');
  if (tabEl) tabEl.classList.add('active');

  if (target === 'legendary' && !tabState.legendary) { loadLegendaryCupWithPrizes(); tabState.legendary = true; }
  if (target === 'events' && !tabState.events)       { renderEventsYearTabs(); loadEventsTab(); tabState.events = true; }
  if (target === 'skills' && !tabState.skills)       { loadAllSkills(); tabState.skills = true; }
  if (target === 'types' && !tabState.types)         { loadTypeChart(); tabState.types = true; }
  if (target === 'items' && !tabState.items)         { loadItems(); tabState.items = true; }
  if (target === 'potentials' && !tabState.potentials) { loadPotentials(); tabState.potentials = true; }
  if (target === 'legendary') setTimeout(renderBannerIfReady, 80);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeSidebar();
}

function renderBannerIfReady() { if (window.__renderLCBanner) window.__renderLCBanner(); }

document.querySelectorAll('.nav-link').forEach(function(btn) {
  btn.addEventListener('click', function() { goToTab(this.dataset.tab); });
});
document.querySelectorAll('[data-goto]').forEach(function(el) {
  el.addEventListener('click', function() { goToTab(this.dataset.goto); });
});

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ══════════ MONSTER INFORMATION MODAL ══════════
var STAT_MAX = { hp:1000, atk:1000, def:1000, spd:1000 };
var TYPE_COLORS = {
  common:'#a9a173',dragon:'#4f7fd1',earth:'#c99a45',evil:'#8a7462',
  fire:'#e8683f',ice:'#57b9c4',lightning:'#e3b93f',mythic:'#d9799a',
  spirit:'#6f97c9',water:'#3f7fc9',wind:'#6fae7a',umbral:'#565b70'
};
var BOOK_BG = {
  common:'monster_book_common.webp',dragon:'monster_book_dragon.webp',
  earth:'monster_book_earth.webp',evil:'monster_book_evil.webp',
  fire:'monster_book_fire.webp',ice:'monster_book_ice.webp',
  lightning:'monster_book_lightning.webp',mythic:'monster_book_mythic.webp',
  spirit:'monster_book_spirit.webp',water:'monster_book_water.webp',
  wind:'monster_book_wind.webp',umbral:'monster_book_umbral.webp'
};

var lcStatsData = [];
fetch(BASE_URL + 'data/monster_status.json')
  .then(function(r){ return r.json(); })
  .then(function(data){ lcStatsData = data; })
  .catch(function(){ console.warn('monster_status.json não carregado'); });

function getLCEdition(lcName) {
  for (var wk in legendaryCupData) {
    var eds = legendaryCupData[wk].editions;
    for (var j = 0; j < eds.length; j++) {
      if (eds[j].name === lcName) return { week: wk, edition: eds[j] };
    }
  }
  return null;
}

function openMonsterInfo(lcName) {
  var found = getLCEdition(lcName);
  if (!found) return;
  var edition = found.edition;
  var type = edition.type.toLowerCase();
  var typeColor = TYPE_COLORS[type] || '#f2a93c';

  var stats = null;
  for (var i = 0; i < lcStatsData.length; i++) {
    if (lcStatsData[i].lc_name === lcName) { stats = lcStatsData[i]; break; }
  }

  var bookUrl = BASE_URL + 'imagens/book_background/' + (BOOK_BG[type] || 'monster_book_common.webp');
  document.getElementById('mi-card-bg').style.backgroundImage = 'url(' + bookUrl + ')';

  var monsterImg = document.getElementById('mi-monster-img');
  monsterImg.classList.remove('revealed');
  monsterImg.src = '';
  document.getElementById('mi-name-bar').classList.remove('revealed');
  ['hp','atk','def','spd'].forEach(function(k) {
    document.getElementById('mi-row-' + k).classList.remove('revealed');
    document.getElementById('mi-bar-' + k).style.width = '0%';
    document.getElementById('mi-num-' + k).textContent = stats ? stats[k] : '—';
  });

  document.getElementById('mi-monster-name').textContent = stats ? stats.monster_name : edition.name;
  var pill = document.getElementById('mi-type-pill');
  pill.textContent = type;
  pill.style.color = typeColor;
  pill.style.borderColor = typeColor + '55';
  pill.style.background = typeColor + '20';
  document.getElementById('mi-stars-row').textContent = stats ? '★'.repeat(stats.stars) : '';

  var evoEl = document.getElementById('mi-evoline');
  evoEl.innerHTML = '';
  var evoItems = [];
  edition.monsters.forEach(function(m, idx) {
    var imgSrc = getMonsterImage(edition.type, m.name, 'default');
    var dispName = formatMonsterDisplayName(m.name);
    var isFinal = idx === edition.monsters.length - 1;

    if (idx > 0) {
      var arrowEl = document.createElement('div');
      arrowEl.className = 'mi-evo-arrow-sm';
      arrowEl.textContent = '→';
      evoEl.appendChild(arrowEl);
      evoItems.push({ el: arrowEl, isArrow: true, isFinal: false });
    }

    var stage = document.createElement('div');
    stage.className = 'mi-evo-mini' + (isFinal ? ' final' : '');
    stage.innerHTML = '<img loading="lazy" decoding="async" src="' + imgSrc + '" alt="' + dispName + '"><span>' + dispName + '</span>';
    evoEl.appendChild(stage);
    evoItems.push({ el: stage, isArrow: false, isFinal: isFinal, imgSrc: imgSrc });
  });

  document.getElementById('mi-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  var delay = 150;
  evoItems.forEach(function(item) {
    setTimeout(function() { item.el.classList.add('revealed'); }, delay);
    delay += item.isArrow ? 100 : 300;
  });

  var lastItem = evoItems[evoItems.length - 1];
  setTimeout(function() {
    monsterImg.src = lastItem.imgSrc;
    monsterImg.onload = function() {
      setTimeout(function() {
        monsterImg.classList.add('revealed');
        var area = monsterImg.closest('.mi-monster-area');
        if (area) area.classList.add('glowing');
      }, 50);
    };
  }, delay - 100);

  var statsDelay = delay + 200;
  if (stats) {
    ['hp','atk','def','spd'].forEach(function(k, i) {
      setTimeout(function() {
        document.getElementById('mi-row-' + k).classList.add('revealed');
        setTimeout(function() {
          var pct = Math.min(100, Math.round((stats[k] / STAT_MAX[k]) * 100));
          document.getElementById('mi-bar-' + k).style.width = pct + '%';
        }, 100);
      }, statsDelay + i * 150);
    });
  }

  setTimeout(function() {
    document.getElementById('mi-name-bar').classList.add('revealed');
  }, statsDelay + 600);
}

function closeMonsterInfo() {
  var overlay = document.getElementById('mi-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  var area = document.querySelector('.mi-monster-area');
  if (area) area.classList.remove('glowing');
  var img = document.getElementById('mi-monster-img');
  if (img) img.classList.remove('revealed');
}

document.addEventListener('DOMContentLoaded', function() {
  var miClose = document.getElementById('mi-close');
  if (miClose) miClose.addEventListener('click', closeMonsterInfo);
  var miOverlay = document.getElementById('mi-overlay');
  if (miOverlay) miOverlay.addEventListener('click', function(e) {
    if (e.target === this) closeMonsterInfo();
  });
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMonsterInfo();
});

// ══════════ LC TIMER ══════════
(function() {
    var weekSchedule = [
        ['Kirin Edition',    'Kenga Edition'],
        ['Arctery Edition',  'Leafy Edition'],
        ['Griff Edition',    'Musta Edition'],
        ['Glacial Edition',  'Pando Edition'],
        ['Grety Edition',    'Krus Edition'],
        ['Voca Edition'],
        ['Lamp Edition'],
        ['Meduran Edition'],
        ['Blaze Edition',    'Volti Edition'],
        ['Necro Edition',    'Nighty Edition'],
        ['Saur Edition'],
        ['Azlord Edition'],
        ['Whino Edition'],
        ['Vendra Edition'],
        ['Aqua Edition'],
    ];
    var TOTAL_WEEKS = weekSchedule.length;

    var sessions = [
        { utcDay:4, utcH:2,  durationH:2, slot:'ed1' },
        { utcDay:4, utcH:8,  durationH:2, slot:'ed1' },
        { utcDay:4, utcH:14, durationH:2, slot:'ed1' },
        { utcDay:4, utcH:20, durationH:2, slot:'ed1' },
        { utcDay:5, utcH:2,  durationH:2, slot:'ed2' },
        { utcDay:5, utcH:8,  durationH:2, slot:'ed2' },
        { utcDay:5, utcH:14, durationH:2, slot:'ed2' },
        { utcDay:5, utcH:20, durationH:2, slot:'ed2' },
        { utcDay:6, utcH:2,  durationH:2, slot:'both' },
        { utcDay:6, utcH:8,  durationH:2, slot:'both' },
        { utcDay:6, utcH:14, durationH:2, slot:'both' },
        { utcDay:6, utcH:20, durationH:2, slot:'both' },
    ];

    var ANCHOR_UTC = new Date(Date.UTC(2026, 2, 5, 2, 0, 0));

    function getNowUTC() { return new Date(); }

    function getSessionDates(now, weekOffset) {
        var ms = now.getTime();
        var dayUTC = now.getUTCDay();
        var daysSinceThu = (dayUTC + 7 - 4) % 7;
        var thisThu = new Date(ms - daysSinceThu * 86400000);
        thisThu.setUTCHours(0,0,0,0);
        thisThu = new Date(thisThu.getTime() + weekOffset * 7 * 86400000);

        return sessions.map(function(s) {
            var startDay = new Date(thisThu);
            var dayOffset = s.utcDay - 4;
            startDay.setUTCDate(startDay.getUTCDate() + dayOffset);
            startDay.setUTCHours(s.utcH, 0, 0, 0);
            var endDay = new Date(startDay.getTime() + s.durationH * 3600000);
            return { start: startDay, end: endDay, session: s };
        });
    }

    function getCurrentWeekIndex(now) {
        var diffMs = now.getTime() - ANCHOR_UTC.getTime();
        var diffWeeks = Math.floor(diffMs / (7 * 86400000));
        return ((diffWeeks % TOTAL_WEEKS) + TOTAL_WEEKS) % TOTAL_WEEKS;
    }

    function getEditionNames(weekIdx, slot) {
        var eds = weekSchedule[weekIdx];
        if (eds.length === 1) return [eds[0]];
        if (slot === 'ed1') return [eds[0]];
        if (slot === 'ed2') return [eds[1]];
        return [eds[0], eds[1]];
    }

    function getLCStatus() {
        var now = getNowUTC();
        var weekIdx = getCurrentWeekIndex(now);

        for (var w = 0; w <= 1; w++) {
            var sessDates = getSessionDates(now, w);
            for (var i = 0; i < sessDates.length; i++) {
                var sd = sessDates[i];
                if (now >= sd.start && now < sd.end) {
                    var wi = ((weekIdx + w) % TOTAL_WEEKS + TOTAL_WEEKS) % TOTAL_WEEKS;
                    return { live: true, endsAt: sd.end, session: sd.session, editions: getEditionNames(wi, sd.session.slot), weekNum: wi + 1 };
                }
            }
        }

        var nextSd = null, nextWi = 0, minDiff = Infinity;
        for (var w2 = 0; w2 <= 1; w2++) {
            var sessDates2 = getSessionDates(now, w2);
            for (var j = 0; j < sessDates2.length; j++) {
                var diff = sessDates2[j].start - now;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextSd = sessDates2[j];
                    nextWi = ((weekIdx + w2) % TOTAL_WEEKS + TOTAL_WEEKS) % TOTAL_WEEKS;
                }
            }
        }

        return { live: false, nextStart: nextSd ? nextSd.start : null, nextSession: nextSd ? nextSd.session : null,
            nextEditions: nextSd ? getEditionNames(nextWi, nextSd.session.slot) : [], msUntil: minDiff, weekNum: nextWi + 1 };
    }

    function pad(n) { return n < 10 ? '0'+n : ''+n; }

    function updateTabBadge(status) {
      var badge = document.getElementById('lc-tab-badge');
      if (!badge) return;
      if (status.live) {
        badge.className = 'lc-tab-badge badge-live';
        badge.innerHTML = '<span class="badge-dot"></span>LIVE';
      } else {
        badge.className = 'lc-tab-badge badge-week';
        badge.textContent = 'Week ' + pad(status.weekNum);
      }
    }

    function renderBanner() {
        var banner = document.getElementById('lc-banner');
        if (!banner) return;

        var status = getLCStatus();
        var weekKey = 'week_' + pad(status.weekNum);
        var weekData = legendaryCupData[weekKey];
        if (!weekData) { banner.innerHTML = ''; return; }

        var editions = weekData.editions;
        var itemsHTML = editions.map(function(ed) {
            var src = BASE_URL + 'imagens/lc_banner/' + ed.banner;
            return '<div class="lc-week-banner-item">' +
                '<img loading="lazy" decoding="async" src="' + src + '" alt="' + ed.name + '" class="lc-week-banner-img">' +
                '<div class="lc-week-banner-name">' + ed.name + '</div>' +
            '</div>';
        }).join('');

        banner.className = 'lc-banner' + (status.live ? ' live' : '');
        banner.innerHTML =
            '<div class="lc-week-label">' +
                (status.live
                    ? '<span class="lc-live-dot"></span> Live Now — Week ' + pad(status.weekNum) + ' <span class="lc-live-dot"></span>'
                    : 'Featured This Week — Week ' + pad(status.weekNum)) +
            '</div>' +
            '<div class="lc-week-banners' + (editions.length > 1 ? ' dual' : '') + '">' + itemsHTML + '</div>';
    }

    updateTabBadge(getLCStatus());
    renderBanner();
    setInterval(function(){ var s=getLCStatus(); renderBanner(); updateTabBadge(s); }, 60000);

    window.__renderLCBanner = renderBanner;
    window.__updateLCBadge = function() { updateTabBadge(getLCStatus()); };
})();
