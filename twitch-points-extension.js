const getPoints = () => {
    console.log("Checking for points...");
    const button = document.querySelector(
        ".community-points-summary .tw-transition button"
    );
    if (button) {
        button.click();
        console.log("Juicy points!");
    }
};

setInterval(getPoints, 10000);
