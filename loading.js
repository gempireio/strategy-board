loadingScreen = document.getElementById("loading");
gameScreen = document.getElementById("game");

function fadeOutLoadingScreen() {
    let opacity = 1;
    let timer = setInterval(function () {
        if (opacity > 0.01) {    
            opacity *= 0.95;
        } else {
            gameScreen.style.opacity = 1;
            loadingScreen.remove();
            clearInterval(timer);   
        }
        loadingScreen.style.opacity = opacity;  
        gameScreen.style.opacity = 1 - opacity;  
    }, 50);   
}