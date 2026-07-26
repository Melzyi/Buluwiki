const BASE_URL = 'https://raw.githubusercontent.com/Melzyi/Buluwiki/main/';

// ══════════ MEGA ITEM READABLE NAMES ══════════
const megaItemNames = {
  'volcagon_04': 'Volcano Armor',
  'ultisaur_04': 'Saur Punch',
  'ardizlord_04': 'Crystal Protect',
  'ventragon_04': 'Heavenly Feather',
  'aquarion_04': 'Tidal Might',
  'siggdrak_04': 'Sigma Power',
  'siggement_04': 'Sigma Gem',
  'siggtaplate_04': 'Sigma Elixir',
  'ultichett_04': 'Rainbow Feather',
  'sigversith_04': 'Versatile Core',
  'sigcobinith_04': 'Sigma Controller',
  'hydrellion_04': 'Sigma Sign',
  'orriginph_04': 'Common Essence',
  'mordrak_solo_04': 'Dragon Essence',
  'gaiaphyz_solo_04': 'Earth Essence',
  'darkphlame_solo_04': 'Evil Essence',
  'flarephiant_solo_04': 'Fire Essence',
  'crystophy_solo_04': 'Ice Essence',
  'thunderoph_solo_04': 'Thunder Essence',
  'primorphio_solo_04': 'Mythic Essence',
  'morgicka_solo_04': 'Spirit Essence',
  'aquamorph_solo_04': 'Water Essence',
  'cyclonph_solo_04': 'Wind Essence',
  'tempestnir_solo_04': 'Sigma Fusion',
  'skurvorr_04': 'Hellfire Bone',
  'duskvorr_04': 'Dusklight Bone',
  'umbrangler_solo_04': 'Leviathan Scale',
  'prison_breaker_solo_04': 'Crimzon Cape',
  'snowlords_solo_04': 'Giant Clamp',
  'miracle_solo_sheep_04': 'Ancient Ring'
};

// ══════════ MONSTER TYPES (single source of truth for all type-filter UIs) ══════════
const MONSTER_TYPES = ['common','dragon','earth','evil','fire','ice','lightning','mythic','spirit','water','wind'];
const MONSTER_TYPES_WITH_UMBRAL = MONSTER_TYPES.concat(['umbral']);

// Builds a row of "All" + one button per type, avoiding copy-pasted HTML.
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

renderTypeFilterButtons('skills-type-filters', { btnClass: 'filter-btn skill-filter-btn', allLabel: 'All' });
renderTypeFilterButtons('mega-type-filters', { btnClass: 'mega-filter-btn', allLabel: 'All Types', includeUmbral: true });
renderTypeFilterButtons('potentials-filters', { btnClass: 'filter-btn potential-filter-btn', allLabel: 'All Types', includeUmbral: true });

// ══════════ FIREFLIES (ambient glow particles) ══════════
(function() {
  const container = document.getElementById('fireflies');
  const count = window.matchMedia('(max-width:768px)').matches ? 10 : 20;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    const x = Math.random() * 97;
    const dur = (10 + Math.random() * 10).toFixed(1) + 's';
    const delay = (Math.random() * 14).toFixed(1) + 's';
    const drift = (Math.random() * 60 - 30).toFixed(0) + 'px';
    const size = (3 + Math.random() * 4).toFixed(1) + 'px';
    el.style.cssText = `left:${x}%;--dur:${dur};--pulse:${delay};--drift:${drift};width:${size};height:${size};`;
    container.appendChild(el);
  }
})();

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

// ══════════ THEME TOGGLE ══════════
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeSlider = document.querySelector('.theme-toggle-slider');
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeSlider.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
themeToggle.addEventListener('click', function() {
  const t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeSlider.textContent = t === 'dark' ? '🌙' : '☀️';
});

// ══════════ TAB INDICATOR (sliding pill) ══════════
const tabsEl = document.getElementById('tabs');
const tabIndicator = document.getElementById('tabIndicator');

function moveIndicator(btn) {
  if (!btn || !tabIndicator) return;
  tabIndicator.style.setProperty('--ind-x', btn.offsetLeft + 'px');
  tabIndicator.style.setProperty('--ind-w', btn.offsetWidth + 'px');
  tabIndicator.style.setProperty('--ind-o', '1');
}
window.addEventListener('load', function() {
  moveIndicator(document.querySelector('.tab-button.active'));
});
window.addEventListener('resize', function() {
  moveIndicator(document.querySelector('.tab-button.active'));
});
moveIndicator(document.querySelector('.tab-button.active'));

// ══════════ TAB SWITCHING ══════════
const tabState = { legendary: false, skills: false, types: false, mega: false, items: false, potentials: false };

document.querySelectorAll('.tab-button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const target = this.dataset.tab;
    document.querySelectorAll('.tab-button').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
    // Limpar legendary ao sair para evitar conteúdo vazando
    if (target !== 'legendary') {
      var ld = document.getElementById('legendary-display');
      if (ld) ld.innerHTML = '';
      tabState.legendary = false;
    }
    this.classList.add('active');
    moveIndicator(this);
    this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const tabEl = document.getElementById(target + '-tab');
    if (tabEl) tabEl.classList.add('active');
    // Lazy load
    if (target === 'home')                              { loadHomeTab(); }
    if (target === 'legendary' && !tabState.legendary) { loadLegendaryCupWithPrizes(); tabState.legendary = true; }
    if (target === 'skills' && !tabState.skills)       { loadAllSkills(); tabState.skills = true; }
    if (target === 'types' && !tabState.types)         { loadTypeChart(); tabState.types = true; }
    if (target === 'mega' && !tabState.mega)           { loadMegaMonsters(); tabState.mega = true; }
    if (target === 'items' && !tabState.items)         { loadItems(); tabState.items = true; }
    if (target === 'potentials' && !tabState.potentials) { loadPotentials(); tabState.potentials = true; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ══════════ TROCA DE IMAGEM SEM "PISCAR" ══════════
// Pré-carrega a imagem nova em memória e só troca o src visível
// depois que ela já está pronta — evita o flash/sumiço da imagem antiga.
function swapImgSmooth(imgEl, newSrc) {
  if (!imgEl || imgEl.src === newSrc) return;
  const pre = new Image();
  pre.onload = function() { imgEl.src = newSrc; };
  pre.onerror = function() { imgEl.src = newSrc; };
  pre.src = newSrc;
}

// ══════════ DATA ══════════
const megaItems = {
  'volcagon_04':'volcagon_evo_volcano_armor','ultisaur_04':'ultisaur_evo_saurpunch',
  'ardizlord_04':'ardizlord_evo_crystal_protect','ventragon_04':'ventragon_evo_heavenly_feather',
  'aquarion_04':'aquarion_evo_tidal_might','siggdrak_04':'siggdrak_evo_sigma_power_02_th',
  'siggement_04':'siggement_evo_sigma_gem_03_th','siggtaplate_04':'siggtaplate_evo_sigma_elixir_04_th',
  'ultichett_04':'ultichette_evo_rainbow_feather_06_th','sigversith_04':'sigversith_evo_versatile_core_07_th',
  'sigcobinith_04':'sigcobinith_evo_sigma_controller_08_th','hydrellion_04':'hydreilion_evo_sigma_sign_09_th',
  'orriginph_04':'orriginph_evo_common_essence_10_th','mordrak_solo_04':'mordrak_evo_dragon_essence_10_th',
  'gaiaphyz_solo_04':'gaiaphyz_evo_earth_essence_10_th','darkphlame_solo_04':'darkphlame_evo_evil_essence_10_th',
  'flarephiant_solo_04':'flarephiant_evo_fire_essence_10_th','crystophy_solo_04':'crystophy_evo_ice_essence_10_th',
  'thunderoph_solo_04':'thunderoph_evo_thunder_essence_10_th','primorphio_solo_04':'primorphio_evo_mythic_essence_10_th',
  'morgicka_solo_04':'morgicka_evo_spirit_essence_10_th','aquamorph_solo_04':'aquamorph_evo_water_essence_10_th',
  'cyclonph_solo_04':'cyclonph_evo_wind_essence_10_th','tempestnir_solo_04':'tempestnir_evo_sigma_fusion_11_th',
  'skurvorr_04':'skurvorr_evo_hellfire_bone_12_th','duskvorr_04':'duskvorr_evo_dusklight_bone_12_th',
  'umbrangler_solo_04':'umbrangler_evo_leviathan_scale_12_th','prison_breaker_solo_04':'prison_breaker_evo_crimzon_cape_06_th',
  'snowlords_solo_04':'snowlords_evo_giant_clamp_06_th','miracle_solo_sheep_04':'miracle_sheep_evo_ancient_ring_05_th'
};

const monsterData = {
  1:{common:[{line:['fishy_01','ordinfishy_02','mystfishy_03'],variants:[]}],dragon:[{line:['wyfishy_01','dritfishy_02','dragkfishy_03'],variants:[]}],earth:[{line:['stonefishy_01','landfishy_02','gaiafishy_03'],variants:[]}],evil:[{line:['evilfishy_01','devilfishy_02','mordefishy_03'],variants:[]}],fire:[{line:['redfishy_01','flamefishy_02','blazingfishy_03'],variants:[]}],ice:[{line:['icefishy_01','glacifishy_02','frozenfishy_03'],variants:[]}],lightning:[{line:['elecfishy_01','lightfishy_02','thunderfishy_03'],variants:[]}],mythic:[{line:['aciefishy_01','ancientfishy_02'],variants:[]}],spirit:[{line:['telefishy_01','spiritfishy_02','psychicfishy_03'],variants:['natal','shyne']}],water:[{line:['waterfishy_01','oceanfishy_02','abyssfishy_03'],variants:[]}],wind:[{line:['windifishy_01','breezefishy_02','stormfishy_03'],variants:[]}]},
  2:{dragon:[{line:['sigg_01','siggit_02','siggonit_03','siggdrak_04'],variants:[]}]},
  3:{dragon:[{line:['siggy_01','sigmot_02','sigmetit_03','siggement_04'],variants:[]}]},
  4:{dragon:[{line:['sigqua_01','sigquid_02','sigquigon_03','siggtaplate_04'],variants:[]}]},
  5:{common:[{line:['punchant_01','boxant_02'],variants:[]}],dragon:[{line:['daara_01','gararah_02','garajion_03'],variants:[]}],earth:[{line:['earthdillo_01','gaiadillo_02'],variants:[]}],evil:[{line:['soullent_01','ghoosent_02'],variants:[]}],fire:[{line:['fireater_01','flameater_02','blazeater_03'],variants:[]}],ice:[{line:['ragebea_01','terrobear_02'],variants:[]}],lightning:[{line:['elecir_01','eleckuu_02','eleccuma_03'],variants:[]}],mythic:[{line:['miracle_solo_sheep_04'],variants:['natal','shyne'],solo:true}],spirit:[{line:['spirikett_01','psychokett_02'],variants:[]},{line:['ancient_sheep_solo_02'],variants:['natal','shyne'],solo:true}],water:[{line:['aquapole_01','aquatoad_02','clownfrog_03'],variants:[]}],wind:[{line:['cutou_01','toucan_02'],variants:[]}]},
  6:{dragon:[{line:['hatchette_01','areochett_02','gaiachett_03','ultichett_04'],variants:[]}],evil:[{line:['prison_breaker_solo_04'],variants:['hyakki_yagyo','shyne'],solo:true}],ice:[{line:['snowlords_solo_04'],variants:['first_birthday','shyne'],solo:true}]},
  7:{common:[{line:['scissz_01','scissor_02','scisserg_03'],variants:[]}],dragon:[{line:['sigiv_01','sigilva_02','sigversa_03','sigversith_04'],variants:[]}]},
  8:{dragon:[{line:['sigco_01','sigcom_02','sigcobie_03','sigcobinith_04'],variants:[]}]},
  9:{evil:[{line:['hydrix_01','hydrely_02','hydriola_03','hydrellion_04'],variants:[]}]},
  10:{common:[{line:['morphiz_01','morphio_02','morphiant_03','orriginph_04'],variants:[]}],dragon:[{line:['mordrak_solo_04'],variants:[],solo:true}],earth:[{line:['gaiaphyz_solo_04'],variants:[],solo:true}],evil:[{line:['darkphlame_solo_04'],variants:[],solo:true}],fire:[{line:['flarephiant_solo_04'],variants:[],solo:true}],ice:[{line:['crystophy_solo_04'],variants:[],solo:true}],lightning:[{line:['thunderoph_solo_04'],variants:[],solo:true}],mythic:[{line:['primorphio_solo_04'],variants:[],solo:true}],spirit:[{line:['morgicka_solo_04'],variants:[],solo:true}],water:[{line:['aquamorph_solo_04'],variants:[],solo:true}],wind:[{line:['cyclonph_solo_04'],variants:[],solo:true}]},
  11:{earth:[{line:['terraling_01','terradrake_02','terrawyrm_03','terranir_04'],variants:[]}],mythic:[{line:['tempestnir_solo_04'],variants:[],solo:true}],wind:[{line:['drifting_01','driftdrake_02','driftwyrm_03','driftnir_04'],variants:[]}]},
  12:{mythic:[{line:['skurnub_01','skurgon_02','skurnaris_03','skurvorr_04'],variants:[]}],umbral:[{line:['duskir_01','duskuu_02','noctcuma_03'],variants:[]},{line:['umbrangler_solo_04'],variants:[],solo:true},{line:['bearmask_solo_01'],variants:[],solo:true},{line:['umbbiz_01','umbbibi_02'],variants:[]},{line:['duskit_01','duskarn_02','duskryn_03','duskvorr_04'],variants:[]}]}
};

const legendaryCupData = {
  week_01:{editions:[{name:"Kirin Edition",folder:"kirin_edition",banner:"kirin_week_banner.png",type:"mythic",monsters:[{name:"kiric_01",hasVariant:false},{name:"kiriak_02",hasVariant:false},{name:"kirin_03",hasVariant:false}]},{name:"Kenga Edition",folder:"kenga_edition",banner:"kenga_week_banner.png",type:"dragon",monsters:[{name:"kenga_01",hasVariant:false},{name:"kengarok_02",hasVariant:false},{name:"kengarion_03",hasVariant:false}]}]},
  week_02:{editions:[{name:"Arctery Edition",folder:"arcter_edition",banner:"arctery_week_banner.png",type:"mythic",monsters:[{name:"arctery_01",hasVariant:false},{name:"arcterick_02",hasVariant:false},{name:"arcterion_03",hasVariant:false}]},{name:"Leafy Edition",folder:"leafy_edition",banner:"lievi_week_banner.png",type:"dragon",monsters:[{name:"lievi_01",hasVariant:false},{name:"laforn_02",hasVariant:false},{name:"leafornite_03",hasVariant:false}]}]},
  week_03:{editions:[{name:"Griff Edition",folder:"griff_edition",banner:"griffie_week_banner.png",type:"mythic",monsters:[{name:"griffie_01",hasVariant:false},{name:"grifflio_02",hasVariant:false},{name:"grifllizon_03",hasVariant:false}]},{name:"Musta Edition",folder:"musta_edition",banner:"kolter_week_banner.png",type:"mythic",monsters:[{name:"kolter_01",hasVariant:false},{name:"fillio_02",hasVariant:false},{name:"mystang_03",hasVariant:false}]}]},
  week_04:{editions:[{name:"Glacial Edition",folder:"glacial_edition",banner:"glacic_week_banner.png",type:"dragon",monsters:[{name:"glacic_01",hasVariant:false},{name:"glacirio_02",hasVariant:false},{name:"glacigon_03",hasVariant:false}]},{name:"Pando Edition",folder:"pando_edition",banner:"pandy_week_banner.png",type:"ice",monsters:[{name:"pandy_01",hasVariant:false},{name:"pandin_02",hasVariant:false},{name:"pandizard_03",hasVariant:false}]}]},
  week_05:{editions:[{name:"Grety Edition",folder:"grety_edition",banner:"grety_week_banner.png",type:"mythic",monsters:[{name:"grety_01",hasVariant:false},{name:"greydi_02",hasVariant:false},{name:"greydon_03",hasVariant:false}]},{name:"Krus Edition",folder:"krus_edition",banner:"krus_week_banner.png",type:"dragon",monsters:[{name:"krus_01",hasVariant:false},{name:"krusil_02",hasVariant:false},{name:"krushigon_03",hasVariant:false}]}]},
  week_06:{editions:[{name:"Voca Edition",folder:"voca_edition",banner:"volcano_week_banner.png",type:"dragon",monsters:[{name:"firegon_01",hasVariant:true},{name:"alagon_02",hasVariant:true},{name:"lavagon_03",hasVariant:true},{name:"volcagon_04",hasVariant:true,hasMega:true}]}]},
  week_07:{editions:[{name:"Lamp Edition",folder:"lamp_edition",banner:"lampiz_week_banner.png",type:"dragon",monsters:[{name:"lampiz_01",hasVariant:false},{name:"lampiee_02",hasVariant:false},{name:"genierts_03",hasVariant:false}]}]},
  week_08:{editions:[{name:"Meduran Edition",folder:"meduran_edition",banner:"medy_week_banner.png",type:"mythic",monsters:[{name:"medy_01",hasVariant:false},{name:"mediss_02",hasVariant:false},{name:"medurans_03",hasVariant:false}]}]},
  week_09:{editions:[{name:"Blaze Edition",folder:"blaze_edition",banner:"blazhin_week_banner.png",type:"dragon",monsters:[{name:"blazhin_01",hasVariant:false},{name:"blazlin_02",hasVariant:false},{name:"blazlong_03",hasVariant:false}]},{name:"Volti Edition",folder:"volti_edition",banner:"voltio_week_banner.png",type:"mythic",monsters:[{name:"voltio_01",hasVariant:false},{name:"volkon_02",hasVariant:false},{name:"volcarion_03",hasVariant:false}]}]},
  week_10:{editions:[{name:"Necro Edition",folder:"necro_edition",banner:"necio_week_banner.png",type:"evil",monsters:[{name:"necio_01",hasVariant:false},{name:"nectis_02",hasVariant:false},{name:"necrolym_03",hasVariant:false}]},{name:"Nighty Edition",folder:"nighty_edition",banner:"nighty_week_banner.png",type:"dragon",monsters:[{name:"nighty_01",hasVariant:false},{name:"nightiers_02",hasVariant:false},{name:"nightigon_03",hasVariant:false}]}]},
  week_11:{editions:[{name:"Saur Edition",folder:"saur_edition",banner:"saur_week_banner.png",type:"dragon",monsters:[{name:"rocky_01",hasVariant:true},{name:"rocksaur_02",hasVariant:true},{name:"megasaur_03",hasVariant:true},{name:"ultisaur_04",hasVariant:true,hasMega:true}]}]},
  week_12:{editions:[{name:"Azlord Edition",folder:"azlord_edition",banner:"crystal_week_banner.png",type:"mythic",monsters:[{name:"ardio_01",hasVariant:false},{name:"ardris_02",hasVariant:false},{name:"ardizard_03",hasVariant:false},{name:"ardizlord_04",hasVariant:false,hasMega:true}]}]},
  week_13:{editions:[{name:"Whino Edition",folder:"whino_edition",banner:"whindz_week_banner.png",type:"wind",monsters:[{name:"whindz_01",hasVariant:false},{name:"whindniy_02",hasVariant:false},{name:"whindnoser_03",hasVariant:false}]}]},
  week_14:{editions:[{name:"Vendra Edition",folder:"vendra_edition",banner:"heavenly_week_banner.png",type:"dragon",monsters:[{name:"vingon_01",hasVariant:true},{name:"vindragon_02",hasVariant:true},{name:"vedragon_03",hasVariant:true},{name:"ventragon_04",hasVariant:true,hasMega:true}]}]},
  week_15:{editions:[{name:"Aqua Edition",folder:"aqua_edition",banner:"tidal_week_banner.png",type:"dragon",monsters:[{name:"aquatini_01",hasVariant:true},{name:"aquatir_02",hasVariant:true},{name:"aquanite_03",hasVariant:true},{name:"aquarion_04",hasVariant:true,hasMega:true}]}]}
};

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
  return filename.replace(/_\d+$/,'').replace(/_solo/g,'').split('_').map(function(w){ return w.charAt(0).toUpperCase()+w.slice(1); }).join(' ');
}

// ══════════ ANNIVERSARY ══════════
function loadMonsters(num) {
  const display = document.getElementById('monster-display');
  const data = monsterData[num];
  if (!data) { display.innerHTML = ''; return; }
  const numStr = num.toString().padStart(2,'0');
  let html = '';
  for (const type in data) {
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
        const isMega = monster.includes('_04') || (monster.includes('_03') && group.line.length===3) || (monster.includes('_02') && group.line.length===2);
        html += '<div class="evolution-stage"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/anniversary_monsters/monster_'+numStr+'th/'+esc(type)+'_type_'+numStr+'th/'+esc(monster)+'_th_'+numStr+'.webp" class="evo-stage-img'+(isMega?' mega-evolution':'')+'" data-base="'+esc(monster)+'" data-type="'+esc(type)+'" data-num="'+numStr+'" alt="'+esc(formatMonsterName(monster))+'"><div class="evolution-stage-name">'+esc(formatMonsterName(monster.replace(/_solo/g,'')))+'</div></div>';
        if (i < group.line.length-1) html += '<div class="evolution-arrow">→</div>';
      });
      html += '</div>';
      const lastM = group.line[group.line.length-1];
      if (megaItems[lastM]) {
        const realName = megaItemNames[lastM] || lastM.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
        html += '<div class="mega-item-container"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_evolution_items/'+esc(megaItems[lastM])+'.webp" alt="Mega evolution item"><div class="mega-item-label">'+esc(realName)+'</div></div>';
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
        const base = img.dataset.base, tp = img.dataset.type, n = img.dataset.num;
        if (variant==='normal') {
          swapImgSmooth(img, BASE_URL+'imagens/anniversary_monsters/monster_'+n+'th/'+tp+'_type_'+n+'th/'+base+'_th_'+n+'.webp');
        } else {
          const mod = base.replace(/(_\d+)$/,'_'+variant+'$1');
          swapImgSmooth(img, BASE_URL+'imagens/anniversary_monsters/monster_'+n+'th/'+tp+'_type_'+n+'th/'+mod+'_th_'+n+'.webp');
        }
      });
    });
  });
}

document.querySelectorAll('.anniversary-card').forEach(function(card) {
  if (card.classList.contains('coming-soon')) return; // nada pra carregar ainda
  card.addEventListener('click', function() {
    loadMonsters(parseInt(this.dataset.anniversary));
    setTimeout(function(){ document.getElementById('monster-display').scrollIntoView({behavior:'smooth',block:'start'}); }, 100);
  });
});

// ══════════ YEAR TAB ══════════
let isShiny = false;
document.getElementById('shiny-btn').addEventListener('click', function() {
  isShiny = !isShiny;
  const s = isShiny ? '_shyne' : '';
  swapImgSmooth(document.getElementById('main-monster-img'), BASE_URL+'imagens/monster_of_the_year/ventragon_04'+s+'_monster_year_2025.webp');
  const names = ['vingon_01','vindragon_02','vedragon_03','ventragon_04'];
  document.querySelectorAll('.evo-img').forEach(function(img,i){ swapImgSmooth(img, BASE_URL+'imagens/monster_of_the_year/'+names[i]+s+'_monster_year_2025.webp'); });
  this.textContent = isShiny ? '✦ Show Normal Version' : '✦ Toggle Shyne Variant';
});

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

function getPrizeIcon(itemName) {
  const name = itemName.toLowerCase();
  
  // Items
  if (name.includes('ice cream')) return BASE_URL + 'imagens/itens/candys/ice_cream.webp';
  if (name.includes('lollipop')) return BASE_URL + 'imagens/itens/candys/lollipop.webp';
  if (name.includes('candy')) return BASE_URL + 'imagens/itens/candys/candy.webp';
  if (name.includes('glass cup')) return BASE_URL + 'imagens/itens/candys/glass_cup.webp';
  if (name.includes('monster ticket')) return BASE_URL + 'imagens/itens/ticket/monster_ticket.png';
  if (name.includes('item draw ticket')) return BASE_URL + 'imagens/itens/ticket/item_draw_ticket.png';
  if (name.includes('memory feather')) return BASE_URL + 'imagens/itens/skill/memory_feather.webp';
  
  // Mega Items
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
  
  // Monstros LC - Mapear para sprites
  const monsterMap = {
    'kiric': { week: 'week_01', edition: 'kirin_edition', sprite: 'kiric_mythic_type_01.webp' },
    'kenga': { week: 'week_01', edition: 'kenga_edition', sprite: 'kenga_dragon_type_01.webp' },
    'arctery': { week: 'week_02', edition: 'arcter_edition', sprite: 'arctery_mythic_type_01.webp' },
    'lievi': { week: 'week_02', edition: 'leafy_edition', sprite: 'lievi_dragon_type_01.webp' },
    'griffie': { week: 'week_03', edition: 'griff_edition', sprite: 'griffie_mythic_type_01.webp' },
    'kolter': { week: 'week_03', edition: 'musta_edition', sprite: 'kolter_mythic_type_01.webp' },
    'glacic': { week: 'week_04', edition: 'glacial_edition', sprite: 'glacic_dragon_type_01.webp' },
    'pandy': { week: 'week_04', edition: 'pando_edition', sprite: 'pandy_ice_type_01.webp' },
    'grety': { week: 'week_05', edition: 'grety_edition', sprite: 'grety_mythic_type_01.webp' },
    'krus': { week: 'week_05', edition: 'krus_edition', sprite: 'krus_dragon_type_01.webp' },
    'lampiz': { week: 'week_07', edition: 'lamp_edition', sprite: 'lampiz_dragon_type_01.webp' },
    'medy': { week: 'week_08', edition: 'meduran_edition', sprite: 'medy_mythic_type_01.webp' },
    'blazhin': { week: 'week_09', edition: 'blaze_edition', sprite: 'blazhin_dragon_type_01.webp' },
    'voltio': { week: 'week_09', edition: 'volti_edition', sprite: 'voltio_mythic_type_01.webp' },
    'necio': { week: 'week_10', edition: 'necro_edition', sprite: 'necio_evil_type_01.webp' },
    'nighty': { week: 'week_10', edition: 'nighty_edition', sprite: 'nighty_dragon_type_01.webp' },
    'whindz': { week: 'week_13', edition: 'whino_edition', sprite: 'whindz_wind_type_01.webp' }
  };
  
  // Verificar se é um monstro
  for (const [monsterName, info] of Object.entries(monsterMap)) {
    if (name.includes(monsterName)) {
      return BASE_URL + 'imagens/legendery_cup_edition/' + info.week + '/' + info.edition + '/' + info.sprite;
    }
  }
  
  return BASE_URL + 'imagens/logos/bulu_monster_logo.png';
}

function parsePrizes(prizeString) {
  const prizes = [];
  const parts = prizeString.split(',').map(s => s.trim());
  parts.forEach(part => {
    const match = part.match(/^(\d+)\s+(.+?)(?:\s+\(.*\))?$/);
    if (match) {
      prizes.push({
        name: match[2],
        text: part,
        icon: getPrizeIcon(match[2]),
        quantity: match[1]
      });
    } else {
      const itemName = part.replace(/\(.*\)/, '').trim();
      prizes.push({
        name: itemName,
        text: part,
        icon: getPrizeIcon(itemName),
        quantity: '1'
      });
    }
  });
  return prizes;
}

function generatePrizesHTML(weekNumber, editionName) {
  if (!lcPrizesData || !lcPrizesData.weeks) return '';
  const prizeData = lcPrizesData.weeks.find(w => w.number === weekNumber && w.name === editionName);
  if (!prizeData) return '';
  
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
    parsePrizes(prizeData[rank.key]).forEach(prize => {
      html += '<div class="prize-item"><img loading="lazy" decoding="async" src="' + prize.icon + '" class="prize-icon" alt="' + esc(prize.name) + '"><span class="prize-text">' + esc(prize.text) + '</span></div>';
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
      parsePrizes(prizeText).forEach(prize => {
        html += '<div class="prize-item"><img loading="lazy" decoding="async" src="' + prize.icon + '" class="prize-icon" alt="' + esc(prize.name) + '"><span class="prize-text">' + esc(prize.text) + '</span></div>';
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
  loadLegendaryCups(); // Monstros/banners aparecem na hora (dados já estão no código)
  await loadLCPrizes(); // Prêmios são buscados em paralelo (fetch do JSON)
  injectPrizesIntoDOM(); // Assim que chegam, são encaixados em cada edição
}

function injectPrizesIntoDOM() {
  if (!lcPrizesData) return;
  document.querySelectorAll('.edition-container').forEach(function(container) {
    if (container.querySelector('.prizes-section')) return; // já injetado
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
    html += '<div class="week-section"><div class="week-title">Week ' + weekNum + '</div>';
    legendaryCupData[weekKey].editions.forEach(function(edition, editionIndex) {
      const edId = weekKey+'-'+editionIndex;
      const hasVariants = edition.monsters.some(function(m){return m.hasVariant;});
      html += '<div class="edition-container" id="edition-'+edId+'" data-week="'+weekNum+'" data-edition="'+esc(edition.name)+'"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/legendery_cup_edition/'+weekKey+'/'+esc(edition.folder)+'/'+esc(edition.banner)+'" alt="'+esc(edition.name)+'" class="edition-banner" data-toggle-prizes><div class="edition-info"><div class="edition-name" data-toggle-prizes>'+esc(edition.name)+'</div><span class="edition-type-badge">'+esc(edition.type)+' Type</span></div>';
      if (hasVariants) {
        html += '<div class="variant-buttons"><button class="variant-btn active" data-edition-id="'+edId+'" data-variant="normal">Normal</button><button class="variant-btn" data-edition-id="'+edId+'" data-variant="shyne">Shyne</button></div>';
      }
      html += '<div class="evolution-stages">';
      edition.monsters.forEach(function(monster,i) {
        const isMega = monster.hasMega||false;
        html += '<div class="evolution-stage"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/legendery_cup_edition/'+weekKey+'/'+esc(edition.folder)+'/'+monster.name.replace(/_\d+$/,'')+'_'+esc(edition.type)+'_type_'+monster.name.match(/\d+$/)[0]+'.webp" alt="'+esc(formatMonsterName(monster.name))+'" class="legendary-monster-img'+(isMega?' mega-evolution':'')+'" data-base="'+esc(monster.name)+'" data-type="'+esc(edition.type)+'" data-folder="'+esc(edition.folder)+'" data-week="'+weekKey+'"><div class="evolution-stage-name">'+esc(formatMonsterName(monster.name))+'</div></div>';
        if (i < edition.monsters.length-1) html += '<div class="evolution-arrow">→</div>';
      });
      html += '</div>';
      const lastM = edition.monsters[edition.monsters.length-1];
      if (lastM.hasMega && megaItems[lastM.name]) {
        const realName = megaItemNames[lastM.name] || lastM.name.replace(/_/g,' ');
        html += '<div class="mega-item-container"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_evolution_items/'+esc(megaItems[lastM.name])+'.webp" alt="Mega evolution item"><div class="mega-item-label">'+esc(realName)+'</div></div>';
      }
      html += '<button class="mi-btn mi-open-btn" data-lc="' + esc(edition.name) + '"><span class="mi-btn-icon">📖</span> Monster Information</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  display.innerHTML = html;
  
  // Botões Monster Information — event delegation
  display.addEventListener('click', function(e) {
    var btn = e.target.closest('.mi-open-btn');
    if (btn) openMonsterInfo(btn.dataset.lc);
  });

  // Toggle prizes (a seção só existe depois que injectPrizesIntoDOM roda)
  display.addEventListener('click', function(e) {
    var el = e.target.closest('[data-toggle-prizes]');
    if (!el) return;
    const container = el.closest('.edition-container');
    const prizesSection = container.querySelector('.prizes-section');
    if (prizesSection) {
      prizesSection.classList.toggle('active');
    }
  });
  
  // Variant buttons
  display.querySelectorAll('.variant-btn[data-edition-id]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const edId = this.dataset.editionId, variant = this.dataset.variant;
      const container = document.getElementById('edition-'+edId);
      container.querySelectorAll('.variant-btn').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      container.querySelectorAll('.legendary-monster-img').forEach(function(img) {
        const base=img.dataset.base,tp=img.dataset.type,folder=img.dataset.folder,week=img.dataset.week;
        const sfx = variant==='shyne'?'_shyne':'';
        const nameNoNum = base.replace(/_\d+/,'');
        const num = base.match(/_(\d+)/)[1];
        swapImgSmooth(img, BASE_URL+'imagens/legendery_cup_edition/'+week+'/'+folder+'/'+nameNoNum+sfx+'_'+tp+'_type_'+num+'.webp');
      });
    });
  });
}

// ══════════ SKILLS ══════════
let allSkills = [], currentFilter = 'all', currentSort = 'name';

async function loadAllSkills() {
  const types = ['common','dragon','earth','evil','fire','ice','lightning','mythic','spirit','water','wind'];
  const results = await Promise.all(types.map(function(type) {
    return fetch(BASE_URL+'data/upgrade_skill/'+type+'_type_skill.json')
      .then(function(r){return r.json();})
      .then(function(skills){return skills.map(function(s){return Object.assign({},s,{type:type});});})
      .catch(function(){return [];});
  }));
  allSkills = results.flat();
  displaySkills();
}

function displaySkills() {
  const searchTerm = document.getElementById('skill-search').value.toLowerCase();
  let filtered = allSkills;
  if (currentFilter !== 'all') filtered = filtered.filter(function(s){return s.type===currentFilter;});
  if (searchTerm) filtered = filtered.filter(function(s){return s.name.toLowerCase().includes(searchTerm);});
  // Sort
  filtered = filtered.slice().sort(function(a,b){
    if (currentSort==='name') return a.name.localeCompare(b.name);
    if (currentSort==='power-desc') return b.power-a.power;
    if (currentSort==='power-asc') return a.power-b.power;
    if (currentSort==='pp-desc') return b.pp-a.pp;
    if (currentSort==='pp-asc') return a.pp-b.pp;
    return 0;
  });
  document.getElementById('skills-count').textContent = 'Showing '+filtered.length+' of '+allSkills.length+' skills';
  if (!filtered.length) { document.getElementById('skills-grid').innerHTML='<div class="no-results">No skills found</div>'; return; }
  document.getElementById('skills-grid').innerHTML = filtered.map(function(skill) {
    const bookBg = BASE_URL+'imagens/book_background/monster_book_'+esc(skill.type)+'.webp';
    return '<div class="skill-card sk-'+esc(skill.type)+'"><div class="skill-spine"></div><div class="skill-header"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/book_upgrade_skill/item_icon_skill_book_upgrade_type_'+esc(skill.type)+'.webp" class="skill-book-icon" alt="'+esc(skill.type)+'"><div class="skill-title"><div class="skill-name">'+esc(skill.name)+'</div><span class="skill-type-badge">'+esc(skill.type)+' type</span></div></div><div class="skill-stats"><div class="stat-item"><div class="stat-label">PP</div><div class="stat-value">'+esc(skill.pp)+'</div></div><div class="stat-item"><div class="stat-label">Power</div><div class="stat-value power">'+esc(skill.power)+'</div></div><div class="stat-item"><div class="stat-label">Precision</div><div class="stat-value precision">'+esc(skill.precision)+'</div></div></div><div class="skill-effect"><strong>Effect:</strong> '+esc(skill.effect)+'</div></div>';
  }).join('');
}

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
      return '<div class="attack-skill-card '+tc+'" style="--bg-image:url(\''+banner+'\')"><span class="attack-badge">Attack Opening Skill</span><div class="attack-skill-header"><img loading="lazy" decoding="async" src="'+sprite+'" class="monster-sprite" alt="'+esc(name)+'"><div class="attack-skill-info"><div class="attack-skill-name">'+esc(skill.name)+'</div><div class="monster-name-label">'+esc(skill.monster)+'</div><div class="attack-skill-type">'+esc(skill.type)+' Type</div></div></div><div class="attack-skill-stats"><div class="attack-stat-item"><div class="attack-stat-label">Power</div><div class="attack-stat-value">'+esc(skill.power)+'</div></div><div class="attack-stat-item"><div class="attack-stat-label">Precision</div><div class="attack-stat-value">'+esc(skill.precision)+'</div></div></div><div class="attack-skill-effect">'+esc(skill.effect)+'</div></div>';
    }).join('');
  } catch(e) {
    document.getElementById('attack-skills-grid').innerHTML='<div class="no-results">Failed to load attack skills</div>';
  }
}

// ══════════ MEGA MONSTERS ══════════
let allMegaMonsters=[], currentMegaFilter='all', currentVariants={};

async function loadMegaMonsters() {
  try {
    allMegaMonsters=await fetch(BASE_URL+'data/mega_monsters.json').then(function(r){return r.json();});
    // Novos monstros adicionados inline
    var newMegas = [
      {
        monster: 'Fortunarch', monster_key: 'fortunarch', type: 'fire',
        item: 'fortunarch_evo_fortune_crest.webp',
        item_name: 'Fortune Crest',
        sprites: [{ variant: 'normal', file: 'fortunarch_type_fire_.webp' }]
      },
      {
        monster: 'Froscorium', monster_key: 'froscorium', type: 'ice',
        item: 'froscorium_evo_glacial_armor.webp',
        item_name: 'Glacial Armor',
        sprites: [{ variant: 'normal', file: 'froscorium_type_ice_.webp' }]
      }
    ];
    // Adicionar apenas se ainda não existirem
    newMegas.forEach(function(nm) {
      if (!allMegaMonsters.find(function(m){ return m.monster_key === nm.monster_key; })) {
        allMegaMonsters.push(nm);
      }
    });
    displayMegaMonsters();
  } catch(e) {
    document.getElementById('mega-grid').innerHTML='<div class="no-results">Failed to load mega monsters</div>';
  }
}

function displayMegaMonsters() {
  const searchTerm=document.getElementById('mega-search').value.toLowerCase();
  let filtered=allMegaMonsters;
  if (currentMegaFilter!=='all') filtered=filtered.filter(function(m){return m.type===currentMegaFilter;});
  if (searchTerm) filtered=filtered.filter(function(m){return m.monster.toLowerCase().includes(searchTerm)||(m.item_name&&m.item_name.toLowerCase().includes(searchTerm));});
  document.getElementById('mega-count').textContent='Showing '+filtered.length+' of '+allMegaMonsters.length+' monsters';
  if (!filtered.length){document.getElementById('mega-grid').innerHTML='<div class="no-results">No monsters found</div>';return;}
  document.getElementById('mega-grid').innerHTML=filtered.map(function(monster){
    if (!currentVariants[monster.monster_key]) currentVariants[monster.monster_key]='normal';
    const curV=currentVariants[monster.monster_key];
    const curSprite=monster.sprites.find(function(s){return s.variant===curV;})||monster.sprites[0];
    const variants=[...new Set(monster.sprites.map(function(s){return s.variant;}))];
    const tc='type-'+monster.type;
    const variantLabels={normal:'Normal',shyne:'✦ Shyne',christmas:'Xmas',easter:'Easter',sigma:'Sigma',chinese_new_year:'CNY',anniversary:'Anniv',hyakki_yagyo:'Hyakki',valentines:'Valentine'};
    return '<div class="mega-card '+tc+'"><div class="mega-card-overlay"></div><div class="mega-card-inner"><div class="mega-card-header"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_monster/'+esc(curSprite.file)+'" class="mega-monster-sprite" alt="'+esc(monster.monster)+'"><div class="mega-monster-info"><div class="mega-monster-name">'+esc(monster.monster)+'</div><span class="mega-type-badge '+tc+'">'+esc(monster.type)+'</span></div></div>'+(monster.item?'<div class="mega-item-section"><div class="mega-item-label">Mega Evolution Item</div><div class="mega-item-display"><img loading="lazy" decoding="async" src="'+BASE_URL+'imagens/mega_evolution_items/'+esc(monster.item)+'" class="mega-item-icon" alt="Mega evolution item"><div class="mega-item-name">'+esc(monster.item_name)+'</div></div></div>':'')+(variants.length>1?'<div class="mega-variant-section">'+variants.map(function(v){return'<button class="mega-variant-btn '+esc(v)+(curV===v?' active':'')+'" data-monster="'+esc(monster.monster_key)+'" data-variant="'+esc(v)+'">'+(variantLabels[v]||v)+'</button>';}).join('')+'</div>':'')+'</div></div>';
  }).join('');
}

// Troca de variante: atualização cirúrgica (só o card clicado), sem
// reconstruir a grade inteira — evita todas as imagens sumirem/recarregarem.
// Delegação de evento presa no #mega-grid, sobrevive a qualquer re-render.
document.getElementById('mega-grid').addEventListener('click', function(e) {
  const btn = e.target.closest('.mega-variant-btn');
  if (!btn) return;
  const key = btn.dataset.monster, variant = btn.dataset.variant;
  currentVariants[key] = variant;
  const monster = allMegaMonsters.find(function(m){ return m.monster_key === key; });
  if (!monster) return;
  const card = btn.closest('.mega-card');
  if (!card) return;
  const curSprite = monster.sprites.find(function(s){ return s.variant === variant; }) || monster.sprites[0];
  swapImgSmooth(card.querySelector('.mega-monster-sprite'), BASE_URL+'imagens/mega_monster/'+curSprite.file);
  card.querySelectorAll('.mega-variant-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.variant === variant); });
});

document.getElementById('mega-search').addEventListener('input', displayMegaMonsters);
document.querySelectorAll('.mega-filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.mega-filter-btn').forEach(function(b){b.classList.remove('active');});
    this.classList.add('active'); currentMegaFilter=this.dataset.type; displayMegaMonsters();
  });
});

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

// Mostrar skeletons ao trocar de aba (antes dos dados carregarem)
var originalLoadAllSkills = loadAllSkills;
loadAllSkills = function() {
  createSkeletons('skills-grid', 9, 'skill');
  return originalLoadAllSkills.apply(this, arguments);
};

var originalLoadMegaMonsters = loadMegaMonsters;
loadMegaMonsters = function() {
  createSkeletons('mega-grid', 8, 'card');
  return originalLoadMegaMonsters.apply(this, arguments);
};

var originalLoadItems = loadItems;
loadItems = function() {
  createSkeletons('items-grid', 12, 'item');
  return originalLoadItems.apply(this, arguments);
};

var originalLoadPotentials = loadPotentials;
loadPotentials = function() {
  createSkeletons('potentials-grid', 9, 'card');
  return originalLoadPotentials.apply(this, arguments);
};



// ══════════ LC TIMER ══════════
(function() {

    // Week schedule — editions in order
    // Each week: [edition1, edition2] or [edition1] if single
    var weekSchedule = [
        ['Kirin Edition',    'Kenga Edition'],    // week 01
        ['Arctery Edition',  'Leafy Edition'],    // week 02
        ['Griff Edition',    'Musta Edition'],    // week 03
        ['Glacial Edition',  'Pando Edition'],    // week 04
        ['Grety Edition',    'Krus Edition'],     // week 05
        ['Voca Edition'],                         // week 06
        ['Lamp Edition'],                         // week 07
        ['Meduran Edition'],                      // week 08
        ['Blaze Edition',    'Volti Edition'],    // week 09
        ['Necro Edition',    'Nighty Edition'],   // week 10
        ['Saur Edition'],                         // week 11
        ['Azlord Edition'],                       // week 12
        ['Whino Edition'],                        // week 13
        ['Vendra Edition'],                       // week 14
        ['Aqua Edition'],                         // week 15
    ];
    var TOTAL_WEEKS = weekSchedule.length; // 15

    // ── UTC SESSIONS ──
    // Each session: { utcDay, utcH, utcM, durationH, slot }
    // slot: 'ed1'=edition1 only | 'ed2'=edition2 only | 'both'=both alternate
    // UTC times from screenshot: 02-04, 08-10, 14-16, 20-22
    // LC starts Wednesday night Brazil = Thursday UTC (Wed 23h BRT = Thu 02h UTC)
    // 
    // Sessions distribution (week with 2 editions):
    //   Thu 02-04 UTC (Wed 23-01 BRT) → ed1
    //   Thu 08-10 UTC (Thu 05-07 BRT) → ed1
    //   Thu 14-16 UTC (Thu 11-13 BRT) → ed1
    //   Thu 20-22 UTC (Thu 17-19 BRT) → ed1
    //   Fri 02-04 UTC (Thu 23-01 BRT) → ed2  ← note: Thu night BRT = Fri UTC
    //   Fri 08-10 UTC (Fri 05-07 BRT) → ed2
    //   Fri 14-16 UTC (Fri 11-13 BRT) → ed2
    //   Fri 20-22 UTC (Fri 17-19 BRT) → ed2
    //   Sat 02-04 UTC (Fri 23-01 BRT) → both
    //   Sat 08-10 UTC (Sat 05-07 BRT) → both
    //   Sat 14-16 UTC (Sat 11-13 BRT) → both
    //   Sat 20-22 UTC (Sat 17-19 BRT) → both (last)
    // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    var sessions = [
        { utcDay:4, utcH:2,  durationH:2, slot:'ed1', brLabel:'Wed 23:00 – 01:00', utcLabel:'Thu 02:00 – 04:00' },
        { utcDay:4, utcH:8,  durationH:2, slot:'ed1', brLabel:'Thu 05:00 – 07:00', utcLabel:'Thu 08:00 – 10:00' },
        { utcDay:4, utcH:14, durationH:2, slot:'ed1', brLabel:'Thu 11:00 – 13:00', utcLabel:'Thu 14:00 – 16:00' },
        { utcDay:4, utcH:20, durationH:2, slot:'ed1', brLabel:'Thu 17:00 – 19:00', utcLabel:'Thu 20:00 – 22:00' },
        { utcDay:5, utcH:2,  durationH:2, slot:'ed2', brLabel:'Thu 23:00 – 01:00', utcLabel:'Fri 02:00 – 04:00' },
        { utcDay:5, utcH:8,  durationH:2, slot:'ed2', brLabel:'Fri 05:00 – 07:00', utcLabel:'Fri 08:00 – 10:00' },
        { utcDay:5, utcH:14, durationH:2, slot:'ed2', brLabel:'Fri 11:00 – 13:00', utcLabel:'Fri 14:00 – 16:00' },
        { utcDay:5, utcH:20, durationH:2, slot:'ed2', brLabel:'Fri 17:00 – 19:00', utcLabel:'Fri 20:00 – 22:00' },
        { utcDay:6, utcH:2,  durationH:2, slot:'both', brLabel:'Fri 23:00 – 01:00', utcLabel:'Sat 02:00 – 04:00' },
        { utcDay:6, utcH:8,  durationH:2, slot:'both', brLabel:'Sat 05:00 – 07:00', utcLabel:'Sat 08:00 – 10:00' },
        { utcDay:6, utcH:14, durationH:2, slot:'both', brLabel:'Sat 11:00 – 13:00', utcLabel:'Sat 14:00 – 16:00' },
        { utcDay:6, utcH:20, durationH:2, slot:'both', brLabel:'Sat 17:00 – 19:00 ✦ Last', utcLabel:'Sat 20:00 – 22:00 ✦ Last' },
    ];

    // ── REFERENCE DATE ──
    // LC Week 01 started on a Wednesday — we need a known reference
    // Ancora corrigida: Thu 02:00 UTC Mar 05 2026 = start of week 06 first session
    // (usar essa data como base garante que a semana calculada bate com o jogo)
    var ANCHOR_UTC = new Date(Date.UTC(2026, 2, 5, 2, 0, 0)); // Mar 05 2026 02:00 UTC = Week 01

    function getNowUTC() {
        return new Date();
    }

    function getSessionDates(now, weekOffset) {
        // Calculate session start/end for current or offset week cycle
        // Find the Thursday of the current week (UTC)
        var ms = now.getTime();
        var dayUTC = now.getUTCDay(); // 0=Sun
        // Days since last Thursday (day 4)
        var daysSinceThu = (dayUTC + 7 - 4) % 7;
        var thisThu = new Date(ms - daysSinceThu * 86400000);
        thisThu.setUTCHours(0,0,0,0);
        // Apply week offset
        thisThu = new Date(thisThu.getTime() + weekOffset * 7 * 86400000);

        return sessions.map(function(s) {
            var startDay = new Date(thisThu);
            // sessions are relative to Thursday (utcDay 4)
            // Thu=4 → offset 0, Fri=5 → offset 1, Sat=6 → offset 2
            var dayOffset = s.utcDay - 4;
            startDay.setUTCDate(startDay.getUTCDate() + dayOffset);
            startDay.setUTCHours(s.utcH, 0, 0, 0);
            var endDay = new Date(startDay.getTime() + s.durationH * 3600000);
            return { start: startDay, end: endDay, session: s };
        });
    }

    function getCurrentWeekIndex(now) {
        // How many full 7-day cycles since ANCHOR_UTC?
        var diffMs = now.getTime() - ANCHOR_UTC.getTime();
        var diffWeeks = Math.floor(diffMs / (7 * 86400000));
        return ((diffWeeks % TOTAL_WEEKS) + TOTAL_WEEKS) % TOTAL_WEEKS;
    }

    function getEditionNames(weekIdx, slot) {
        var eds = weekSchedule[weekIdx];
        if (eds.length === 1) return [eds[0]];
        if (slot === 'ed1') return [eds[0]];
        if (slot === 'ed2') return [eds[1]];
        return [eds[0], eds[1]]; // both
    }

    function getLCStatus() {
        var now = getNowUTC();
        var weekIdx = getCurrentWeekIndex(now);

        // Check current week sessions
        for (var w = 0; w <= 1; w++) {
            var sessDates = getSessionDates(now, w);
            for (var i = 0; i < sessDates.length; i++) {
                var sd = sessDates[i];
                if (now >= sd.start && now < sd.end) {
                    var wi = ((weekIdx + w) % TOTAL_WEEKS + TOTAL_WEEKS) % TOTAL_WEEKS;
                    return {
                        live: true,
                        endsAt: sd.end,
                        session: sd.session,
                        editions: getEditionNames(wi, sd.session.slot),
                        weekNum: wi + 1
                    };
                }
            }
        }

        // Find next session
        var nextSd = null, nextWi = 0, minDiff = Infinity;
        for (var w = 0; w <= 1; w++) {
            var sessDates = getSessionDates(now, w);
            for (var i = 0; i < sessDates.length; i++) {
                var diff = sessDates[i].start - now;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextSd = sessDates[i];
                    nextWi = ((weekIdx + w) % TOTAL_WEEKS + TOTAL_WEEKS) % TOTAL_WEEKS;
                }
            }
        }

        return {
            live: false,
            nextStart: nextSd ? nextSd.start : null,
            nextSession: nextSd ? nextSd.session : null,
            nextEditions: nextSd ? getEditionNames(nextWi, nextSd.session.slot) : [],
            msUntil: minDiff,
            weekNum: nextWi + 1
        };
    }

    function pad(n) { return n < 10 ? '0'+n : ''+n; }


// ══════════ LC TAB BADGE ══════════
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
            var src = BASE_URL + 'imagens/legendery_cup_edition/' + weekKey + '/' + ed.folder + '/' + ed.banner;
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

    document.querySelectorAll('.tab-button').forEach(function(btn) {
        if (btn.dataset.tab === 'legendary') {
            btn.addEventListener('click', function() { setTimeout(renderBanner, 80); });
        }
    });

})();


// ══════════ BACK TO TOP ══════════
// ══════════ HOME TAB ══════════
function loadHomeTab() {
  // Home simplificada — sem curiosidades/trivia.
}

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
  common:'#a8a878',dragon:'#7038f8',earth:'#e0c068',evil:'#705848',
  fire:'#f08030',ice:'#98d8d8',lightning:'#f8d030',mythic:'#ee99ac',
  spirit:'#705898',water:'#6890f0',wind:'#a890f0',umbral:'#7a4aaa'
};
var BOOK_BG = {
  common:'monster_book_common.webp',dragon:'monster_book_dragon.webp',
  earth:'monster_book_earth.webp',evil:'monster_book_evil.webp',
  fire:'monster_book_fire.webp',ice:'monster_book_ice.webp',
  lightning:'monster_book_lightning.webp',mythic:'monster_book_mythic.webp',
  spirit:'monster_book_spirit.webp',water:'monster_book_water.webp',
  wind:'monster_book_wind.webp',umbral:'monster_book_umbral.webp'
};

// Carregar stats do GitHub
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
  var week = found.week;
  var edition = found.edition;
  var type = edition.type.toLowerCase();
  var typeColor = TYPE_COLORS[type] || '#3fa9f5';

  // Stats do JSON (pode ser null se ainda não tiver)
  var stats = null;
  for (var i = 0; i < lcStatsData.length; i++) {
    if (lcStatsData[i].lc_name === lcName) { stats = lcStatsData[i]; break; }
  }

  // Fundo do livro
  var bookUrl = BASE_URL + 'imagens/book_background/' + (BOOK_BG[type] || 'monster_book_common.webp');
  document.getElementById('mi-card-bg').style.backgroundImage = 'url(' + bookUrl + ')';

  // Resetar tudo
  var monsterImg = document.getElementById('mi-monster-img');
  monsterImg.classList.remove('revealed');
  monsterImg.src = '';
  document.getElementById('mi-name-bar').classList.remove('revealed');
  ['hp','atk','def','spd'].forEach(function(k) {
    document.getElementById('mi-row-' + k).classList.remove('revealed');
    document.getElementById('mi-bar-' + k).style.width = '0%';
    document.getElementById('mi-num-' + k).textContent = stats ? stats[k] : '—';
  });

  // Nome, tipo, estrelas
  document.getElementById('mi-monster-name').textContent = stats ? stats.monster_name : edition.name;
  var pill = document.getElementById('mi-type-pill');
  pill.textContent = type;
  pill.style.color = typeColor;
  pill.style.borderColor = typeColor + '55';
  pill.style.background = typeColor + '20';
  document.getElementById('mi-stars-row').textContent = stats ? '★'.repeat(stats.stars) : '';

  // Linha evolutiva mini
  var evoEl = document.getElementById('mi-evoline');
  evoEl.innerHTML = '';
  var evoItems = [];
  edition.monsters.forEach(function(m, idx) {
    var nameNoNum = m.name.replace(/_\d+$/, '');
    var num = m.name.match(/\d+$/)[0];
    var imgSrc = BASE_URL + 'imagens/legendery_cup_edition/' + week + '/' + edition.folder + '/' +
                 nameNoNum + '_' + edition.type + '_type_' + num + '.webp';
    var dispName = nameNoNum.replace(/_/g,' ');
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

  // Abrir overlay
  document.getElementById('mi-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Animar evoluções
  var delay = 150;
  evoItems.forEach(function(item) {
    setTimeout(function() {
      item.el.classList.add('revealed');
    }, delay);
    delay += item.isArrow ? 100 : 300;
  });

  // Imagem grande do monstro final
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

  // Stats surgem depois
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

  // Barra de nome
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

window.addEventListener('load', function() {
  loadHomeTab();
});

