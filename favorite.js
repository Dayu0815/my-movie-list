//主機 讀取位址
const BASE_URL = 'https://movie-list.alphacamp.io'
//Index API 讀取位址
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
//宣告「收藏清單列表」暫存容器 讀取位址
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//建立函式1，逐次將「電影清單列表內容」，設定新增卡片容器，優化排版資料，置於註冊選定節點，顯示結果
function renderMovieList(data) {
  let rawHTML = ''
  //注意.forEach引用資料來源，是否與函式相符
  // bootstrap modal元件位置，綁定單一按鈕 element，避免干擾
  data.forEach((item) => {
    // title, image, id
    // 從 Button 綁上 data-id="${item.id}" 
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}" >More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}" > X </button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//建立函式2，逐次將「每部電影基本資料」，設定 Modal元件容器，優化排版資料，置於 Modal元件節點，顯示結果
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api_向 axios 發出請求
  //截取條件 需符合引用 API網址及規則.json，注意大小寫要與註冊條件一致
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      //response.data.results
      const data = response.data.results

      // insert data into modal ui
      modalTitle.innerText = data.title
      modalDate.innerText = 'release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}
//建立函式，從「收藏清單列表」，找出「刪除項目，在 data來源陣列的所在位置」
function removeFromFavorite(id) {
  //防止 movies 是空陣列的狀況 加上兩個條件控制_檢查「收藏清單」是空的，或傳入的 id 不存在收藏清單中，結束函式
  if (!movies || !movies.length) return

  //透過 id 找出「刪除項目，在 data來源陣列的所在位置」 index，執行刪除.splice
  const movieIndex = movies.findIndex(movie => movie.id === id)
  movies.splice(movieIndex, 1)

  //執行轉檔JSON.stringify，暫存收回localStorage，印製對應項目.setItem
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //新增這裡 重整頁面，印製現有收藏項目卡片
  renderMovieList(movies)
}


// listen to data panel_click是開頭小寫_呼叫函式showMovieModal()_綁定.dataset.id
//展開項目內容.btn-show-movie _刪除最愛項目.btn-remove-favorite
//觸發事件HTML元素 dataPanel _事件監聽器 click _事件處理器 event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))

  }
})

renderMovieList(movies) //這裡要保留 不能刪除
