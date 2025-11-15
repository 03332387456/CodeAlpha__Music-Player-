require('dotenv').config()
console.log("hello world");

const audioPlayer = {
    audio: new Audio(),
    playlist: [],
    index: 0,

    load(songUrl) {
        this.audio.src = songUrl;
    },

    play() {
        this.audio.play().catch(err => {
            console.log("Audio blocked:", err);
        });
    },

    pause() {
        this.audio.pause();
    },

      playSong(index) {
        this.index = index;
        this.load(this.playlist[index].url);
        this.play();
        document.getElementById("songName").innerText = this.playlist[index].name; 
      },
    next() {
        if (this.index < this.playlist.length - 1) {
            this.playSong(this.index + 1);

        }
    },

    prev() {
        if (this.index > 0) {
            this.playSong(this.index - 1);
        }
    }
};


function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Add leading zeros
    let mm = String(minutes).padStart(2, "0");
    let ss = String(secs).padStart(2, "0");

    return `${mm}:${ss}`;
}



let Hamburgerheader = document.getElementById("Hamburger-header")
let Close = document.getElementById("close")
let playListCard = document.getElementById("playListCard")
let Card = document.getElementById("Card")
let songsLibraryUl = document.getElementById("songsLibraryUl")
// let li = document.getElementById("li")
// let seekbar = document.getElementById("seekbar")
// let play = document.getElementById("play")
// let previous = document.getElementById("previous")


Hamburgerheader.addEventListener("click", () => {
    console.log("Hamburger clicked");
    document.getElementById("box1").style.left = 0 + "%"

})

Close.addEventListener("click", () => {
    console.log("close clicked");
    document.getElementById("box1").style.left = -120 + "%"

})




let songs = [];
let currentSong = new Audio

// const GITHUB_TOKEN = "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";
const token = process.env.GITHUB_TOKEN;

// Fetch all playlists
async function fetchPlaylists() {
    try {
        let api = await fetch("https://api.github.com/repos/03332387456/musics-/contents/Music", {
            headers: {
                Authorization: `token ${token}`
            }
        });

        let response = await api.json();

        const foldersList = response.filter(item => item.type === "dir");
        console.log("Playlists:", foldersList);

        return foldersList;
    } catch (err) {
        console.error("Error fetching playlists:", err);
        return [];
    }
}

async function fetchSongs() {
    const playlists = await fetchPlaylists();

    for (let i = 0; i < playlists.length; i++) {
        const element = playlists[i];
        let playlistData = { playlist: element.name, songs: [] };

        if (element.type === "dir") {
            try {
                let songsRes = await fetch(element.url, {
                    headers: {
                        Authorization: `token ${token}`
                    }
                });
                let songsData = await songsRes.json();

                // console.log(`Songs in ${element.name}:`);

                for (let j = 0; j < songsData.length; j++) {
                    const song = songsData[j];

                    if (song.name.endsWith(".mp3")) {
                        // console.log("Song:", song.name);
                        // console.log("URL:", song.download_url);

                        playlistData.songs.push({
                            name: song.name,
                            url: song.download_url
                        });
                    }

                    if (song.name.endsWith(".jpeg") || song.name.endsWith(".png") || song.name.endsWith(".jpg")) {
                        // console.log("Cover:", song.download_url);
                        playlistData.cover = song.download_url;
                    }
                }
            } catch (err) {
                console.error(`Error fetching songs in ${element.name}:`, err);
            }
        }

        songs.push(playlistData);
    }

    console.log("All Playlists with Songs:", songs);
}



fetchSongs().then(() => {
    displayPlaylists();

    if (songs.length > 0) {
        loadLibrary(songs[0]);
    }

})


function displayPlaylists() {
    playListCard.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        const playlist = songs[i];

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${playlist.cover || 'https://via.placeholder.com/200x120'}" alt="">
            <h4 class="ArtistName">${playlist.playlist}</h4>
            <p>${playlist.playlist} songs for you</p>
        `;

        card.addEventListener("click", () => loadLibrary(playlist));

        playListCard.appendChild(card);
    }
}

function loadLibrary(playlist) {
    songsLibraryUl.innerHTML = "";

    audioPlayer.playlist = playlist.songs;  
    audioPlayer.index = 0;

    if (playlist.songs.length > 0) {
        audioPlayer.playSong(0);
    }

    for (let i = 0; i < playlist.songs.length; i++) {
        const song = playlist.songs[i];

        const li = document.createElement("li");
        li.innerHTML = `
            <span class="material-symbols-outlined music-icon">music_cast</span>
            <span class="song-title">${song.name}</span>
            <span class="material-symbols-outlined play-icon">play_circle</span>
        `;
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            audioPlayer.playSong(i);
        });

        songsLibraryUl.appendChild(li);
    }
}


function displayFilteredSongs(list, searchText) {
    songsLibraryUl.innerHTML = "";

    // If nothing found
    if (list.length === 0 && searchText !== "") {
        const msg = document.createElement("li");
        msg.style.color = "red";
        msg.style.padding = "10px";
        msg.textContent = "This song is not in the current playlist";
        songsLibraryUl.appendChild(msg);
        return;
    }

    // Show filtered songs
    list.forEach((song) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="material-symbols-outlined music-icon">music_cast</span>
            <span class="song-title">${song.name}</span>
            <span class="material-symbols-outlined play-icon">play_circle</span>
        `;
        li.style.cursor = "pointer";

        const realIndex = audioPlayer.playlist.indexOf(song);

        li.addEventListener("click", () => {
            audioPlayer.playSong(realIndex);
        });

        songsLibraryUl.appendChild(li);
    });
}




// update progress on time change
audioPlayer.audio.addEventListener("timeupdate", () => {
    document.getElementById("SongDuratio").innerHTML = `
        ${formatTime(audioPlayer.audio.currentTime)} / ${formatTime(audioPlayer.audio.duration)}
    `;
    let percent = (audioPlayer.audio.currentTime / audioPlayer.audio.duration) * 100;
    document.getElementById("circle").style.left = percent + "%";

        document.getElementById("seekbar").style.background =
        `linear-gradient(to right, #1db954 ${percent}%, #4f4f4f ${percent}%)`;
});


// seekbar click
document.getElementById("seekbar").addEventListener("click", e => {
    let width = e.target.getBoundingClientRect().width;
    let percent = (e.offsetX / width) * 100;

    document.getElementById("circle").style.left = percent + "%";

    audioPlayer.audio.currentTime = (audioPlayer.audio.duration * percent) / 100;
});



// attach an eventlistner for play and pause   

let isPlaying = false;

document.getElementById("play").addEventListener("click", () => {
    if (!isPlaying) {
        audioPlayer.play();
        isPlaying = true;

        document.getElementById("play").style.display = "none";
        document.getElementById("pause").style.display = "inline-block";
    }
});

document.getElementById("pause").addEventListener("click", () => {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;

        document.getElementById("pause").style.display = "none";
        document.getElementById("play").style.display = "inline-block";
    }
});

// attach an eventlistner for volume  
document.getElementById("inputVolume").addEventListener("change" , (e)=>{
  console.log("volume setting to " + e.target.value + "/100");
        audioPlayer.audio.volume = (e.target.value) / 100
})



// attach an eventlistner for previous button  and next  
document.getElementById("previous").addEventListener("click", () => {
    audioPlayer.prev();
});

document.getElementById("next").addEventListener("click", () => {
    audioPlayer.next();
});


// attach an eventlistner for searchbar  
document.getElementById("searchBar").addEventListener("input" , (e)=>{
    let searchText = e.target.value
    console.log(searchText);
    
    let filteredSongs = audioPlayer.playlist.filter(song =>
        song.name.toLowerCase().includes(searchText))

         displayFilteredSongs(filteredSongs);
})



