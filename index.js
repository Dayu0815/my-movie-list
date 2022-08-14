//主機 讀取位址
const BASE_URL = 'https://movie-list.alphacamp.io'
//Index API 讀取位址
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12
//參考課程U16-U20教學內容寫法，宣告 2個容器，區分過濾前、過濾後
const movies = []
let filteredMovies = []//加入分頁器後，調整宣告位置

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
//選取 icon資料節點
const mybutton = document.getElementById("up-icons")

//建立卡片函式，逐次將「電影清單列表內容」，設定新增卡片容器，優化排版資料，置於註冊選定節點，顯示結果
function renderMovieList(data) {
  let rawHTML = ''
  //注意.forEach引用資料來源，是否與函式 input相符
  //bootstrap modal元件位置，綁定單一按鈕 element，避免干擾
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

//建立分頁函式1 _依 data來源總數，計算可切割出的分頁頁數，置於節點，顯示結果
function renderPaginator(amount) {
  const numberofPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberofPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link page-num btn btn-outline-warning text-dark fw-bold fs-5" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//建立分頁函式2 _設定每張分頁_可顯示項目_對應陣列的起迄位置
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

//建立 Modal函式，逐次將「每部電影基本資料」，設定 Modal元件容器，優化排版資料，置於 Modal元件節點，顯示結果
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

//建立函式_暫存「收藏清單列表」，透過 id 找出「收藏項目，在 data來源陣列的所在位置」，排除重複項目，push收藏項目
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some((movie => movie.id === id))) {
    return alert('這部電影，已經放在收藏清單裡了喔！')
  }
  list.push(movie)

  //執行轉檔JSON.stringify，暫存收回localStorage，印製對應項目.setItem
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// listen to data panel_click是開頭小寫_呼叫函式showMovieModal()_綁定.dataset.id
//展開項目內容.btn-show-movie _新增最愛項目.btn-add-favorite
//觸發事件HTML元素 dataPanel _事件監聽器 click _事件處理器 event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))

  }
})

//觸發事件HTML元素 paginator _事件監聽器 click _事件處理器 event
//檢查驗證_按鈕節點激活.active，只顯示當前分頁.add，不顯示其他未點選分頁.remove
//空格是用在上下兩層指定標籤，若使用.parentElement，要無空格，是同時符合前後兩個 className
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const active = document.querySelector('.page-item.active');
  if (active) {
    active.classList.remove('active');
  }
  if (event.target.matches('.page-num')) {
    event.target.parentElement.classList.add('active')
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
  }
})

//觸發事件HTML元素 searchForm _事件監聽器 submit _事件處理器 event
//瀏覽器終止元件的預設行為，把控制權交給 JavaScript，不要刷新頁面，直接重新導向目前頁面
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()



  //【作法一】用迴圈迭代：for-of
  //for (const movie of movies) {
  //  const keyword = searchInput.value.trim().toLowerCase()
  //  if (movie.title.toLowerCase().includes(keyword)) {
  //    filteredMovies.push(movie)
  //  }}

  //【作法二】用條件來迭代：filter，可以比對字串+電影.id
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
  renderPaginator(filteredMovies.length)//依照 data來源陣列長度，啟用分頁器函式
  renderMovieList(getMoviesByPage(1))// 宣告 復歸原始分頁起點，以利切換模式正常顯示，不容易顯示錯誤
}
)

// send request to show api_向 axios 發出請求
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
    renderPaginator(movies.length) //依照 data來源陣列長度，啟用分頁器函式
    renderMovieList(getMoviesByPage(1)) //增加分頁器函式後，需要修訂這裡，復歸原始畫面，從第1頁開始
  })
  //localStorage.setItem('default_language', 'english')
  //console.log(localStorage.getItem('default_language'))
  //localStorage.removeItem('default_language')
  //console.log(localStorage.getItem('default_language'))

  .catch((err) => console.log(err))

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "contents";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}