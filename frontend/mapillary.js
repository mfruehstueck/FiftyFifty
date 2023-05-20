import Viewer from "mapillary-js";

let containerGameView = document.getElementById("game-view");
const container = document.createElement('div');
container.style.width = '400px';
container.style.height = '300px';
containerGameView.appendChild(container);

const viewer = new Viewer({
  accessToken: 'MLY|6425749720781602|74d4571106775c1ff773082d77b80f27',
  container,
  imageId: '2662221260745430',
});