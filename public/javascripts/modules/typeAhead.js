import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
  }).join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('.search__input');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
      })
      .catch(err => {
        console.log(err);
      })
  });

  const keyUp = 38;
  const keyDown = 40;
  const keyEnter = 38;

  searchInput.on('keyup', e => {
    if (![keyUp, keyDown, keyEnter].includes(e.keyCode)) return;
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === keyDown && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === keyDown) {
      next = items[0];
    } else if (e.keyCode === keyUp && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === keyUp) {
      next = items[items.length - 1];
    } else if (e.keyCode === keyEnter && current.href) {
      location = current.href;
      return;
    }

    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
  })
}

export default typeAhead;