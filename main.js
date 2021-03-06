import capitals from './data/capitals.js';


const getEloChanges = (elo1, elo2, score, k) => {
    const e1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
    const r1 = k * (score - e1);
    const r2 = -k * (score - e1);
    return [r1, r2];
};

console.log(getEloChanges(400, 600, 1, 20));

let userRating = 400;
let currentCard, currentChoices, correctId;

const history = [userRating];
const cards = capitals.map(country => ({ ...country, rating: 400, wins: 0, losses: 0 }));
const buttons = [0, 1, 2, 3, 4].map(i => document.getElementById(`choice-${i + 1}`));

let ctx = document.getElementById('myChart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [1],
        datasets: [{
            label: 'Function',
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            data: [userRating],
        }]
    },
    options: {
        legend: {
            display: false,
        }
    }
});

const renderCard = () => {
    document.getElementById("player-rating").innerHTML = `Your Rating: ${userRating.toFixed(1)}`;
    document.getElementById("question-text").innerHTML = `What's the capital of ${currentCard.country}?`;
    document.getElementById("question-rating").innerHTML = `Question Rating: ${currentCard.rating.toFixed(1)}`;
    for (let i = 0; i < 5; i++) {
        buttons[i].innerHTML = currentChoices[i].city;
    }
};

const renderTable = () => {
    cards.sort((a, b) => b.rating - a.rating);
    let tableHtml = "<tr><th>Name</th><th>Wins</th><th>Losses</th><th>Played</th><th>Rating</th></tr>" + cards.filter(
        card => card.wins + card.losses > 0
    ).map(
        card => `<tr><td>${card.country}</td><td>${card.wins}</td><td>${card.losses}</td><td>${card.wins + card.losses}</td><td>${card.rating.toFixed(1)}</td></tr>`
    ).join('');
    document.getElementById("cards-table").innerHTML = tableHtml;
};


const nextCard = () => {
    for (let i = 0; i < 5; i++) {
        buttons[i].disabled = false;
        buttons[i].style.backgroundColor = 'FloralWhite';
    }
    currentCard = _.sample(cards);
    currentChoices = _.sample(cards, 4);
    correctId = _.sample([0, 1, 2, 3, 4])
    currentChoices.splice(correctId, 0, currentCard);
    renderCard();
    renderTable();
};

const answerCard = (i) => {
    const answerCorrect = (i === correctId);
    const [c1, c2] = getEloChanges(userRating, currentCard.rating, answerCorrect ? 1 : 0, 20);
    console.log([c1, c2]);
    buttons[correctId].style.backgroundColor = 'LightGreen';
    if (answerCorrect) {
        currentCard.wins += 1;
        setTimeout(() => nextCard(), 500);
    } else {
        currentCard.losses += 1;
        buttons[i].style.backgroundColor = 'LightCoral';
        setTimeout(() => nextCard(), 2000);
    }
    for (let i = 0; i < 5; i++) {
        buttons[i].disabled = true;
    }
    document.getElementById("player-rating").innerHTML = `Your Rating: ${Math.round(userRating)} [${c1 > 0 ? '+' + c1.toFixed(1) : c1.toFixed(1)}]`;
    document.getElementById("question-rating").innerHTML = `Question Rating: ${currentCard.rating} [${c2 > 0 ? '+' + c2.toFixed(1) : c2.toFixed(1)}]`;
    userRating += c1;
    currentCard.rating += c2;
    history.push(userRating);
    chart.data.labels.push(history.length);
    chart.data.datasets.forEach(dataset => {
        dataset.data.push(userRating);
    });
    chart.update();
};

nextCard();

for (let i = 0; i < 5; i++) {
    buttons[i].addEventListener("click", () => answerCard(i), false);
}