var mainContainer = document.querySelector('.main-container');
var descContainer = mainContainer.querySelector('.desc-container');
var descParagraph = descContainer.querySelector('p');
var headerContainer = mainContainer.querySelector('.header-container');
var headerParagraph = headerContainer.querySelector('p');
var heartIconWrapper = mainContainer.querySelector('.heart-icon-wrapper');
var crossIconWrapper = mainContainer.querySelector('.cross-icon-wrapper');
var svg_heart = heartIconWrapper.querySelector('svg');
var svg_cross = crossIconWrapper.querySelector('svg');
// Return date in 'month_name DD, YYYY' format
function formatDate(date) {
    var d = new Date(date);
    var day = (d.getDate() < 10 ? '0' : '') + d.getDate();
    var month = d.toLocaleString('default', { month: 'short' }).slice(0, 3); // Limit month name to 3 char to standardize across diff browsers
    var year = d.getFullYear();
    return "".concat(month, " ").concat(day, ", ").concat(year);
}
function changeHeartColour(heart_colour, circle_colour) {
    if (svg_heart) {
        var circle = svg_heart.querySelector('circle');
        if (circle)
            circle.setAttribute('fill', circle_colour);
        var heartPath = svg_heart.querySelector('path');
        if (heartPath)
            heartPath.setAttribute('fill', heart_colour);
    }
    else {
        throw new Error("SVG not found inside .heart-icon-wrapper");
    }
}
function changeCrossColour(cross_colour, circle_colour) {
    if (svg_cross) {
        var circle = svg_cross.querySelector('circle');
        if (circle)
            circle.setAttribute('fill', circle_colour);
        var crossPath = svg_cross.querySelector('path');
        if (crossPath)
            crossPath.setAttribute('fill', cross_colour);
    }
    else {
        throw new Error("SVG not found inside .heart-icon-wrapper");
    }
}
// Fetch initial cat data
var cats = [];
var cats_like = [];
var currIdx = 0;
var isReviewAllCats = false;
var isReviewCurrCat = false;
var isMobile = window.matchMedia("(pointer: coarse)").matches;
function fetchCats() {
    return fetch('https://cataas.com/api/cats?limit=10')
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (!data || data.length === 0) {
            throw new Error('No cat data found');
        }
        cats = data;
        showCat(cats[currIdx]);
    });
}
function showCat(cat) {
    // Get new img
    var img = document.createElement('img');
    console.log(cat);
    img.src = "https://cataas.com/cat/".concat(cat.id);
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease, transform 0.05s linear';
    // Clear prev img and desc then add new ones
    mainContainer.innerHTML = '';
    if (isReviewAllCats) {
        mainContainer.appendChild(headerContainer);
        headerParagraph.innerHTML = "<b>Total Cats Liked: ".concat(cats_like.length, "<br>\n        Here Are The Cats You Like:<b>");
    }
    else {
        mainContainer.appendChild(heartIconWrapper);
        mainContainer.appendChild(crossIconWrapper);
    }
    mainContainer.appendChild(img);
    mainContainer.appendChild(descContainer);
    var cat_date = cat.createdAt ? formatDate(cat.createdAt) : '-';
    var cat_tag = cat.tags && cat.tags.length > 0 ? '#' + cat.tags.join(' #') : '-';
    descParagraph.innerHTML = "\n    <span class=\"cat-date\">".concat(cat_date, "</span><br>\n    <span class=\"cat-tag\">").concat(cat_tag, "</span>\n  ");
    // Img opacity after fade in
    img.onload = function () {
        img.style.opacity = '1';
    };
    if (isMobile) {
        if (isReviewAllCats) {
            summarySwipeListener(img);
        }
        else {
            reviewSwipeListener(img);
        }
    }
    else {
        if (isReviewAllCats) {
            summaryDragListener(img);
        }
        else {
            reviewDragListener(img);
        }
    }
}
// Show next cat
function showNextCat(cats) {
    currIdx = (currIdx + 1) >= cats.length ? 0 : currIdx + 1;
    var cat = cats[currIdx];
    console.log("index:".concat(currIdx), cat);
    showCat(cat);
}
// Show next cat
function showPrevCat(cats) {
    currIdx = currIdx - 1 < 0 ? cats.length - 1 : currIdx - 1;
    var cat = cats[currIdx];
    console.log("index:".concat(currIdx), cat);
    showCat(cat);
}
// Allow img detect swipe and define summary swipe interactions
function summarySwipeListener(img) {
    var startX = null;
    var startY = null;
    var swipe_NewCat_threshold = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    var isVerticalSwipe = null;
    function touchStartHandler(e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }
    function touchMoveHandler(e) {
        if (startX === null || startY === null)
            return;
        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var diffX = currentX - startX;
        var diffY = currentY - startY;
        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            }
            else {
                isVerticalSwipe = false;
            }
        }
        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = "translate(0, ".concat(diffY, "px)");
        }
    }
    function touchEndHandler(e) {
        if (startY === null)
            return;
        var endY = e.changedTouches[0].clientY;
        var diffY = endY - startY;
        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe);
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) { // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats_like);
            }
            else if (diffY > swipe_NewCat_threshold) { // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats_like);
            }
        }
        // Reset img pos colour
        img.style.transform = 'translate(0,0)';
        // Reset startx and startY
        startX = null;
        startY = null;
        isVerticalSwipe = null;
    }
    // Remove prev listeners to avoid duplicates
    img.ontouchstart = null;
    img.ontouchmove = null;
    img.ontouchend = null;
    // Add listeners to img
    img.addEventListener('touchstart', touchStartHandler);
    img.addEventListener('touchmove', touchMoveHandler);
    img.addEventListener('touchend', touchEndHandler);
}
// Allow img detect swipe and define review swipe interactions
function reviewSwipeListener(img) {
    var startX = null;
    var startY = null;
    var swipe_NewCat_threshold = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    var isVerticalSwipe = null;
    function touchStartHandler(e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }
    function touchMoveHandler(e) {
        if (startX === null || startY === null)
            return;
        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var diffX = currentX - startX;
        var diffY = currentY - startY;
        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            }
            else {
                isVerticalSwipe = false;
            }
        }
        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = "translate(0, ".concat(diffY, "px)");
        }
        else {
            img.style.transform = "translate(".concat(diffX, "px, 0)");
            if (diffX > swipe_NewCat_threshold) { // Swipe to right (green)
                mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                changeHeartColour('#43ff65', 'white');
                changeCrossColour('white', '#ff0000');
            }
            else if (diffX < -swipe_NewCat_threshold) { // Swipe to left (red)
                mainContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('#ff0000', 'white');
            }
            else {
                mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('white', '#ff0000');
            }
        }
    }
    function touchEndHandler(e) {
        if (startX === null || startY === null)
            return;
        changeHeartColour('white', '#43ff65');
        changeCrossColour('white', '#ff0000');
        var endX = e.changedTouches[0].clientX;
        var endY = e.changedTouches[0].clientY;
        var diffX = endX - startX;
        var diffY = endY - startY;
        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe);
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) { // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats);
            }
            else if (diffY > swipe_NewCat_threshold) { // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats);
            }
        }
        else {
            if (diffX > swipe_NewCat_threshold) { // Swiped right (like)
                console.log('Liked the cat');
                cats_like.push(cats[currIdx]);
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            else if (diffX < -swipe_NewCat_threshold) { // Swiped left (dislike)
                console.log('Disliked the cat');
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            console.log('Cats:', cats);
            console.log('Cats liked:', cats_like);
            console.log('isReviewCurrCat:', isReviewCurrCat);
            if (isReviewCurrCat) {
                if (cats.length < 1) { // Check if all cats gone through
                    isReviewAllCats = true;
                    console.log('isReviewAllCats:', isReviewAllCats);
                    currIdx = 0; // Reset currIdx for cats_like
                    mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                    if (cats_like.length < 1) {
                        mainContainer.innerHTML = '';
                        mainContainer.appendChild(headerContainer);
                        headerParagraph.innerHTML = "<b>Total Cats Liked: ".concat(cats_like.length, "<br>\n                            You Didn't Like Any Cat<b>");
                    }
                    else {
                        console.log("index:".concat(currIdx), cats_like[currIdx]);
                        showCat(cats_like[currIdx]);
                    }
                }
                else {
                    isReviewCurrCat = false;
                    mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    console.log('isReviewAllCats:', isReviewAllCats);
                    showNextCat(cats);
                }
            }
        }
        // Reset img pos nad main container bg colour
        img.style.transform = 'translate(0,0)';
        // Reset startx and startY
        startX = null;
        startY = null;
        isVerticalSwipe = null;
    }
    // Remove prev listeners to avoid duplicates
    img.ontouchstart = null;
    img.ontouchmove = null;
    img.ontouchend = null;
    // Add listeners to img
    img.addEventListener('touchstart', touchStartHandler);
    img.addEventListener('touchmove', touchMoveHandler);
    img.addEventListener('touchend', touchEndHandler);
}
// Allow img detect drag and define summary drag interactions (PC)
function summaryDragListener(img) {
    var startX = null;
    var startY = null;
    var swipe_NewCat_threshold = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    var isVerticalSwipe = null;
    function mouseDownHandler(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }
    function mouseMoveHandler(e) {
        if (startX === null || startY === null)
            return;
        var currentX = e.clientX;
        var currentY = e.clientY;
        var diffX = currentX - startX;
        var diffY = currentY - startY;
        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            }
            else {
                isVerticalSwipe = false;
            }
        }
        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = "translate(0, ".concat(diffY, "px)");
        }
    }
    function mouseUpHandler(e) {
        if (startY === null)
            return;
        var endY = e.clientY;
        var diffY = endY - startY;
        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe);
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) { // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats_like);
            }
            else if (diffY > swipe_NewCat_threshold) { // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats_like);
            }
        }
        // Reset img pos colour
        img.style.transform = 'translate(0,0)';
        // Reset startx and startY
        startX = null;
        startY = null;
        isVerticalSwipe = null;
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }
    // Remove prev listeners to avoid duplicates
    img.onmousedown = null;
    // Add listeners to img
    img.addEventListener('mousedown', mouseDownHandler);
}
// Allow img drag and define review drag interactions (PC)
function reviewDragListener(img) {
    var startX = null;
    var startY = null;
    var swipe_NewCat_threshold = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    var isVerticalSwipe = null;
    function mouseDownHandler(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }
    function mouseMoveHandler(e) {
        if (startX === null || startY === null)
            return;
        var currentX = e.clientX;
        var currentY = e.clientY;
        var diffX = currentX - startX;
        var diffY = currentY - startY;
        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            }
            else {
                isVerticalSwipe = false;
            }
        }
        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = "translate(0, ".concat(diffY, "px)");
        }
        else {
            img.style.transform = "translate(".concat(diffX, "px, 0)");
            if (diffX > swipe_NewCat_threshold) { // Swipe to right (green)
                mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                changeHeartColour('#43ff65', 'white');
                changeCrossColour('white', '#ff0000');
            }
            else if (diffX < -swipe_NewCat_threshold) { // Swipe to left (red)
                mainContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('#ff0000', 'white');
            }
            else {
                mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('white', '#ff0000');
            }
        }
    }
    function mouseUpHandler(e) {
        if (startX === null || startY === null)
            return;
        changeHeartColour('white', '#43ff65');
        changeCrossColour('white', '#ff0000');
        var endX = e.clientX;
        var endY = e.clientY;
        var diffX = endX - startX;
        var diffY = endY - startY;
        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe);
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) { // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats);
            }
            else if (diffY > swipe_NewCat_threshold) { // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats);
            }
        }
        else {
            if (diffX > swipe_NewCat_threshold) { // Swiped right (like)
                console.log('Liked the cat');
                cats_like.push(cats[currIdx]);
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            else if (diffX < -swipe_NewCat_threshold) { // Swiped left (dislike)
                console.log('Disliked the cat');
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            console.log('Cats:', cats);
            console.log('Cats liked:', cats_like);
            console.log('isReviewCurrCat:', isReviewCurrCat);
            if (isReviewCurrCat) {
                if (cats.length < 1) { // Check if all cats gone through
                    isReviewAllCats = true;
                    console.log('isReviewAllCats:', isReviewAllCats);
                    currIdx = 0; // Reset currIdx for cats_like
                    mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                    if (cats_like.length < 1) {
                        mainContainer.innerHTML = '';
                        mainContainer.appendChild(headerContainer);
                        headerParagraph.innerHTML = "<b>Total Cats Liked: ".concat(cats_like.length, "<br>\n                            You Didn't Like Any Cat<b>");
                    }
                    else {
                        console.log("index:".concat(currIdx), cats_like[currIdx]);
                        showCat(cats_like[currIdx]);
                    }
                }
                else {
                    isReviewCurrCat = false;
                    mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    console.log('isReviewAllCats:', isReviewAllCats);
                    showNextCat(cats);
                }
            }
        }
        // Reset img pos nad main container bg colour
        img.style.transform = 'translate(0,0)';
        // Reset startx and startY
        startX = null;
        startY = null;
        isVerticalSwipe = null;
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }
    // Remove prev listeners to avoid duplicates
    img.onmousedown = null;
    // Add listeners to img
    img.addEventListener('mousedown', mouseDownHandler);
}
// Initial fetch and display
fetchCats().catch(function (err) {
    console.error(err);
    descParagraph.innerHTML = 'Something Went Wrong';
});
