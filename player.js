document.addEventListener("DOMContentLoaded", function (event) {
    var audio = document.querySelector('#player');
    var url = audio.getAttribute('src');
    var filename = url.replace(/^.*[\\\/]/, '');

    var currentTime = document.querySelector('#currentTime');
    var totalTime = document.querySelector('#totalTime');
    var changeSpeed = document.querySelector('#changeSpeed');
    var showSpeed = document.querySelector("#showSpeed");
    var changeVolume = document.querySelectorAll('input.accessi');
    var playButton = document.querySelector("#playButton");
    var playText = document.querySelector("#playText");
    var backbutton = document.querySelector("#backButton");
    var resetButton = document.querySelector("#resetButton");
    var forwardbutton = document.querySelector("#forwardButton");
    var progressBar = document.querySelector('#seekBar');

    // Resume play from saved progress
    var localProgress = localStorage.getItem(filename);
    if (localProgress) {
        audio.currentTime = localProgress;
    }


    // Maximum and minimum play speed
    var playbackRateMax = 2;
    var playbackRateMin = 0.75;
    // A function to change play speed
    function setPlaySpeed() {
        var currentSpeed = audio.playbackRate;
        if (currentSpeed < playbackRateMax) {
            audio.playbackRate = currentSpeed + 0.25;
        } else {
            audio.playbackRate = playbackRateMin;
        }
        showSpeed.innerHTML = audio.playbackRate;
    }

    // A function to set audio volume
    function setVolume(val) {
        audio.volume = val;
    }

    // A function to play audio and insert the pause icon
    function playAudio() {
        if (audio.paused) {
            audio.play();
            playText.setAttribute('class', 'pause-icon');
        }
    }

    // A function to pause audio and insert the play icon
    function pauseAudio() {
        if (!audio.paused) {
            audio.pause();
            playText.setAttribute('class', 'play-icon');
        }
    }

    // A function to play and pause audio
    function togglePlay() {
        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    }

    // A function to start listening from the beginning
    function resetAudio() {
        if (audio.paused) {
            // Don't autostart audio if it was paused, simply go back
            audio.currentTime = 0;
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.play();
        }
    }

    /*
     * A function to build a callback that will change audio current time.
     * Audio will be forwarded or rewinded of 'seconds' seconds. 'seconds' should be negative to rewind.
     */
    function buildAudioSeeker(seconds) {
        return function () {
            time = audio.currentTime;
            if (time + seconds < 0) {
                audio.currentTime = 0;
            } else if (time + seconds > audio.duration) {
                audio.currentTime = audio.duration;
            } else {
                audio.currentTime += seconds;
            }
            updateProgress();
        }
    }

    // A function to change the progress bar value on click
    function seekProgressBar(progress) {
        // Get the progress bar % location and add it to the audio current time
        var percent = progress.offsetX / this.offsetWidth;
        audio.currentTime = percent * audio.duration;
        progressBar.value = percent / 100;
        updateProgress();
    }

    // A function to format a duration in seconds to a string 'hh:mm:ss'
    function formatTime(time) {
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - hours * 3600) / 60);
        var seconds = time - hours * 3600 - minutes * 60;
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        seconds = parseInt(seconds, 10);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    }

    /*
     * A callback triggered upon audio progress, progress bar seeking and back/forward buttons.
     * Actualizes both the progress bar and time display.
     */
    function updateProgress() {
        if (audio.currentTime == audio.duration) {
            pauseAudio();
            resetAudio();
        }
        progressBar.value = audio.currentTime / audio.duration;
        currentTime.innerHTML = formatTime(audio.currentTime);
        totalTime.innerHTML = formatTime(audio.duration);

        // Save progress to local storage
        localStorage.setItem(filename, audio.currentTime);
    }

    // Event listener reacting to audio progressing
    audio.addEventListener('timeupdate', updateProgress, false);

    // Event listeners checking for buttons clicks
    changeSpeed.addEventListener('click', setPlaySpeed, false);
    playButton.addEventListener('click', togglePlay, false);
    resetButton.addEventListener('click', resetAudio, false);
    backButton.addEventListener('click', buildAudioSeeker(-10), false);
    forwardButton.addEventListener('click', buildAudioSeeker(10), false);
    progressBar.addEventListener('click', seekProgressBar, false);

    // Register a click handler per volume section (0%, 10%, ..., 90%, 100%)
    for (var i = 0; i < changeVolume.length; i++) {
        changeVolume[i].addEventListener("click", function () {
            setVolume(this.value);
        });
    }
});