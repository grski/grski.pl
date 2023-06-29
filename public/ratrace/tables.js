function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (let key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
}
const drawFileLengthsTable = (tableID, items) => {
    let table = document.getElementById(tableID);
    table.innerHTML = '';
    let data = Object.keys(items[0]);
    generateTable(table, items); // generate the table first
    generateTableHead(table, data); // then the head
};

const fetchDataDrawTable = async (jsonFile, tableID) => {
    await fetch(jsonFile).then(
        response => response.json()
    ).then(json => drawFileLengthsTable(tableID, json.slice(-10).reverse()));
};
const putCommiters = async (project) => {
    console.log(project);
    fetchDataDrawTable(`json/${project}/commiters.json`, "commiters")
};
const putFileLengths = async (project) => {
    fetchDataDrawTable(`json/${project}/file_lengths.json`, "stats")
};

export {generateTableHead, generateTable, drawFileLengthsTable, putFileLengths, putCommiters};
