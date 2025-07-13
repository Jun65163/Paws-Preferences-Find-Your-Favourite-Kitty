const mainContainer = document.querySelector('.main-container') as HTMLElement;
const descContainer = mainContainer.querySelector('.desc-container') as HTMLElement;
const descParagraph = descContainer.querySelector('p') as HTMLElement;
const headerContainer = mainContainer.querySelector('.header-container') as HTMLElement;
const headerParagraph = headerContainer.querySelector('p') as HTMLElement;
const heartIconWrapper = mainContainer.querySelector('.heart-icon-wrapper') as HTMLElement;
const crossIconWrapper = mainContainer.querySelector('.cross-icon-wrapper') as HTMLElement;

const svg_heart = heartIconWrapper.querySelector('svg') as SVGSVGElement;
const svg_cross = crossIconWrapper.querySelector('svg') as SVGSVGElement;

// Return date in 'month_name DD, YYYY' format
function formatDate(date: string): string {
    const d: Date = new Date(date);
    const day: string = (d.getDate() < 10 ? '0' : '') + d.getDate();
    const month: string = d.toLocaleString('default', { month: 'short' }).slice(0, 3); // Limit month name to 3 char to standardize across diff browsers
    const year: number = d.getFullYear();

    return `${month} ${day}, ${year}`;
}

function changeHeartColour(heart_colour: string, circle_colour: string) {
    if (svg_heart) {
        const circle = svg_heart.querySelector('circle') as SVGCircleElement | null;
        if (circle) circle.setAttribute('fill', circle_colour);
        const heartPath = svg_heart.querySelector('path') as SVGCircleElement | null;
        if (heartPath) heartPath.setAttribute('fill', heart_colour);
    }
    else {
        throw new Error("SVG not found inside .heart-icon-wrapper");
    }
}

function changeCrossColour(cross_colour: string, circle_colour: string) {
    if (svg_cross) {
        const circle = svg_cross.querySelector('circle') as SVGCircleElement | null;
        if (circle) circle.setAttribute('fill', circle_colour);
        const crossPath = svg_cross.querySelector('path') as SVGCircleElement | null;
        if (crossPath) crossPath.setAttribute('fill', cross_colour);
    }
    else {
        throw new Error("SVG not found inside .heart-icon-wrapper");
    }
}

// Fetch initial cat data
let cats: any[] = [];
let cats_like: any[] = [];
let currIdx: number = 0;
let isReviewAllCats: boolean = false;
let isReviewCurrCat: boolean = false;
let isMobile: boolean = window.matchMedia("(pointer: coarse)").matches;

function fetchCats() {
    return fetch('https://cataas.com/api/cats?limit=10')
        .then(res => res.json())
        .then((data) => {
            if (!data || data.length === 0) {
                throw new Error('No cat data found');
            }
            cats = data
            showCat(cats[currIdx]);
        });
}

function showCat(cat: any) {
    // Get new img
    const img: HTMLImageElement = document.createElement('img');
    console.log(cat);
    img.src = `https://cataas.com/cat/${cat.id}`;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease, transform 0.05s linear';

    // Clear prev img and desc then add new ones
    mainContainer.innerHTML = '';

    if (isReviewAllCats) {
        mainContainer.appendChild(headerContainer);
        headerParagraph.innerHTML = `<b>Total Cats Liked: ${cats_like.length}<br>
        Here Are The Cats You Like:<b>`;
    }
    else {
        mainContainer.appendChild(heartIconWrapper);
        mainContainer.appendChild(crossIconWrapper);
    }

    mainContainer.appendChild(img);
    mainContainer.appendChild(descContainer);

    const cat_date = cat.createdAt ? formatDate(cat.createdAt) : '-';
    const cat_tag = cat.tags && cat.tags.length > 0 ? '#' + cat.tags.join(' #') : '-';

    descParagraph.innerHTML = `
    <span class="cat-date">${cat_date}</span><br>
    <span class="cat-tag">${cat_tag}</span>
  `;

    // Img opacity after fade in
    img.onload = () => {
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
function showNextCat(cats: any[]) {
    currIdx = (currIdx + 1) >= cats.length ? 0 : currIdx + 1;
    const cat: any = cats[currIdx];
    console.log(`index:${currIdx}`, cat);
    showCat(cat);
}

// Show next cat
function showPrevCat(cats: any[]) {
    currIdx = currIdx - 1 < 0 ? cats.length - 1 : currIdx - 1;
    const cat: any = cats[currIdx];
    console.log(`index:${currIdx}`, cat);
    showCat(cat);
}

// Allow img detect swipe and define summary swipe interactions
function summarySwipeListener(img: HTMLImageElement) {
    let startX: number | null = null;
    let startY: number | null = null;
    let swipe_NewCat_threshold: number = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    let isVerticalSwipe: boolean | null = null;

    function touchStartHandler(e: TouchEvent) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }

    function touchMoveHandler(e: TouchEvent) {
        if (startX === null || startY === null) return;

        const currentX: number = e.touches[0].clientX;
        const currentY: number = e.touches[0].clientY;

        const diffX: number = currentX - startX;
        const diffY: number = currentY - startY;

        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            } else {
                isVerticalSwipe = false;
            }
        }

        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = `translate(0, ${diffY}px)`;
        }
    }

    function touchEndHandler(e: TouchEvent) {
        if (startY === null) return;

        const endY: number = e.changedTouches[0].clientY;
        const diffY: number = endY - startY;

        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe)
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) {  // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats_like);
            } else if (diffY > swipe_NewCat_threshold) {  // Swiped down
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
function reviewSwipeListener(img: HTMLImageElement) {
    let startX: number | null = null;
    let startY: number | null = null;
    let swipe_NewCat_threshold: number = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    let isVerticalSwipe: boolean | null = null;

    function touchStartHandler(e: TouchEvent) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }

    function touchMoveHandler(e: TouchEvent) {
        if (startX === null || startY === null) return;

        const currentX: number = e.touches[0].clientX;
        const currentY: number = e.touches[0].clientY;

        const diffX: number = currentX - startX;
        const diffY: number = currentY - startY;

        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            } else {
                isVerticalSwipe = false;
            }
        }

        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = `translate(0, ${diffY}px)`;
        } else {
            img.style.transform = `translate(${diffX}px, 0)`;

            if (diffX > swipe_NewCat_threshold) {  // Swipe to right (green)
                mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                changeHeartColour('#43ff65', 'white');
                changeCrossColour('white', '#ff0000')
            } else if (diffX < -swipe_NewCat_threshold) {  // Swipe to left (red)
                mainContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('#ff0000', 'white')
            }
            else {
                mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('white', '#ff0000')
            }
        }
    }

    function touchEndHandler(e: TouchEvent) {
        if (startX === null || startY === null) return;

        changeHeartColour('white', '#43ff65');
        changeCrossColour('white', '#ff0000')

        const endX: number = e.changedTouches[0].clientX;
        const endY: number = e.changedTouches[0].clientY;

        const diffX: number = endX - startX;
        const diffY: number = endY - startY;

        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe)
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) {  // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats);
            } else if (diffY > swipe_NewCat_threshold) {  // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats);
            }
        }
        else {
            if (diffX > swipe_NewCat_threshold) {  // Swiped right (like)
                console.log('Liked the cat');
                cats_like.push(cats[currIdx]);
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            else if (diffX < -swipe_NewCat_threshold) {  // Swiped left (dislike)
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

                    console.log(`index:${currIdx}`, cats_like[currIdx]);
                    showCat(cats_like[currIdx]);
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
function summaryDragListener(img: HTMLImageElement) {
    let startX: number | null = null;
    let startY: number | null = null;
    let swipe_NewCat_threshold: number = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    let isVerticalSwipe: boolean | null = null;

    function mouseDownHandler(e: MouseEvent) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    function mouseMoveHandler(e: MouseEvent) {
        if (startX === null || startY === null) return;

        const currentX: number = e.clientX;
        const currentY: number = e.clientY;

        const diffX: number = currentX - startX;
        const diffY: number = currentY - startY;

        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            } else {
                isVerticalSwipe = false;
            }
        }

        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = `translate(0, ${diffY}px)`;
        }
    }

    function mouseUpHandler(e: MouseEvent) {
        if (startY === null) return;

        const endY: number = e.clientY;
        const diffY: number = endY - startY;

        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe)
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) {  // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats_like);
            } else if (diffY > swipe_NewCat_threshold) {  // Swiped down
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
function reviewDragListener(img: HTMLImageElement) {
    let startX: number | null = null;
    let startY: number | null = null;
    let swipe_NewCat_threshold: number = window.innerWidth * 0.1; // Min vw to count as swipe for next/prev cat action
    let isVerticalSwipe: boolean | null = null;

    function mouseDownHandler(e: MouseEvent) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    function mouseMoveHandler(e: MouseEvent) {
        if (startX === null || startY === null) return;

        const currentX: number = e.clientX;
        const currentY: number = e.clientY;

        const diffX: number = currentX - startX;
        const diffY: number = currentY - startY;

        // Check if vertical swipe and lock to direction of swipe
        if (isVerticalSwipe === null) {
            if (Math.abs(diffX) < Math.abs(diffY)) {
                isVerticalSwipe = true;
            } else {
                isVerticalSwipe = false;
            }
        }

        // If swipe is vertical, move img vertically only
        if (isVerticalSwipe) {
            img.style.transform = `translate(0, ${diffY}px)`;
        } else {
            img.style.transform = `translate(${diffX}px, 0)`;

            if (diffX > swipe_NewCat_threshold) {  // Swipe to right (green)
                mainContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                changeHeartColour('#43ff65', 'white');
                changeCrossColour('white', '#ff0000')
            } else if (diffX < -swipe_NewCat_threshold) {  // Swipe to left (red)
                mainContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('#ff0000', 'white')
            }
            else {
                mainContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                changeHeartColour('white', '#43ff65');
                changeCrossColour('white', '#ff0000')
            }
        }
    }

    function mouseUpHandler(e: MouseEvent) {
        if (startX === null || startY === null) return;

        changeHeartColour('white', '#43ff65');
        changeCrossColour('white', '#ff0000')

        const endX: number = e.clientX;
        const endY: number = e.clientY;

        const diffX: number = endX - startX;
        const diffY: number = endY - startY;

        // Check if user mostly swipe vertically
        console.log('Vertical swipe:', isVerticalSwipe)
        if (isVerticalSwipe) {
            if (diffY < -swipe_NewCat_threshold) {  // Swiped up
                console.log('Swiped Up [Show next cat]');
                showNextCat(cats);
            } else if (diffY > swipe_NewCat_threshold) {  // Swiped down
                console.log('Swiped Down [Show prev cat]');
                showPrevCat(cats);
            }
        }
        else {
            if (diffX > swipe_NewCat_threshold) {  // Swiped right (like)
                console.log('Liked the cat');
                cats_like.push(cats[currIdx]);
                cats.splice(currIdx, 1);
                isReviewCurrCat = true;
            }
            else if (diffX < -swipe_NewCat_threshold) {  // Swiped left (dislike)
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

                    console.log(`index:${currIdx}`, cats_like[currIdx]);
                    showCat(cats_like[currIdx]);
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
fetchCats().catch(err => {
    console.error(err);
    descParagraph.innerHTML = 'Something Went Wrong';
});