const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


//建立函式1，逐次將「電影清單列表內容」，設定新增卡片容器，優化排版資料，置於註冊選定節點，顯示結果
function renderMovieList(data) {
  let rawHTML = ''
  //注意.forEach引用資料來源，是否與函式相符
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
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}" >+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//建立函式2，逐次將「每部電影基本資料」，設定Modal彈出視窗容器，優化排版資料，置於Modal彈出視窗節點，顯示結果
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api_點擊時向 axios 發出請求
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some((movie => movie.id === id))) {
    return alert('這部電影，已經放在收藏清單裡了喔！')
  }
  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// listen to data panel_click是開頭小寫_呼叫函式showMovieModal()_綁定.dataset.id
//觸發事件HTML元素 dataPanel _事件監聽器 click _事件處理器 event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))

  }
})

//觸發事件HTML元素 searchForm _事件監聽器 sumbit _事件處理器 event
//瀏覽器終止元件的預設行為，把控制權交給 JavaScript，不要刷新頁面，直接重新導向目前頁面
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  let filteredMovies = []


  //【作法一】用迴圈迭代：for-of
  //for (const movie of movies) {
  //  const keyword = searchInput.value.trim().toLowerCase()
  //  if (movie.title.toLowerCase().includes(keyword)) {
  //    filteredMovies.push(movie)
  //  }}

  //【作法二】用條件來迭代：filter
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword) ||
    movie.id === Number(keyword)
  )

  //警告視窗
  //if (!keyword.length) {
  //  return alert(`注意！ 您輸入的關鍵字：【 ${keyword} 】 沒有符合條件的電影 Please enter a valid string.`)
  //}
  if (filteredMovies.length === 0) {
    return alert(`注意！ 您輸入的關鍵字：【 ${keyword} 】 沒有符合條件的電影          
Cannot find movie with key.`)
  }
  renderMovieList(filteredMovies)
}
)

// send request to index api_點擊時向 axios 發出請求
//截取條件 需符合引用 API網址及規則.json，注意大小寫要與註冊條件一致
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    //Array(80)
    //for (const movie of response.data.results) {
    //movie.push(movie)}

    //console.log(response)
    //console.log(response.data)
    //console.log(response.data.results)
    movies.push(...response.data.results)
    //console.log(movies)
    renderMovieList(movies) //新增這裡
  })
  //localStorage.setItem('default_language', 'english')
  //console.log(localStorage.getItem('default_language'))
  //localStorage.removeItem('default_language')
  //console.log(localStorage.getItem('default_language'))

  .catch((err) => console.log(err))