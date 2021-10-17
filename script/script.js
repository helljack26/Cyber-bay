const url = 'https://pixabay.com/api/?key=23641816-dcf4d4f9c34852472448f65fc&page=1&per_page=12'

const form = document.forms.namedItem('queryline')
let query = ''
let extQuery1 = ''
let perPage = 20;
let totalPages
let pageCounter = 1

form.addEventListener('submit', e => {
    e.preventDefault()
    // refreshin pageNumber only when initial load
    pageCounter = 1
    paginationControl()
})

const queryField = document.getElementById('queryField')
const radioBtn = document.querySelectorAll("input[name='popular_fresh']")
const paginationWrapper = document.querySelector('.pagination_wrapper')
const pageLeft = document.getElementById('page_left')
const pageRight = document.getElementById('page_right')

radioBtn.forEach(e => {
    e.addEventListener('change', (chckb) => {
        extQuery1 = chckb.target.value
    })
})

queryField.oninput = (e) => {
    query = e.target.value
}

form.onsubmit = () => sendRequest('', false)

const contentWrapper = document.getElementById('content_wrapper')

// Pagination 
function paginationControl(type) {
    if(type == 'fwd') {
        pageCounter += 1
    }
    if(type == 'back') {
        pageCounter -= 1
    }

    paginationWrapper.innerHTML = `
        ${pageCounter <= 1 ? `<span class="page_number disable" id="page_left" ></span>` : `<span onclick="paginationControl('back')" class="page_number" id="page_left">&larr;</span>`}
        ${pageCounter <= 1 ? `<span class="page_number disable"></span>` : `<span class="page_number">${pageCounter-1}</span>`}
        <span class="page_number active_page">${pageCounter}</span>
        <span class="page_number">${pageCounter+1}</span>
        ${pageCounter == totalPages ? `<span class="page_number" id="page_right"></span>` : `<span onclick="paginationControl('fwd')" class="page_number" id="page_right">&rarr;</span>`}
    `
    console.log("TCL: paginationControl -> pageCounter == totalPages", pageCounter, totalPages)
    sendRequest(pageCounter, false)
}

// Request to Pixabay
function sendRequest(pageNumber=1, initialLoad) {
    // storing last query in Local Storage
    if(initialLoad == false) localStorage.setItem('lastRequest', query)
    fetch(url+`&q=${localStorage.getItem('lastRequest')}&order=${extQuery1 || 'popular'}&page=${pageNumber}&per_page=${perPage}`).then(response1 => {
        return response1.json()
    }).then(response2 => {
        const contentObject = response2.hits
        totalPages = Math.ceil(response2.total/perPage)
        contentWrapper.innerHTML = ''
        contentObject.forEach(elementObject => {
            // creating image preview container
            const wrapperElement = document.createElement('div')
            const spinner = document.createElement('div')
            spinner.classList.add('loader')

            wrapperElement.classList.add('wrapper_element')
            wrapperElement.appendChild(spinner)

            var src = elementObject.previewURL
            let imgWidth = elementObject.previewWidth
            imgWidth = 500;

            var image = new Image();
            
            image.addEventListener('load', function() {
                wrapperElement.innerHTML= `<img src='${src}' class='wrapper-img' style:'width: ${imgWidth}'/>
                <p class='wrapper-tags'>${elementObject.tags}</p>
                `;
                spinner.remove()
            });
            image.src = src;

            contentWrapper.appendChild(wrapperElement)

            wrapperElement.onclick = () => {
                const fullscreen = document.createElement('div')
                fullscreen.classList.add('fullscreen')
                fullscreen.innerHTML = `<img src=${elementObject.largeImageURL} class='fullscreen-img'/>`
                
                // Task1: smooth appending with CSS transition
                document.body.appendChild(fullscreen)

                fullscreen.addEventListener('click', (e) => {
                    if(e.target == fullscreen) {
                        fullscreen.remove()
                    }
                }, {once: true})

                window.addEventListener('keyup', e => {
                    console.log('escape pressed!')
                    if(e.code == 'Escape') fullscreen.remove()
                }, {once: true})

            }
        });
    })
}
// initial load of page
window.addEventListener('load', sendRequest('', true))
