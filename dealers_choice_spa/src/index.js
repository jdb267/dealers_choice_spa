const axios = require('axios');
const playersUL = document.querySelector('#players-list');
const statisticsUL = document.querySelector('#statistics-list');
const statlinesUL = document.querySelector('#statlines-list');
let currentSelection = +window.location.hash.slice(1) || 1;
let players;
let statistics;

window.addEventListener('hashchange', () => {
  let currentSelection = +window.location.hash.slice(1);
  getStatlines(currentSelection);
});

const getPlayers = async () => {
  const response = await axios.get('/api/players');
  players = response.data;
  playersUL.innerHTML = `
      ${response.data
        .map(
          (ele) => `
      <li><a href="#${ele.id}">${ele.name}</a></li>
      `
        )
        .join('')}
    `;
};
const getStatistics = async () => {
  const response = await axios.get('/api/statistics');
  statistics = response.data;
  statisticsUL.innerHTML = `
      ${statistics
        .map(
          (ele) => `
      <li class="${ele.id}">${ele.name}</li>
      `
        )
        .join('')}
    `;
};
const getStatlines = async (id) => {
  const response = await axios.get(`/api/players/${id}/statlines`);
  const players = await axios.get(`/api/players/`);
  const player = players.data.filter((ele) => ele.id === id);
  const stats = await axios.get('/api/statistics');

  statlinesUL.innerHTML = `
  <h3>${player[0].name}</h3>
      ${response.data
        .map(
          (ele) => `
      <li>${stats.data[+ele.statisticId - 1].name}</li>
      `
        )
        .join('')}
        `;
};

getPlayers();
getStatistics();
getStatlines(currentSelection);

statisticsUL.addEventListener('click', async (e) => {
  const target = e.target;
  currentSelection = +window.location.hash.slice(1) || 1;
  if (target.tagName === 'LI') {
    let sID = +target.getAttribute('class');
    await axios.post(`/api/players/${currentSelection}/statlines`, {
      userId: currentSelection,
      statisticId: sID,
    });
    getStatlines(currentSelection);
  }
});
