## particle sandbox 🌌
a simple particle sandbox made using javascript.



## why and how? 🤔
This is a physics particle simulator that I am building, using Javascript!! I learned how to work with 2d canvas in Js while building this project. Adding collisions was quite hard but did it with the help of the resources in the internet and claude. Very happy to see how it turned out! My goal is to make it sth like mrdoob’s simulators which I used to be fascinated playing, a few years before.

## controls

- Left click: spawn particles

- Right click: create shockwave that repels particles

- Story mode (s): shows the storyline of this simulator in the center of the screen

- Black hole (b): pulls all the particles into the mouse pointer (black hole)

- Trail (t): shows trails of each and every particle, more trails = more chaos

- Merge (m): merges particles which have similar color into a larger particle with a different color

- Gravity flip (g): flips the gravity of the game, apples need not fall downwards ;)

- Lines (l): shows lines connecting neighbouring particles


## img preview
<img width="1366" height="660" alt="image" src="https://github.com/user-attachments/assets/62e07fee-f9c5-4241-8e27-4df1a96ef2b0" />
<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/318c7c1e-c228-412d-bde0-e16014e52713" />

## changelogs 🛠

### [1.0.3]

#### new modes
- orbit mode (o) -> particles orbit around the cursor as if they were planets and the mouse cursor behaves like the sun 🌞. it was fun to build. making sure the particles are always revolving around the orbit required a bit of physickks formulas and concepts though.
- cyclone mode (c) -> cyclones can be placed on screen (max 5) by right clicking, particles near the cyclone spin around it continuously. pressing DEL clears all the cyclones.
- explosion mode (e) -> click for a while on the particles and release it to make them explode. the longer you wait before releasing, the bigger it blasts.

#### ui rework
- the normie mode indicators in the panel have been replaced by a grid of clickable boxes with big letters representing the key of the mode. looks impressiveee
- added a dice button which turns of a few modes randomly forming new chaos combinations
- added a spawn button which spawns particles when clicked -> it was required for modes like blackhole, interact, and more in which left click was occupied by the major feature of the mode so needed an alternative method to spawn particles.
- added a newspaper-ad like badge in the top right which shows the latest updates.

### 🐛🐛🐛
and a lot of bug fixes 

### [1.0.2]
#### new modes
- zero gravity mode (Z) - particles float freely in space
- bubble mode (N) - particles transform into floating bubbles with a glassy shine effect. hovering over a bubble pops it and splits it into 2 smaller bubbles.

#### UI
- add toast notifications for all mode toggles
- reset buttons added to all 4 sliders (as per the request of a voter)
- toast colors have been fixed -> fully visible against the colorful particles

#### story mode -> TUTORIAL MODE
- story mode i.e. tutorial now walks you through this simulation interactively.
- yesss, finally. story mode has been renamed into "tutorial mode". *(self-explanatory, ig)*

#### improved black hole *(on the request of a voter)*
- stronger pull force
- particles now spiral inward with swirl physics *(was kinda tough to implement)*
- cursor is hidden when black hole is active — only the black hole effect is visible

#### performance improvements (most requested in previous ship)
- replace the previous collision detection O(n^2) with a spatial grid system ( took a lot of time implementing this system)
- line mode also uses spatial grid now
- particle cap at 420 to prevent browser crashes ;)


### [1.0.1]

- [x] Black hole mode i.e. mouse cursor -> black hole ;)
- [x] Trail effect on particles
- [x] Story mode - show quotes in the center of the screen
- [x] Merge particles when collide and form larger particles
- [x] Gravity flip mode (apples need not fall downwards) 🍎
- [x] Line mode (show line between particles)
- [ ] Improve performance

### [1.0.0]

- [x] Particles spawn, repulse and collide
- [x] Toggle particle properties using sliders
- [x] Implemented core features
