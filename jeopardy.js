const baseUrl = "https://jservice.io/api";
const maxOffset = 18350; //total categories in API is 18414 as of 4/2020
let categories = [];

async function getCategoryIds() {
  let offset = randNum(maxOffset);
  try {
    let res = await axios.get(
      baseUrl + `/categories?count=100&offset=${offset}`
    );

    let categoriesArr = shuffleArr(res.data).slice(0, 6);
    let catIds = categoriesArr.map((value) => value.id);

    return catIds;
  } catch (err) {
    throw err;
  }
}

async function getCategory(catId) {
  let catObj = {};

  try {
    let res = await axios.get(baseUrl + `/clues?category=${catId}`);
    catObj.title = res.data[0].category.title;

    let clueArr = res.data.map((value) => {
      let clue = {};
      clue.question = value.question;
      clue.answer = value.answer;
      clue.showing = null;
      return clue;
    });
    catObj.clues = clueArr;
    return catObj;
  } catch (err) {
    console.error(err);
  }
}

async function createBoardData() {
  const catIdsArr = await getCategoryIds(); //array of values

  const pArray = catIdsArr.map(async (id) => {
    let cats = await getCategory(id);
    return cats;
  });

  const useful = await Promise.all(pArray);

  return (categories = useful);
}

async function fillTable() {
  //create top row
  $("#jeopardy thead").append("<tr>");
  for (objs in categories) {
    $("#jeopardy tr").append(`<th>${categories[objs].title}</th>`);
  }

  // make board body
  for (let y = 0; y < 5; y++) {
    const $row = $("<tr>");

    for (let x = 0; x < 6; x++) {
      $("<td>").attr("id", `${x}-${y}`).html("?").appendTo($row);
    }

    $("#jeopardy tbody").append($row);
  }
}

$("tbody").on("click", handleClick);

function handleClick(evt) {
  const x = evt.target.id.slice(0, 1);
  const y = evt.target.id.slice(2, 3);
  const tile = categories[x].clues[y];

  switch (tile.showing) {
    case null:
      evt.target.innerText = tile.question;
      categories[x].clues[y].showing = "question";
      break;
    case "question":
      evt.target.innerText = tile.answer;
      categories[x].clues[y].showing = "answer";
      break;
  }
}

async function setupAndStart() {
  $("#jeopardy").html("<thead></thead><tbody></tbody>");
  categories = [];
  await createBoardData();
  await fillTable();
  $("tbody").on("click", handleClick);
}

$("#restart").on("click", setupAndStart);

/** On page load, setup and start & add event handler for clicking clues*/
//why does that need to be here? why cant that clue handler come before the board if it's placed on tbody?

//HELPER FUNCTIONS
function randNum(max) {
  return Math.floor(Math.random() * (max + 1) - 1);
}

function shuffleArr(arr) {
  //shuffles array only returns an array of length  numToReturn
  let m = arr.length;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    let i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
}
