feather.replace()

var last_load_time = Math.floor(new Date() / 1000)
var user_country = null // X-Ip-Country
const allowed_countries = ['US,NA', "CA,NA"]
var global_chapter_data = null
var global_chapter_order = null
var covers_enabled = true

const rotateImage = function(chapter) {
    if (global_chapter_data[chapter].metadata.volume_cover == true) {
        if ($(`#c-${chapter}-img`).hasClass('d-none')) {
            $(`#c-${chapter}-img`).removeClass('d-none')
            $(`#c-${chapter}-img-vol`).addClass('d-none')
        } else {
            $(`#c-${chapter}-img-vol`).removeClass('d-none')
            $(`#c-${chapter}-img`).addClass('d-none')
        }
    }
}

const toggleVolumeCover = function() {
    for (let index = 0; index < global_chapter_order.length; index++) {
        var chapter_num = global_chapter_order[index]
        var chapter_data = global_chapter_data[chapter_num]
        if (chapter_data.metadata.volume_cover == true) {
            if (covers_enabled) {
                $(`#c-${chapter_num}-img`).removeClass('d-none')
                $(`#c-${chapter_num}-img-vol`).addClass('d-none')
            } else {
                $(`#c-${chapter_num}-img-vol`).removeClass('d-none')
                $(`#c-${chapter_num}-img`).addClass('d-none')
            }
        }
    }
    if (covers_enabled) {
        covers_enabled = false
    } else {
        covers_enabled = true
    }
}

const animatePing = function() {
    $('#pulse').addClass('animate-dot')
    setTimeout(function(){ 
        $('#pulse').removeClass('animate-dot')
    }, 8000); 
}

const loadChapterData = function(data) {
    global_chapter_data = data.chapters
    global_chapter_order = data.order
    
    $(`#chapter-count`).text(`New Chapter in ${data.new_release}!`)

    var first_three_chapters = data.order.slice(0, 3)
    var revere_order = data.order.reverse()

    for (let index = 0; index < revere_order.length; index++) {
        var chapter_num = revere_order[index]
        var chapter_data = data.chapters[chapter_num]
        
        // col does not exists
        if (!$(`#c-${chapter_num}`).length) {
            
            var viz_buttons = ``
            // viz link exists, user is in US or CA, and the chapter is in the first 3 chapters
            if (chapter_data.links.viz != null && allowed_countries.includes(user_country) && first_three_chapters.includes(chapter_num)) {
                
                viz_buttons = `<a href="${chapter_data.links.viz}" target="_blank" id="c-${chapter_num}-viz">
                    <button class="btn btn-viz flex-grow-1 me-2 mt-1">
                        <i data-feather="external-link"></i>
                        Viz Manga
                    </button>
                </a>`
            }
            var title = `No title found.`
            if (chapter_data.metadata.title != null) {
                var title = chapter_data.metadata.title
            }
            var volume = `N/A`
            if (chapter_data.metadata.volume != null) {
                volume = chapter_data.metadata.volume
            }
            var img_data = ``
            var hide_img = ``
            if (chapter_data.metadata.volume_cover == true) {
                img_data = `<img id="c-${chapter_num}-img-vol" src="https://cdn.komi.zip/cdn/vol${chapter_data.metadata.volume}.jpg" class="card-img">`
                hide_img = ' d-none'
            }
            
            $(`#chapter-area`).prepend(`<div class="col p-1" id="c-${chapter_num}">
                <div class="card h-100">
                    <div class="row g-0 h-100">
                        <div class="col-4 py-2 px-1 h-100">
                            <div class="ratio ratio-1x1 h-100 ms-1" onclick="rotateImage('${chapter_num}')">
                                <img id="c-${chapter_num}-img" src="https://cdn.komi.zip/cdn/${chapter_num}-01.jpg" class="card-img${hide_img}">
                                ${img_data}
                            </div>
                        </div>
                        <div class="col-8 d-flex flex-column h-100">
                            <div class="card-body flex-grow-1 d-flex flex-column">
                                <h5 class="mb-1 chapter-title">Chapter ${chapter_num}</h5>
                                <h6 id="c-${chapter_num}-vol" class="chapter-subtitle">Volume: ${volume}</h6>
                                <p id="c-${chapter_num}-title" class="flex-grow-1">${title}</p>
                                <div class="mt-auto d-flex flex-wrap">
                                    ${viz_buttons}
                                    <a href="https://read.komi.zip/${chapter_num}" id="c-${chapter_num}-zip">
                                        <button class="btn btn-zip flex-grow-1 me-2 mt-1">
                                            <i data-feather="book-open"></i>
                                            Read
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`)
        
        // col does exist, perform update checks
        } else {
            if ($(`#c-${chapter_num}-viz`).length && !(chapter_data.links.viz != null && allowed_countries.includes(user_country) && first_three_chapters.includes(chapter_num))) {
                $(`#c-${chapter_num}-viz`).remove()
            }

            if ($(`#c-${chapter_num}-title`).length) {
                var title = `No title found.`
                if (chapter_data.metadata.title != null) {
                    var title = chapter_data.metadata.title
                }
                $(`#c-${chapter_num}-title`).text(title)
            }

            if ($(`#c-${chapter_num}-vol`).length) {
                var volume = `N/A`
                if (chapter_data.metadata.volume != null) {
                    volume = chapter_data.metadata.volume
                }
                $(`#c-${chapter_num}-vol`).text(`Volume: ${volume}`)
            }
        }
    }
    feather.replace()
    last_load_time = Math.floor(new Date() / 1000)
    animatePing()
}

const secondTimer = function() {
    $('#update-count').text(`Updating in ${((last_load_time + 15) - Math.floor(new Date() / 1000)).toString()}s`)
}

const fetchAPI = function() {
    axios.get(`https://api.komi.zip/v1/chapters`)
        .then(response => {
            user_country = response.headers['x-ip-country']
            loadChapterData(response.data)
        })
        .catch(error => {
            console.error('[fetchAPI]', error.message)
            console.error(error)
            last_load_time = Math.floor(new Date() / 1000)
        });
}

fetchAPI()
setInterval(fetchAPI, 15000)
secondTimer()
setInterval(secondTimer, 500)

$('#volume-input').on('input', function() {
    var input = $('#volume-input').val()
    
    for (let index = 0; index < global_chapter_order.length; index++) {
        var chapter_num = global_chapter_order[index]
        var chapter_data = global_chapter_data[chapter_num]
        if (chapter_data.metadata.volume == input || input == "") {
            $(`#c-${chapter_num}`).show()
        } else {
            $(`#c-${chapter_num}`).hide()
        }
    }

});

$('#chapter-input').on('input', function() {
    var input = $('#chapter-input').val()
    
    for (let index = 0; index < global_chapter_order.length; index++) {
        var chapter_num = global_chapter_order[index]
        if (chapter_num == input || input == "") {
            $(`#c-${chapter_num}`).show()
        } else {
            $(`#c-${chapter_num}`).hide()
        }
    }

});