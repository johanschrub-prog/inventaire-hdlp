const categories = [

"INVENTAIRE HDLP",
"INVENTAIRE CONGELATEUR PDJ",
"INVENTAIRE ECONOMAT PDJ",
"INVENTAIRE REFREGIRATEUR PDJ",
"INVENTAIRE SEMINAIRE",
"INVENTAIRE CAVE BAR",
"INVENTAIRE CAVE SOFT",
"INVENTAIRE CAVE MINI BAR",
"INVENTAIRE CAVE SEMINAIRE",
"INVENTAIRE BOUTIQUE",
"INVENTAIRE ARRIERE BAR",
"INVENTAIRE DEVANT BAR",
"INVENTAIRE BAS BAR",
"INVENTAIRE RCLP",
"INVENTAIRE RCLP BAR",
"INVENTAIRE CAVE ALCOOL",
"INVENTAIRE CAVE VIN"

];

let currentTab = categories[0];

let data = {};

categories.forEach(cat=>{

data[cat] = [];

});

function createTabs(){

let html = "";

categories.forEach(cat=>{

html += `
<button
class="tab ${
cat===currentTab
? "active"
: ""
}"
onclick="changeTab('${cat}')">

${cat}

</button>
`;

});

document
.getElementById("tabs")
.innerHTML = html;

}

function changeTab(tab){

currentTab = tab;

createTabs();

render();

}

createTabs();
``
