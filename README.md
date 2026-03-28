## particle sandbox 🌌
a simple particle sandbox made using javascript.

## why and how? 🤔
this is a physics particle simulator that I am building, using Javascript!! I learned how to work with 2d canvas in Js while building this project. Adding collisions was quite hard but did it with the help of the resources in the internet and claude. Very happy to see how it turned out! My goal is to make it sth like mrdoob’s simulators which I used to be fascinated playing, a few years before.

## controls

- `LMB`: spawn particles

- `RMB`: create shockwave that repels particles

- `R`: restart simulation. start again with a blank canvas to get your creative juices flowing again ;)

#### modes
- `Tutorial (s)`: shows an interactive tutorial of this simulator in the center of the screen.

- `Black hole (b)`: pulls all the particles into the mouse pointer (black hole)

- `Trail (t)`: shows trails of each and every particle, more trails = more chaos

- `Merge (m)`: merges particles which have similar color into a larger particle with a different color

- `Gravity flip (g)`: flips the gravity of the game, apples need not fall downwards ;)

- `Zero Gravity (z)`: set the gravity of the game to zero. 

- `Lines (l)`: shows lines connecting neighbouring particles

- `Bubbles (n)`: particles become bubbles and you get to pop them

- `Orbit (o)`: mouse pointer is the sun and everything revolves around it.

- `Cyclone (c)`: create cyclones on the screen, particles revolve around it.

- `Explosion (e)`: press and hold on particles to get them exploding!!! BOOOM!

#### sliders

|slider name|function|
|-----------|--------|
|gravity|change the gravity of the game|
|friction|change the friction between particles|
|spawn|sets the number of particles to spawn|
|size|sets the upper limit for size of particles to spawn|

#### others [ UI buttons]
- `spawn`: this button in the bottom-right corner of the screen lets you spawn particles when clicked
- `🎲` (dice button): this button sitting just above the `spawn` button, when clicked, turns on a few modes randomly and lets you experience chaos in god mode. 

## img preview
<img width="1366" height="660" alt="image" src="https://github.com/user-attachments/assets/62e07fee-f9c5-4241-8e27-4df1a96ef2b0" />
<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/318c7c1e-c228-412d-bde0-e16014e52713" />

## changelogs 🛠

### [1.0.4]

#### code
- i have finally refactored the code. took a while to do this cause everything was jumbled in the same file. finally, the project files are getting a good structure. i have made a new `js` folder which comprises all the js code in it. the `script.js` has been broken down into 6 js files. 

| file      | what does it store?   |
|-----------|-----------------------|
| globals.js     | all the state variables, constants and the main canvas setup |
| particles.js       | functions related to create,update,draw and collide particles |
| modes.js   | handels all the modes and their functions |
| ui.js   | UI handler -> panel,toast,popup,mouse/keyboard events and dice handler.|
| stories   | stories array and its functions|
| main.js   | main loop() call |

- the friction slider was wrong all this time. there was a simple logical error in the code. fixed it.

- add new keybinding. `R` -> it restarts the simulation. if you are bored with your current simulation or you messed up something, you can press `R` and a new blank canvas will appear for you to get your creative juices flowing again.

#### ui

- add new color palette system. i have introduced 5 color palettes (default/rainbow, ice, fire, neon and mono). there is a section in the UI panel for color palettes. when select a palette, the particles spawned after selecting the palette will use the new color palette. i hope they will add more fun to the gameplay.

#### bug 🐛 fixes
- cyclone mode has been fixed. in the previous version, the particles that get into the cyclone mode were being kicked out as soon as they enter the cyclone. they were thrown out tangentially from the cyclone. a voter pointed this out in the feedbacks so I have fixed it in this update. now, the particles that get into the cyclone revolve around it continuously.


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

