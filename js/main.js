const data = [
  {
    year: 1,
    banner: "01th-anniversary.jpg",
    monsters: [
      { name: "vingon", id: "01", mega: false },
      { name: "vindragon", id: "02", mega: false },
      { name: "vedragon", id: "03", mega: false },
      { name: "ventragon", id: "04", mega: true }
    ]
  }
  // 👉 Você pode continuar até o 12º só copiando esse bloco
];

const content = document.getElementById("content");

data.forEach(y => {
  const section = document.createElement("section");
  section.className = "anniversary";

  section.innerHTML = `
    <img class="banner" src="imagens/banner/${y.banner}">
    <div class="monsters"></div>
  `;

  const container = section.querySelector(".monsters");

  y.monsters.forEach(m => {
    const card = document.createElement("div");
    card.className = "card" + (m.mega ? " mega" : "");

    card.innerHTML = `
      <img class="monster" src="imagens/monster_of_the_year/${m.name}_${m.id}_monster_year_2025.webp">
      ${m.mega ? `<img class="mega-item" src="imagens/type_icon/mythic_type_icon.png">` : ""}
      <div class="buttons">
        <button onclick="swap(this,'normal')">Normal</button>
        <button onclick="swap(this,'shyne')">Shiny</button>
      </div>
    `;

    container.appendChild(card);
  });

  content.appendChild(section);
});

function swap(btn, type) {
  const img = btn.closest(".card").querySelector(".monster");
  if (type === "shyne") {
    img.src = img.src.replace("_monster_", "_shyne_monster_");
  } else {
    img.src = img.src.replace("_shyne_monster_", "_monster_");
  }
}

setTimeout(() => {
  document.getElementById("loading").style.display = "none";
}, 3000);
