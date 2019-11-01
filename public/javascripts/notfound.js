document.addEventListener('DOMContentLoaded', function() {
  let parts = document.querySelectorAll('h1.title span');
  let chars = ['4', '0', '4'];
  let length = 500;
  let speed = 100;

  for (let i = 0; i < 3; i++) {
    let delay = length * i;

    let interval = setInterval(() => {
      let rand = Math.round(Math.random() * 9);
      parts[i].innerText = rand;
    }, speed);

    setTimeout(() => {
      clearInterval(interval);
      parts[i].innerText = chars[i];
    }, length + delay);
  }
});
