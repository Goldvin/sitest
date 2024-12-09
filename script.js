const sheetId = 'ID_SPREADSHEET'; // Ganti dengan ID spreadsheet Anda
const apiKey = 'API_KEY'; // Ganti dengan API Key Anda

async function fetchData() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`);
    const data = await response.json();
    displayData(data.values);
}

function displayData(data) {
    const container = document.getElementById('data-container');
    data.forEach((row, index) => {
        if (index === 0) return; // Lewati header
        const div = document.createElement('div');
        div.innerHTML = `<strong>${row[0]}</strong>: ${row[1]}`; // Sesuaikan dengan kolom yang ada
        container.appendChild(div);
    });
}

fetchData();