const musicPlayer = {
    currentTrack: 0,
    isPlaying: false,
    isShuffled: false,
    isRepeat: false,
    audio: null,
    playlist: [
        {
            title: "Kun Anta",
            artist: "Hamood",
            file: "assets/nasheeds/nasheed1.mp3",
            cover: "assets/images/cover1.jpg"
        },
        {
            title: "Tabalagh Bil Qaleel",
            artist: "Osman Al Safi",
            file: "assets/nasheeds/nasheed2.mp3",
            cover: "assets/images/cover2.jpg"
        },
        {
            title: "Ya Adheeman",
            artist: "Ahmed Bukhatir",
            file: "assets/nasheeds/nasheed3.mp3",
            cover: "assets/images/cover3.jpg"
        },
    ],

    init() {
        this.audio = document.getElementById('audio');
        this.lastVolume = 1;
        this.setupEventListeners();
        this.setupVolumeControl();
        this.setupNavigation();
        this.renderPlaylist();
        this.loadTrack(this.currentTrack);
    },

    setupNavigation() {
        // Add click handlers for all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');

                // Handle navigation based on icon
                if (item.querySelector('.fa-home')) {
                    this.showHome();
                } else if (item.querySelector('.fa-search')) {
                    this.showSearch();
                } else if (item.querySelector('.fa-list')) {
                    this.showLibrary();
                }
            });
        });
    },

    showHome() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <button class="theme-toggle" id="themeToggle">
                <i class="fas ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>
            </button>
            <div class="playlist">
                <h2>Your Nasheeds</h2>
                <div id="playlist"></div>
            </div>
        `;

        // Reattach theme toggle listener
        document.getElementById('themeToggle').addEventListener('click', () => this.themeToggle());
        // Re-render playlist
        this.renderPlaylist();
    },

    showSearch() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <button class="theme-toggle" id="themeToggle">
                <i class="fas ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>
            </button>
            <div class="search-container">
                <input type="text" class="search-input" placeholder="Search nasheeds...">
                <div class="search-results"></div>
            </div>
        `;

        // Reattach theme toggle listener
        document.getElementById('themeToggle').addEventListener('click', () => this.themeToggle());

        // Add search input listener
        document.querySelector('.search-input').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const results = this.playlist.filter(track =>
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query)
            );
            this.renderSearchResults(results);
        });
    },

    showLibrary() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <button class="theme-toggle" id="themeToggle">
                <i class="fas ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>
            </button>
            <h2>Your Library</h2>
            <div class="library-stats">
                <div>Total Nasheeds: ${this.playlist.length}</div>
                <div>Total Duration: ${this.getTotalDuration()}</div>
            </div>
            <div class="library-content">
                ${this.renderLibraryView()}
            </div>
        `;

        // Reattach theme toggle listener
        document.getElementById('themeToggle').addEventListener('click', () => this.themeToggle());

        // Add click handlers for library items
        document.querySelectorAll('.library-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.currentTrack = index;
                this.loadTrack(index);
                this.audio.play();
                this.isPlaying = true;
                this.updatePlayButton();
            });
        });
    },

    renderLibraryView() {
        return this.playlist.map((track, index) => `
            <div class="search-item library-item" data-index="${index}">
                <img src="${track.cover}" alt="${track.title}">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            </div>
        `).join('');
    },

    getTotalDuration() {
        return `${this.playlist.length} tracks`;
    },

    setupVolumeControl() {
        const volumeControl = document.getElementById('volume');
        const volumeLines = document.getElementById('volume-lines');

        // Set initial state
        this.updateVolumeLines(volumeControl.value);
        this.audio.volume = volumeControl.value / 100;

        // Volume slider input handler
        volumeControl.addEventListener('input', (e) => {
            const value = e.target.value;
            this.audio.volume = value / 100;
            this.updateVolumeLines(value);
        });

        // Click on lines to toggle mute
        volumeLines.addEventListener('click', () => {
            if (this.audio.volume > 0) {
                this.lastVolume = this.audio.volume;
                this.audio.volume = 0;
                volumeControl.value = 0;
            } else {
                this.audio.volume = this.lastVolume || 1;
                volumeControl.value = this.lastVolume * 100 || 100;
            }
            this.updateVolumeLines(volumeControl.value);
        });
    },

    updateVolumeLines(value) {
        const volumeLines = document.getElementById('volume-lines');
        const lines = volumeLines.querySelectorAll('.line');

        // Update volume percentage for slider gradient
        document.documentElement.style.setProperty('--volume-percentage', `${value}%`);

        if (value == 0) {
            volumeLines.setAttribute('data-volume', 'muted');
            lines.forEach(line => {
                line.style.height = '4px';
                line.style.opacity = '0.3';
            });
        } else {
            volumeLines.removeAttribute('data-volume');
            lines.forEach((line, index) => {
                const height = (index + 1) * 4 + 2;
                const scale = Math.min(value / 100, 1);
                line.style.height = `${height * scale}px`;
                line.style.opacity = value > (index * 25) ? '1' : '0.3';
            });
        }
    },
    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.themeToggle());
        document.getElementById('play').addEventListener('click', () => this.togglePlay());
        document.getElementById('next').addEventListener('click', () => this.nextTrack());
        document.getElementById('prev').addEventListener('click', () => this.previousTrack());
        document.getElementById('shuffle').addEventListener('click', () => this.shufflePlaylist());
        document.getElementById('repeat').addEventListener('click', () => this.toggleRepeat());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());

        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            const progressBar = e.currentTarget;
            const clickPosition = e.offsetX;
            const progressBarWidth = progressBar.offsetWidth;
            const percentage = clickPosition / progressBarWidth;
            this.audio.currentTime = percentage * this.audio.duration;
        });

        // Track ended handler
        this.audio.addEventListener('ended', () => {
            if (this.isRepeat) {
                this.audio.play();
            } else {
                this.nextTrack();
            }
        });
    },

    themeToggle() {
        const html = document.documentElement;
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Update theme attribute
        html.setAttribute('data-theme', newTheme);

        // Update toggle button icon
        themeToggle.innerHTML = `<i class="fas fa-${newTheme === 'dark' ? 'moon' : 'sun'}"></i>`;

        // Update logo brightness based on theme
        const logo = document.querySelector('.logo-container img');
        if (logo) {
            logo.style.filter = `brightness(${newTheme === 'dark' ? 1 : 0.8})`;
        }

        // Update other theme-dependent elements
        const repeatButton = document.getElementById('repeat');
        if (repeatButton && this.isRepeat) {
            repeatButton.style.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--accent').trim();
        }
    },

    loadTrack(index) {
        const track = this.playlist[index];
        this.audio.src = track.file;
        document.getElementById('cover').src = track.cover;
        document.getElementById('title').textContent = track.title;
        document.getElementById('artist').textContent = track.artist;

        // Reset progress
        document.querySelector('.progress-bar-fill').style.width = '0%';
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';

        // Update any visible playlists
        if (document.getElementById('playlist')) {
            this.renderPlaylist();
        }
    },

    updateProgress() {
        if (!this.audio.duration) return;

        const progressBar = document.querySelector('.progress-bar-fill');
        const currentTime = document.getElementById('current-time');
        const duration = document.getElementById('duration');

        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        progressBar.style.width = `${percentage}%`;

        currentTime.textContent = this.formatTime(this.audio.currentTime);
        duration.textContent = this.formatTime(this.audio.duration);
    },

    formatTime(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            document.getElementById('play').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audio.play();
            document.getElementById('play').innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isPlaying = !this.isPlaying;
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play().catch(error => console.log('Playback failed:', error));
        }
    },

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play().catch(error => console.log('Playback failed:', error));
        }
    },

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatButton = document.getElementById('repeat');
        repeatButton.style.color = this.isRepeat ? '#1db954' : 'white';
    },

    renderPlaylist() {
        const playlistEl = document.getElementById('playlist');
        if (!playlistEl) return;

        playlistEl.innerHTML = this.playlist
            .map((track, index) => `
                <li data-index="${index}" class="${index === this.currentTrack ? 'active' : ''}">
                    <img src="${track.cover}" alt="${track.title}">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </li>
            `).join('');

        // Add click handlers for playlist items
        playlistEl.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.currentTrack = index;
                this.loadTrack(index);
                this.audio.play();
                this.isPlaying = true;
                this.togglePlay();
            });
        });
    },

    renderSearchResults(results) {
        const container = document.querySelector('.search-results');
        container.innerHTML = results.map((track, index) => `
            <div class="search-item" data-index="${this.playlist.indexOf(track)}">
                <img src="${track.cover}" alt="${track.title}">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.currentTrack = index;
                this.loadTrack(index);
                this.audio.play();
                this.isPlaying = true;
                this.togglePlay();
            });
        });
    },

    shufflePlaylist() {
        this.isShuffled = !this.isShuffled;
        if (this.isShuffled) {
            this.playlist = [...this.playlist]
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        } else {
            this.playlist.sort((a, b) => a.title.localeCompare(b.title));
        }
        this.renderPlaylist();
    }
};

// Initialize the music player when the page loads
musicPlayer.init();