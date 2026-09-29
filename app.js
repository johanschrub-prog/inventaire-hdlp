alert("APP JS CHARGE");
let currentTab = "";
let currentIndex = 0;
let inventaire = {};

async function charger(){

    const r =
    await fetch("inventaire.json");

    const sauvegarde =
localStorage.getItem(
"inventaireHDLP"
);

if(sauvegarde){

    inventaire =
    JSON.parse(sauvegarde);

}
else{

    inventaire =
    await r.json();

}

    currentTab =
    Object.keys(inventaire)[0];

    creerOnglets();

    afficherArticle();

}

function creerOnglets(){

    let html = "";

    Object.keys(inventaire)
    .forEach(cat=>{

        html += `
        <button
        class="tab ${
            cat===currentTab
            ? "active"
            : ""
        }"
        onclick="changerOnglet('${cat}')">

        ${cat}

        </button>
        `;

    });

    document
    .getElementById("tabs")
    .innerHTML = html;

}

function changerOnglet(cat){

    currentTab = cat;
    currentIndex = 0;

    creerOnglets();

    afficherArticle();

}
function importerFournisseur(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"array"}
        );

        inventaire = {};

        workbook.SheetNames.forEach(nomFeuille => {

            const sheet =
            workbook.Sheets[nomFeuille];

            const rows =
            XLSX.utils.sheet_to_json(sheet);

            inventaire[nomFeuille] = [];

            rows.forEach(row => {

                inventaire[nomFeuille].push({

                    id: crypto.randomUUID(),

                    ordre:
                        Number(
                            row.ORDRE || 9999
                        ),

                    code:
                        String(
                            row.NA || ""
                        ),

                    article:
                        String(
                            row.ARTICLE || ""
                        ),

                    categorie:
                        String(
                            row.CATEGORIE || ""
                        ),

                    conditionnement:
                        String(
                            row.CONDITIONNEMENT || ""
                        ),

                    codesBarres: [],

                    paquets:
                        Number(
                            row.PAQUET || 0
                        ),

                    pieces:
                        Number(
                            row.PIECE || 0
                        )

                });

            });

            inventaire[nomFeuille]
            .sort(
                (a,b)=>
                a.ordre-b.ordre
            );

        });

        localStorage.setItem(
            "inventaireHDLP",
            JSON.stringify(inventaire)
        );

        currentTab =
        Object.keys(inventaire)[0];

        currentIndex = 0;

        creerOnglets();

        afficherArticle();

        alert(
            Object.keys(inventaire).length +
            " onglets importés"
        );

    };

    reader.readAsArrayBuffer(file);



}
function afficherArticle(){

    const produit =
    inventaire[currentTab][currentIndex];

    if(!produit) return;

    document
    .getElementById("contenu")
    .innerHTML = `

    <div class="card">

        <div>
        Ordre : ${produit.ordre}
        </div>

        <h2>
        ${produit.code}
        </h2>

        <h3>
        ${produit.article}
        </h3>

        <div>

        Paquets

        <input
        id="paquets"
        type="number"
        value="${
            produit.paquets || ""
        }">

        </div>

        <div>

        Pièces

        <input
        id="pieces"
        type="number"
        value="${
            produit.pieces || ""
        }">

        </div>

        <div class="nav">

            <button onclick="precedent()">
            ◀
            </button>

            <button onclick="valider()">
            ✅
            </button>

            <button onclick="suivant()">
            ▶
            </button>

        </div>

    </div>
    `;

}

function valider(){

    let produit =
    inventaire[currentTab][currentIndex];

    produit.paquets =
    parseInt(
        document
        .getElementById("paquets")
        .value || 0
    );

    produit.pieces =
    parseInt(
        document
        .getElementById("pieces")
        .value || 0
    );

    suivant();

}

function suivant(){

    if(
        currentIndex <
        inventaire[currentTab].length - 1
    ){

        currentIndex++;

    }

    afficherArticle();

}

function precedent(){

    if(currentIndex > 0){

        currentIndex--;

    }

    afficherArticle();

}

function rechercher(){

    const texte =
    document
    .getElementById("search")
    .value
    .toLowerCase();

    const index =
    inventaire[currentTab]
    .findIndex(

        p =>

        p.article
        .toLowerCase()
        .includes(texte)

        ||

        p.code
        .toLowerCase()
        .includes(texte)

    );

    if(index >= 0){

        currentIndex = index;

        afficherArticle();

    }

}

charger();
