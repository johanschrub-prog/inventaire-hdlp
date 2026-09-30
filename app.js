alert("APP JS CHARGE2");
let currentTab = "";
let currentIndex = 0;
let inventaire = {};
let codeBarreAAssocier = "";
let produitSelectionne = null;

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

    document.getElementById("tabs")
    .style.display = "none";

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

       <h3 style="
margin-top:0;
font-size:28px;
text-align:center;
">
${produit.article}
</h3>

       <div style="margin-top:10px">

<label style="
display:block;
font-weight:bold;
margin-bottom:5px;
">
Paquets
</label>

<input
id="paquets"
type="number"
enterkeyhint="next"
value="${produit.paquets || ''}"
onkeydown="if(event.key==='Enter'){
document.getElementById('pieces').focus();
}">

</div>

<div style="margin-top:15px">

<label style="
display:block;
font-weight:bold;
margin-bottom:5px;
">
Pièces
</label>


<input
id="pieces"
type="number"
enterkeyhint="go"
value="${produit.pieces || ''}"
onkeydown="if(event.key==='Enter'){
valider();
}">

</div>
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

   localStorage.setItem(
    "inventaireHDLP",
    JSON.stringify(inventaire)
);

suivant();

}
function scannerCodeBarre(){

    document
    .getElementById("scannerZone")
    .style.display = "block";

    const scanner = new Html5Qrcode(
        "reader"
    );

    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        (code) => {

            scanner.stop();

            document
            .getElementById("scannerZone")
            .style.display = "none";

            rechercherCodeBarre(code);

        }

    );

}
function rechercherCodeBarre(codeBarre){

    let trouve = null;

    Object.keys(inventaire)
    .forEach(onglet => {

        inventaire[onglet]
        .forEach(produit => {

            if(
                produit.codesBarres &&
                produit.codesBarres.includes(
                    codeBarre
                )
            ){

                trouve = {
                    onglet,
                    produit
                };

            }

        });

    });

    if(trouve){

        currentTab =
        trouve.onglet;

        currentIndex =
        inventaire[
            trouve.onglet
        ]
        .findIndex(
            p =>
            p.id ===
            trouve.produit.id
        );

        creerOnglets();

        afficherArticle();

        return;

    }

    associerCodeBarre(
        codeBarre
    );

}
function associerCodeBarre(codeBarre){

    codeBarreAAssocier =
    codeBarre;

    document
    .getElementById("codeInconnu")
    .innerHTML =
    `
    <b>${codeBarre}</b>
    `;

    document
    .getElementById(
        "fenetreAssociation"
    )
    .style.display =
    "block";

    document
    .getElementById(
        "rechercheProduit"
    )
    .value = "";

    document
    .getElementById(
        "listeProduits"
    )
    .innerHTML = "";

}
function suivant(){

    if(
        currentIndex <
        inventaire[currentTab].length - 1
    ){
        currentIndex++;
    }

    afficherArticle();

    setTimeout(() => {

        const champPieces =
        document.getElementById("pieces");

        if(champPieces){

            champPieces.focus();

            champPieces.value = "";

        }

    }, 100);

}
function chercherProduitAssociation(){

    const texte =
    document
    .getElementById(
        "rechercheProduit"
    )
    .value
    .toLowerCase();

    let html = "";

    Object.keys(inventaire)
    .forEach(onglet => {

        inventaire[onglet]
        .forEach(produit => {

            if(

                produit.article
                .toLowerCase()
                .includes(texte)

            ){

                html += `
                <div
                style="
                padding:8px;
                border-bottom:1px solid #ddd;
                cursor:pointer;
                "
                onclick="
                selectionProduitAssociation(
                '${produit.id}'
                )">

                ${produit.code}
                -
                ${produit.article}

                </div>
                `;

            }

        });

    });

    document
    .getElementById(
        "listeProduits"
    )
    .innerHTML =
    html;

}
function precedent(){

    if(currentIndex > 0){

        currentIndex--;

    }

    afficherArticle();

}
function selectionProduitAssociation(id){

    Object.keys(inventaire)
    .forEach(onglet => {

        inventaire[onglet]
        .forEach(produit => {

            if(
                produit.id === id
            ){

                if(
                    !produit.codesBarres
                ){

                    produit.codesBarres = [];

                }

                produit.codesBarres
                .push(
                    codeBarreAAssocier
                );

                localStorage.setItem(
                    "inventaireHDLP",
                    JSON.stringify(
                        inventaire
                    )
                );

                alert(
                    "Code-barres associé"
                );

            }

        });

    });

    document
    .getElementById(
        "fenetreAssociation"
    )
    .style.display =
    "none";

}
function rechercher(){

    const texte =
    document
    .getElementById("search")
    .value
    .toLowerCase();

    if(!texte){

        document
        .getElementById("resultatsRecherche")
        .innerHTML = "";

        return;

    }

    const resultats =
    inventaire[currentTab]
    .filter(p =>

        p.article &&
        p.article
        .toLowerCase()
        .includes(texte)

        ||

        p.code &&
        p.code
        .toLowerCase()
        .includes(texte)

    );

    let html = "";

    resultats.forEach(produit => {

        html += `
        <div
        style="
        padding:10px;
        border-bottom:1px solid #ddd;
        cursor:pointer;
        "
        onclick="selectionProduit('${produit.id}')">

        ${produit.code}
        - ${produit.article}

        </div>
        `;

    });

    document
    .getElementById("resultatsRecherche")
    .innerHTML = html;

}
function selectionProduit(id){

    const index =
    inventaire[currentTab]
    .findIndex(
        p => p.id === id
    );

    if(index < 0) return;

    currentIndex = index;

    document
    .getElementById("search")
    .value = "";

    document
    .getElementById("resultatsRecherche")
    .innerHTML = "";

    afficherArticle();

}

charger();
