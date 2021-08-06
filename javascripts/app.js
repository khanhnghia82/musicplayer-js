const   $   = document.querySelector.bind(document),
        $$  = document.querySelectorAll.bind(document),        

        toggleSwitchMode    = $('.mode-switch__check'),
        container                = $('.container'),
        app                 = $('.app'),
        playlist            = $('.playlist'),
        
        audio               = $('#audio'),
        player              = $('.player'),
        playerImage         = $('.player-image'),
        playerSongName      = $('.player-songName'),
        playerSingerName    = $('.player-singerName'),
        playBtn             = $('.player-control__togglePlay'),
        repeatBtn           = $('.player-control__repeat'),
        prevBtn             = $('.player-control__backward'),
        nextBtn             = $('.player-control__forward'),
        randomBtn           = $('.player-control__random'),
        progressAudio       = $('#player-progress__slider'),
        seekTime            = $('.player-progress__time-seek'),
        endTime             = $('.player-progress__time-duration'),
        canvasElm           = $('.player-wave'),

        volumePercent       = $('.player-volume__viewPercent'),
        volumeDown          = $('.player-volume__down'),
        volumeProgress      = $('.player-volume__progress'),
        volumeUp            = $('.player-volume__up'),

        PLAYER_STORAGE_KEY  = 'MY_PLAYER'

        
var     currentIndexSong    = 0,
        activedSong         = 0,
        currentVolume       = 100,
        isPlaying           = false,
        isRandom            = false,
        isRepeat            = false,
        isDarkTheme         = false,
        config              = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}
        
const songs = [
    {
        name: 'Cheer Up',
        singer: 'Hong Jin Young',
        path: './musics/Cheer-Up.mp3',
        image: 'https://avatar-ex-swe.nixcdn.com/song/2018/04/18/5/1/3/1/1524044109208_640.jpg'
    },
    {
        name: 'Bất quá nhân giang',
        singer: 'Hải Lai A Mộc',
        path: './musics/Bat-Qua-Nhan-Gian.mp3',
        image: 'https://data.chiasenhac.com/data/cover/120/119550.jpg'
    },
    {
        name: 'Vén rèm châu',
        singer: 'Hoắc tôn',
        path: './musics/Ven-Rem-Chau.mp3',
        image: 'https://tuthanhca16.files.wordpress.com/2016/05/henry-huo-zun-tianyu-heavenly-song-album-580x8261.jpg?w=640'
    },
    {
        name: 'Tay trái chỉ trăng',
        singer: 'Tát đỉnh đỉnh',
        path: './musics/Tay-Trai-Chi-Trang.mp3',
        image: 'https://i.ytimg.com/vi/ATPulcGQ2SE/maxresdefault.jpg'
    },
    {
        name: 'Mộ Hạ - Remix',
        singer: 'Đẳng thập ma quân',
        path: './musics/Mo-Ha.mp3',
        image: 'https://i.pinimg.com/736x/a6/b5/cb/a6b5cbf01280bd07012f9a687fae0077.jpg'
    },
    {
        name: 'Cơn bão tình yêu',
        singer: 'Mộng hàm',
        path: './musics/Con-Bao-Tinh-Yeu.mp3',
        image: 'https://avatar-ex-swe.nixcdn.com/singer/avatar/2016/10/14/4/5/d/0/1476435530018_600.jpg'
    },
    {
        name: 'Tâm ngoại giang hồ',
        singer: 'Âm khuyết thị thịnh',
        path: './musics/Tam-Ngoai-Giang-Ho.mp3',
        image: 'https://i.ytimg.com/vi/LtO8Ipux3NY/maxresdefault.jpg'
    },
    {
        name: 'On The Ground',
        singer: 'ROSÉ',
        path: './musics/On-The-Ground.mp3',
        image: 'https://hieuungchu.com/wp-content/uploads/2020/08/Rose-Blackpink.jpg'
    },
    {
        name: 'Celebrity',
        singer: 'IU',
        path: './musics/Celebrity.mp3',
        image: 'https://static2.yan.vn/YanNews/2167221/201908/iu-la-ai-tinh-yeu-su-nghiep-bai-hat-cua-iu-4bb930f2.jpg'
    }
];

setConfig = (key,value) => {
    config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(config))
}

var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();    
    var audioContextSrc = audioContext.createMediaElementSource(audio); 

function renderPlaylist() {
    const htmls = songs.map((song, index) => {        
        return `
            <div class="song" data-index="${index}">
                <img src="${song.image}" alt="" class="song__thumb">
                <div class="song__info">
                    <h3 class="song__info-name">${song.name}</h3>
                    <p class="song__info-singer">${song.singer}</p>
                </div>
                <div class="song__effect"> 
                    <div class="song__effect-bar"></div>
                    <div class="song__effect-bar"></div>
                    <div class="song__effect-bar"></div>
                    <div class="song__effect-bar"></div>
                    <div class="song__effect-bar"></div>
                </div>
            </div>
        `
    })
    playlist.innerHTML = htmls.join('')
}

loadCurrentSong = (index) => {
    const currentSong = songs[index]
    const activeSong = playlist.querySelectorAll('.song')

    activeSong[activedSong].classList.remove('song--active') //gỡ active cũ
    activeSong[index].classList.add('song--active') //thay active mới
    activedSong = index //update lại vị trí song đã active

    playerImage.src = currentSong.image
    playerSongName.textContent = currentSong.name
    playerSingerName.textContent = currentSong.singer
    audio.src = currentSong.path

    canvasElm.width= window.innerWidth
    canvasElm.height= window.innerHeight
}

activePlaying = index => {
    loadCurrentSong(index)
    if(!isPlaying) {
        isPlaying=true
        player.classList.toggle('playing')
    }
    audio.play()
}

loadNextSong = () => {    
    currentIndexSong++
    if (currentIndexSong === songs.length) {
        currentIndexSong = 0
    }    
    activePlaying(currentIndexSong)
    scrollToActiveSong()
}

loadPrevSong = () => {
    currentIndexSong--
    if(currentIndexSong < 0){
        currentIndexSong = songs.length-1
    }
    activePlaying(currentIndexSong)
    scrollToActiveSong()
}

loadRandomSong = () => {
    let newIndex
    do {
        newIndex = Math.floor(Math.random() * songs.length)
    }while (newIndex === currentIndexSong)
    currentIndexSong = newIndex
    activePlaying(currentIndexSong)
}

changeVolume = (index) => {
    volumePercent.textContent = index + '%'
    volumeProgress.value = index
    audio.volume = index/100
}

playlist.onclick = e => {
    const songNode = e.target.closest('.song:not(.song--active)')
    if (songNode){        
        currentIndexSong = songNode.getAttribute('data-index')    
        activePlaying(currentIndexSong)
    }
}

playBtn.onclick = () => {
    player.classList.toggle('playing')
    if (!isPlaying) {
        audio.play()
        isPlaying=true
    }else{
        audio.pause()
        isPlaying=false
    }
}

nextBtn.onclick = () => {
    return (!isRandom) ? loadNextSong() : loadRandomSong()
}

prevBtn.onclick = () => {
    return (!isRandom) ? loadPrevSong() : loadRandomSong()
}

randomBtn.onclick = () => {    
    isRandom = !isRandom    
    randomBtn.classList.toggle('btn--active')
    setConfig('isRandom', isRandom)
}

repeatBtn.onclick = () => {
    isRepeat = !isRepeat    
    repeatBtn.classList.toggle('btn--active')
    setConfig('isRepeat', isRepeat)
}

audio.ontimeupdate = () => {
    if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime/audio.duration*100)
        progressAudio.value = progressPercent
    }
    endTime.textContent = parseFloat(audio.duration/60).toFixed(2)
    seekTime.textContent = parseFloat(audio.currentTime/60).toFixed(2)
}

audio.onended = () => {
    if (!isRepeat){
        nextBtn.onclick()
    }else {
        loadCurrentSong(currentIndexSong)
        audio.play()
    }
}

audio.onplay = () => {
    isPlaying = true    
    renderMusicWave()
}

progressAudio.oninput = () => {
    const seekTime = progressAudio.value/100 * audio.duration
    audio.currentTime = seekTime    
}

volumeProgress.oninput = () => {
    volumePercent.textContent = volumeProgress.value + '%'
    currentVolume = volumeProgress.value
    changeVolume(currentVolume)
}

volumeUp.onclick = () => {
    if (currentVolume < 100){
        currentVolume ++                
        changeVolume(currentVolume)
    }
}
volumeDown.onclick = () => {
    if (currentVolume > 0){
        currentVolume --                
        changeVolume(currentVolume)
    }
}

renderMusicWave = () => {    
    var audioAnalyser = audioContext.createAnalyser();
    var canvasContext = canvasElm.getContext("2d");    
        
    audioContextSrc.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
    
    // Gán FFT size là 256 cho Analyser        
    audioAnalyser.fftSize = 256;
    var analyserFrequencyLength = audioAnalyser.frequencyBinCount;
    var frequencyDataArray = new Uint8Array(analyserFrequencyLength);    
    
    // Lấy width và height của canvas
    var canvasWith = canvasElm.width;
    var canvasHeight = canvasElm.height;
    // Tính toán barWidth và barHeight
    var barWidth = (canvasWith / analyserFrequencyLength) * 2.5;
    var barHeight;
    var barIndex = 0;
    
    function renderFrame() {        
        window.requestAnimationFrame(renderFrame);
        barIndex = 0;
        audioAnalyser.getByteFrequencyData(frequencyDataArray);
        // Tạo màu nền đối tượng theo sự thay đổi màu nền của theme
        canvasContext.fillStyle = isDarkTheme ? '#2e2f34' : '#dbe6f8'
        
        canvasContext.fillRect(0, 0, canvasWith, canvasHeight);
        for (var i = 0; i < analyserFrequencyLength; i++) {
        barHeight = frequencyDataArray[i]+100;
        // Tạo màu cho thanh bar        
        var rgbRed = 30 * (50 * (i / analyserFrequencyLength));
        var rgbGreen = 150 + (i / analyserFrequencyLength);
        var rgbBlue = 80;
        
        // Điền màu và vẽ bar
        canvasContext.fillStyle = "rgb("+ rgbRed +", "+ rgbGreen +", "+ rgbBlue +")";
        canvasContext.fillRect(barIndex, (canvasHeight - barHeight), barWidth, barHeight);
        barIndex += (barWidth + 5);
        }
    }        
    renderFrame();
}

loadConfig = () => {
    isRandom = config.isRandom
    isRepeat = config.isRepeat
    isDarkTheme = config.isDarkTheme
}

loadTheme = () => {
    app.classList.toggle('darkMode', isDarkTheme)
    toggleSwitchMode.checked = isDarkTheme
    if (isDarkTheme) {
        container.style.background = '#27282d'
    }else {
        container.style.background = '#d2e1f6'
    }
}

start = () => {
    loadConfig()    
    repeatBtn.classList.toggle('btn--active',isRepeat)
    randomBtn.classList.toggle('btn--active',isRandom)   
    loadTheme() 
    renderPlaylist()
    loadCurrentSong(currentIndexSong)
}

start()

// Change theme
toggleSwitchMode.onclick = () => {
    if (toggleSwitchMode.checked) {         
        isDarkTheme = true
        container.style.background = '#27282d'
        
    }else {        
        isDarkTheme = false
        container.style.background = '#d2e1f6'
        
    }
    app.classList.toggle('darkMode', isDarkTheme)
    setConfig('isDarkTheme', isDarkTheme)
}

// Scroll to Song is playing
scrollToActiveSong = () => {
    setTimeout (() => {
        $('.song.song--active').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        })
    },300)
}