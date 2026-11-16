let modeOnglets = true;
let indexAvantRecherche = null;
let currentTab = "";
let currentIndex = 0;
let inventaire = {};
let codeBarreAAssocier = "";
let produitSelectionne = null;

async function charger(){
    try {
        const r = await fetch("inventaire.json");
        const sauvegarde = localStorage.getItem("inventaireHDLP");
        if(sauvegarde){
            inventaire = JSON.parse(sauvegarde);
        } else if(r.ok) {
            inventaire = await r.json();
        } else {
            inventaire = {};
        }
    } catch(e) {
        const sauvegarde = localStorage.getItem("inventaireHDLP");
        if(sauvegarde){
            inventaire = JSON.parse(sauvegarde);
        } else {
            inventaire = {};
        }
    }
    if(Object.keys(inventaire).length > 0){
        currentTab = Object.keys(inventaire)[0];
        creerOnglets();
        afficherArticle();
    }
}

function creerOnglets(){
    let html = "";
    Object.keys(inventaire).forEach(cat => {
        const estRCLP = cat.includes("RCLP");
        const estActif = cat === currentTab;
        let bg = estRCLP ? "#ffe0b2" : "#ddd";
        let color = estRCLP ? "#856404" : "#000";
        let border = estRCLP ? "#ffeeba" : "#ccc";
        if(estActif){
            bg = estRCLP ? "#fd7e14" : "#0a66ff";
            color = "white";
        }
        html += `
        <button
        class="tab"
        style="
            background: ${bg};
            color: ${color};
            border: 1px solid ${border};
            padding: 10px 16px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            transition: all 0.2s;
        "
        onclick="changerOnglet('${cat}')">
        📁 ${cat}
        </button>
        `;
    });
    const tabsContainer = document.getElementById("tabs");
    if(tabsContainer){
        tabsContainer.innerHTML = html;
        tabsContainer.style.display = "flex";
        tabsContainer.style.flexWrap = "wrap";
        tabsContainer.style.gap = "8px";
        tabsContainer.style.marginBottom = "15px";
    }
}

function changerOnglet(cat){
    currentTab = cat;
    currentIndex = 0;
    modeOnglets = false;
    afficherArticle();
}

function retourOnglets(){
    modeOnglets = true;
    afficherArticle();
}

function importerFournisseur(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
        const workbook = XLSX.read(e.target.result, {type:"array"});
        inventaire = {};
        
        workbook.SheetNames.forEach(nomFeuille => {
            // Ignore la feuille vide ou technique "Feuil1"
            if (nomFeuille.trim().toUpperCase() === "FEUIL1") return;
            
            const sheet = workbook.Sheets[nomFeuille];
            const rows = XLSX.utils.sheet_to_json(sheet);
            if(rows.length === 0) return;
            
            inventaire[nomFeuille] = [];
            rows.forEach(row => {
                // Ignore les lignes sans article
                const articleNom = String(row.ARTICLE || row.Article || "").trim();
                if(!articleNom) return;

                inventaire[nomFeuille].push({
                    id: crypto.randomUUID(),
                    ordre: Number(row.ORDRE || row.Ordre || 9999),
                    code: String(row.NA || row.Code || row.CODE || ""),
                    article: articleNom,
                    categorie: String(row.CATEGORIE || row.Categorie || ""),
                    conditionnement: String(row.CONTIONNEMENT || row.Conditionnement || row.CONDITIONNEMENT || ""),
                    codesBarres: row.codesBarres || [],
                    paquets: Number(row.PAQUET || row.Paquet || 0),
                    pieces: Number(row.PIECE || row.Piece || 0)
                });
            });

            // Tri sécurisé même si ORDRE est vide ou NaN
            inventaire[nomFeuille].sort((a, b) => {
                let ordreA = isNaN(a.ordre) ? 9999 : a.ordre;
                let ordreB = isNaN(b.ordre) ? 9999 : b.ordre;
                return ordreA - ordreB;
            });

            // Si la feuille se retrouve vide après filtrage, on la supprime
            if(inventaire[nomFeuille].length === 0){
                delete inventaire[nomFeuille];
            }
        });
        
        localStorage.setItem("inventaireHDLP", JSON.stringify(inventaire));
        const keys = Object.keys(inventaire);
        if(keys.length > 0){
            currentTab = keys[0];
        }
        currentIndex = 0;
        creerOnglets();
        afficherArticle();
        
        const tabsEl = document.getElementById("tabs");
        if(tabsEl) tabsEl.style.display = modeOnglets ? "flex" : "none";
        
        alert(keys.length + " onglets d'inventaire importés avec succès ✅");
    };
    reader.readAsArrayBuffer(file);
}

function afficherOnglets(){
    modeOnglets = true;
    afficherArticle();
}

function afficherArticle(){
    const toolbar = document.querySelector(".toolbar");
    const tabs = document.getElementById("tabs");
    const contenu = document.getElementById("contenu");
    if(toolbar) toolbar.style.display = "flex";
    
    if(modeOnglets){
        if(tabs) tabs.style.display = "flex";
        if(contenu) contenu.innerHTML = "";
        creerOnglets();
        return;
    }
    if(tabs) tabs.style.display = "none";
    
    const produit = inventaire[currentTab]?.[currentIndex];
    if(!produit) return;
    
    if(contenu){
        contenu.innerHTML = `
        <div class="card" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; background: #fff; box-sizing: border-box; max-width: 500px; margin: auto;">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 15px; font-weight: bold; color: ${currentTab.includes("RCLP") ? '#fd7e14' : '#0a66ff'}; text-transform: uppercase;">
                    ${currentTab}
                </div>
                <div style="font-size: 26px; font-weight: bold; color: #333; margin-top: 6px;">
                    ${produit.article}
                </div>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <div style="text-align: center; flex: 1;">
                    <label style="display: block; font-weight: bold; color: #495057; margin-bottom: 6px; font-size: 13px;">
                        📦 Paquets
                    </label>
                    <input
                    id="paquets"
                    type="number"
                    step="0.01"
                    inputmode="decimal"
                    enterkeyhint="next"
                    style="width: 100%; height: 42px; font-size: 18px; text-align: center; border: 1px solid #ced4da; border-radius: 6px; background: white;"
                    value="${produit.paquets || ''}"
                    onkeydown="if(event.key==='Enter'){ document.getElementById('pieces').focus(); }">
                </div>
                <div style="width: 1px; height: 50px; background: #dee2e6;"></div>
                <div style="text-align: center; flex: 1;">
                    <label style="display: block; font-weight: bold; color: #495057; margin-bottom: 6px; font-size: 13px;">
                        🧩 Pièces
                    </label>
                    <input
                    id="pieces"
                    type="number"
                    step="0.01"
                    inputmode="decimal"
                    enterkeyhint="go"
                    style="width: 100%; height: 42px; font-size: 18px; text-align: center; border: 1px solid #ced4da; border-radius: 6px; background: white;"
                    value="${produit.pieces || ''}"
                    onkeydown="if(event.key==='Enter'){ valider(); }">
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button style="flex: 1; height: 45px; background: #6c757d; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 16px;" onclick="precedent()">
                    ◀ Précédent
                </button>
                <button style="flex: 1.5; height: 45px; background: #198754; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 16px;" onclick="valider()">
                    ✅ Valider
                </button>
                <button style="flex: 1; height: 45px; background: #6c757d; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 16px;" onclick="suivant()">
                    Suivant ▶
                </button>
            </div>
        </div>
        `;
    }
}

function valider(){
    let produit = inventaire[currentTab][currentIndex];
    produit.paquets = parseFloat(document.getElementById("paquets").value.replace(",", ".")) || 0;
    produit.pieces = parseFloat(document.getElementById("pieces").value.replace(",", ".")) || 0;
    localStorage.setItem("inventaireHDLP", JSON.stringify(inventaire));
    if(indexAvantRecherche !== null){
        currentIndex = indexAvantRecherche;
        indexAvantRecherche = null;
        afficherArticle();
        return;
    }
    suivant();
}

function scannerCodeBarre(){
    const scannerZone = document.getElementById("scannerZone");
    if(scannerZone) scannerZone.style.display = "block";
    const scanner = new Html5Qrcode("reader");
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (code) => {
            scanner.stop();
            if(scannerZone) scannerZone.style.display = "none";
            rechercherCodeBarre(code);
        }
    );
}

function rechercherCodeBarre(codeBarre){
    let trouve = null;
    Object.keys(inventaire).forEach(onglet => {
        inventaire[onglet].forEach(produit => {
            if(produit.codesBarres && produit.codesBarres.includes(codeBarre)){
                trouve = { onglet, produit };
            }
        });
    });
    if(trouve){
        currentTab = trouve.onglet;
        currentIndex = inventaire[trouve.onglet].findIndex(p => p.id === trouve.produit.id);
        creerOnglets();
        afficherArticle();
        return;
    }
    associerCodeBarre(codeBarre);
}

function remiseAZero(){
    if(!confirm("Remettre toutes les quantités à zéro ?")) return;
    Object.keys(inventaire).forEach(onglet => {
        inventaire[onglet].forEach(produit => {
            produit.paquets = 0;
            produit.pieces = 0;
        });
    });
    localStorage.setItem("inventaireHDLP", JSON.stringify(inventaire));
    afficherArticle();
    alert("Inventaire remis à zéro ✅");
}

function associerCodeBarre(codeBarre){
    codeBarreAAssocier = codeBarre;
    const codeInconnu = document.getElementById("codeInconnu");
    if(codeInconnu) codeInconnu.innerHTML = `<b>${codeBarre}</b>`;
    const fenetreAssoc = document.getElementById("fenetreAssociation");
    if(fenetreAssoc) fenetreAssoc.style.display = "block";
    const rechProd = document.getElementById("rechercheProduit");
    if(rechProd) rechProd.value = "";
    const listeProd = document.getElementById("listeProduits");
    if(listeProd) listeProd.innerHTML = "";
}

function suivant(){
    if(currentIndex < inventaire[currentTab].length - 1){
        currentIndex++;
    }
    afficherArticle();
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        const champPieces = document.getElementById("pieces");
        if(champPieces){
            champPieces.focus();
            champPieces.select();
        }
    }, 50);
}

function chercherProduitAssociation(){
    const texte = document.getElementById("rechercheProduit")?.value?.toLowerCase() || "";
    let html = "";
    Object.keys(inventaire).forEach(onglet => {
        inventaire[onglet].forEach(produit => {
            if(produit.article.toLowerCase().includes(texte)){
                html += `
                <div style="padding: 8px; border-bottom: 1px solid #ddd; cursor: pointer; background: white;" onclick="selectionProduitAssociation('${produit.id}')">
                    <b>${produit.code}</b> - ${produit.article}
                </div>
                `;
            }
        });
    });
    const listeProduits = document.getElementById("listeProduits");
    if(listeProduits) listeProduits.innerHTML = html;
}

function precedent(){
    if(currentIndex > 0){
        currentIndex--;
    }
    afficherArticle();
}

function selectionProduitAssociation(id){
    Object.keys(inventaire).forEach(onglet => {
        inventaire[onglet].forEach(produit => {
            if(produit.id === id){
                if(!produit.codesBarres) produit.codesBarres = [];
                produit.codesBarres.push(codeBarreAAssocier);
                localStorage.setItem("inventaireHDLP", JSON.stringify(inventaire));
                alert("Code-barres associé ✅");
            }
        });
    });
    const fenetreAssoc = document.getElementById("fenetreAssociation");
    if(fenetreAssoc) fenetreAssoc.style.display = "none";
}

function rechercher(){
    const texte = document.getElementById("search")?.value?.toLowerCase() || "";
    const resContainer = document.getElementById("resultatsRecherche");
    if(!texte){
        if(resContainer) resContainer.innerHTML = "";
        return;
    }
    const resultats = inventaire[currentTab].filter(p =>
        (p.article && p.article.toLowerCase().includes(texte)) ||
        (p.code && p.code.toLowerCase().includes(texte))
    );
    let html = "";
    resultats.forEach(produit => {
        html += `
        <div style="padding: 10px; border-bottom: 1px solid #ddd; cursor: pointer; background: white;" onclick="selectionProduit('${produit.id}')">
            <b>${produit.code}</b> - ${produit.article}
        </div>
        `;
    });
    if(resContainer) resContainer.innerHTML = html;
}

function selectionProduit(id){
    const index = inventaire[currentTab].findIndex(p => p.id === id);
    if(index < 0) return;
    indexAvantRecherche = currentIndex;
    currentIndex = index;
    const searchInput = document.getElementById("search");
    const resContainer = document.getElementById("resultatsRecherche");
    if(searchInput) searchInput.value = "";
    if(resContainer) resContainer.innerHTML = "";
    afficherArticle();
}

function exportExcel(){
    const wb = XLSX.utils.book_new();
    Object.keys(inventaire).forEach(onglet => {
        const lignes = inventaire[onglet].map(produit => ({
            ORDRE: produit.ordre,
            NA: isNaN(produit.code) ? produit.code : Number(produit.code),
            ARTICLE: produit.article,
            PAQUET: produit.paquets || 0,
            PIECE: produit.pieces || 0
        }));
        const ws = XLSX.utils.json_to_sheet(lignes);
        XLSX.utils.book_append_sheet(wb, ws, onglet.substring(0,31));
    });
    const d = new Date();
    const fichier = "inventaire-hdlp-" +
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + ".xlsx";
    XLSX.writeFile(wb, fichier);
}

charger();
