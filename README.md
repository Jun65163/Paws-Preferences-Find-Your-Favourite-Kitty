# Paws Preferences: Find Your Favourite Kitty
Tinder-like app where user swipe to like or dislike cat pictures. After 10 cats are reviewed by the user, a summary containing number of liked cats and their pictures are shown to the user.

## Main Features
1. A single-page web application where users can view a stack of cat images.
2. Users can swipe right to indicate “like” and swipe left to indicate “dislike”.
3. Once the user has gone through all the cats, show a summary of how many cats they liked and display the ones they liked.
4. The cat pictures are sourced from Cataas (https://cataas.com/).
5. The interface works smoothly on mobile devices, with focus on an intuitive and pleasant mobile viewing experience.

_Note: A fixed number of cat pictures (10) was assumed for this project._

## Added Functionality
1. Users can swipe up to view the next cat picture or down to view previous cat picture.
    - Allow users to look through all 10 cat pictures freely before reviewing each of them.

2. Liked or disliked cat pictures will not be viewed again by the user during cat picture review ("liking" and "disliking" cat pictures)
    - Allows the user to focus on cat pictures that are not "liked" or "disliked" yet.
  
3. Circular scrolling (infinite scrolling) through a stack of cat pictures.
    - Allows the user to scroll through cat pictures with less effort (the user can swipe up or down continuously to view all cat pictures).

4. Automatically move to the next cat picture for the user to view after the user "liked" or "disliked" the current cat picture.
    - Decrease effort nedded for the user to move to the next cat picture.

## User Manual
### Mobile
- Swipe the cat picture right to "like" and left to "dislike".
- Swipe the current cat picture up to view next cat picture and down to view previous cat picture.

### Desktop/PC
- Drag the cat picture right to "like" and left to "dislike".
- Drag the current cat picture up to view next cat picture and down to view previous cat picture.

## Tech Choice
1. HTML
    - Core language for structuring web contents.
2. TypeScript
    - Was used over JavaScript because it has stronger type system than JavaScript. It catches type errors before the code was ran, making it more reliable than JavaScript.
3. Sass
    - Was used over CSS because it allows better organisation and convenience. In this project, Sass' variables and nesting was widely used for styling contents.

## UI/UX Design
- Cat picture covers most of the screen, allowing better viewing for the user.
- Presence of "like" and "dislike" icons increases the intuitiveness of "liking" and "disliking" cat pictures, guiding the user to perform their intended actions.
- Change in background after "liking" and "disliking" 10 cat pictures allows the user to understand the end of cat picture review.
- Number of cat pictures liked was displayed on top of the screen to emphasize the information

## Animations
- Dynamic change in background and icon colour (with respect to user horizontal swipe action) further empahsizes user action for "liking" and "disliking", allowing the user to confirm their intended action before finalizing it.
- Current cat picture follows the swipe direction with minor transitional delay, increasing responsiveness and natural feel of the action.

## Additional Notes:
- The JavaScript and CSS file were compiled from TypeScript and Sass respectively.
- The svg files found in this repository were referenced to create the "like" and "dislike" icons.
