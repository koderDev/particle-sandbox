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

- `Tilt`: *ONLY FOR MOBILE PHONES*.. tilting your device makes the particles move here n there. *(this has been added on the request of a voter. )*

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

- `Repel (x)`: particles are repelled by the mouse pointer. they try to run away as much as they can...

- `Disco (d)`: particles change their colors like there's no tomorrow. its the time to disco woo hoooo!! 

- `slither(p):` particles slither and wiggle around the screen as if they've been reptilified..!!sssssssssssss...


#### sliders

|slider name|function|
|-----------|--------|
|gravity|change the gravity of the game|
|friction|change the friction between particles|
|spawn|sets the number of particles to spawn|
|size|sets the upper limit for size of particles to spawn|

#### others [ UI buttons]
- `restart`: (only shown in mobile phones) for restarting the simulation
- `spawn`: this button in the bottom-right corner of the screen lets you spawn particles when clicked
- `🎲` (dice button): this button sitting just above the `spawn` button, when clicked, turns on a few modes randomly and lets you experience chaos in god mode. 

## img preview
<img width="1366" height="660" alt="image" src="https://github.com/user-attachments/assets/62e07fee-f9c5-4241-8e27-4df1a96ef2b0" />
<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/318c7c1e-c228-412d-bde0-e16014e52713" />


## Optimization 

i have optimized this sandbox to handle hundreds of particles at 60fps. the techniques of optimization that have been used in this project are:

#### spatial grid partitioning [ O(n^2) -> O(n)]

-the problem was that, in the previous version (v1.0.0), every particle checked every other particle for collisions which lead to the game being slowed down a lot when new particles were added. 
- to solve it, i have implemented a special hash grid. it divides the canvas into a lot of cells. each particle only checkes for collisions with neighbors in its own or neighboring cells. this brough the time complexity down to nearly linear, which allowed more particles to be spawned with smooth gameplay. :)
- also, in grid systems, particles in a cell generally dont see the other particles in another cell even if they are right across each other but in this sandbox, i have implemented 3x3 neighbor search so that it checks all surrounding cells i.e. 8 cells.


#### object pooling 
- the spawned particles have to be destroyed in some modes like explosion, blackhole and bubble mode. this constant creating and destroying of objects for particles cause GC spikes which lead to micropauses and stutters hindering the gameplay exp.
- to fix this i implemented a particle pool which recycles the particles instead of deleting them and reinitializes them when needed. this made those modes quite smoother than before.

#### Line mode caching
- in the previous version, the loop actually checked if particles are close and drew lines between them. This caused the `ctx.stroke()` function to be called 2 times for every single connection and required caching to solve. for 100 particles it called 200 draw calls.
- to fix this i used a bitwise pair key which checked for existing pair of lines and will skip the second draw. this means the cpu usage is reduced by 50% for the lines. that is A LOTT. 


### [FPS] - can be checked at the bottom left of the screen

##### LINE MODE
considered line mode cause it is the most demanding one, as it has to draw lines connecting each n every neighboring particle.

| no. of particles | before spatial grid system (fps) | after spatial grid system (fps) | after line mode caching (fps) *LATEST* |
| -------- | -------- | -------- | -------- |
| 100 | ~40 | ~60 | ~60 | 
| 200 | ~8 | ~45 | ~60 |
| 300 | ~2 | ~25 | ~45 |
| 400 | DEAD | ~20 | ~30 |

*these performance checks were done in a i3 8GB RAM laptop, the code used to check the fps can be found in the `main.js` file.*

## changelogs 🛠

### [1.0.7]

- spent a lot of time on optimization. more about it in the optimization section of this readme.md file
- now you can see fps count on bottom left on your screen, i have tried my best to keep it on the higher end even in high demanidng modes like the line mode and trace mode.
- skip the tutorial prompt was being asked even when the tutorial was turned off, fixed that.

### new mode: tilt mode [only for mobile phones]
- finally added tilt mode which moves the particles here n there based on the tilt of the device. i have made it so that this works only on mobile phones. it basically enables device tilt control (works magically for non-ios devices. i have added motion permission request for ios devices, hope it works). then it reads the acceleration and changes the graviy of the game based on the acceleration. this is just a try to make the game more interactive on mobile phones. it moves particles based on the phone movement when tilt mode is on.
- it is on by default. it turns on after a few seconds when you click the screen, then the real fun beginsss!!!
- you can turn it off from the panel window.
- i have tried to make it as smooth as possible by adjusting the scale of the gravity change in proportion with the tilt acceleration of the device. hope it works man!!

### [1.0.6]

MOBILE RESPONSIVENESS ADDED :D

#### changes
- yayy i have finally made this game mobile responsive. yep. you've heard it right, it works perfectly in mobile phones. i have attached a demo video to this devlog showcasing how it works in phones.this was the most asked feature to add, so i had to add it. 
- also, i have added a slider which lets you select maximum particles based on your choice. the particles max threshold is not limited now. its upto you. *asked by a voter*
- panels are not toggelable. i mean, you can toggle to hide and unhide the panels now. more screen territory, more fun i guess.
- added a refresh button too which refreshes the game.
- story mode is a bit shortened cause a voter asked for it.
- in mobile phones, game only works in landscape view so that makes it more fun i guess. story mode, explosion mode and cyclone mode are not available in mobile phone cause i had some issues implementing them ( sometimes u may get cyclone mode using the dice but u cant rlly add new cyclones as im confused about implementing it in mobile ) so will do it in next versions.


### [1.0.5]

#### new mode
- slither mode (p): in this mode, the particles tend to wiggle and slither around the screen. i have tried my best to make it look as much spontaneous as i can. it still is not that much spontaneous and you can see patterns on it but still, i guess its quite fun. this mode is best when played with 0 gravity mode turned on. also, when disco mode is turned along with these, you will get to see a whole new dimension heheehe. *did not find any other key so made it p.* 
#### CHALLENGESSSS
- challenges have been introduced in this update. a popup shows in the game after a few seconds of starting, to ask the user if they want to opt in for the challenges and if they choose yes then they better be ready for a fun challenges. *sadly, i have not come up with fun challenges yet though, the current challenges quite simple actually.*
- there is a separate UI style for the challenge mode which includes a thick yellow border around the screen with the challenge info menu at the top and time ticking fast. 
- if the user wins the challenge, they are greeted with fun msges but if they lose then they may be roasted a bit.
- challenges are continuous, they donot stop. they keep coming one after another. for now, i have onl made 5 challenges so after all these finish, they will circulate again randomly. but it will not happen in future versions, im thinking to make it so that the user gets some kind of achevement like thing if they finish all challenges. not sure how i would implement it though.

- for future updates, i want to make sure the challenge info is shown even when the panel is closed, in the top left corner of the screen along with other infos.

### [1.0.4]

#### new mode
- repel (x): the mouse pointer changes to a no entry sign like symbol and all the particles are repelled by the mouse pointer. they try to escape and run away from the mouse pointer as much as they can.

- disco (d): in this mode, the particles change their color continuously (every 0.8s fyi). also added an epilepsy warning before the starting of this mode so that it doesnot cause any harm to anyone *[ it was suggested by a voter in the previous updates ].*

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

#### new keybinding. 

- `R` -> it restarts the simulation. if you are bored with your current simulation or you messed up something, you can press `R` and a new blank canvas will appear for you to get your creative juices flowing again.

- `H` -> it hides the panel. allows more space to have fun with. when the panel is hidden, it shows a small text in the top left corner of the screen which gives info about the major shortcuts like toggle panel(h), restart(r), screenshot(q), etc

- `Q` -> screenshot. it snaps a pic of the current simulation you are doing. it ignores all the UI elements and shows your particles and their fun behaviors only. it took a bit too long to add this but finally it has been added. yay!


#### ui

- add new color palette system. i have introduced 5 color palettes (default/rainbow, ice, fire, neon and mono). there is a section in the UI panel for color palettes. color of all the particles will change to the selected palette on selecting it.
- the game now shows achievement toasts when particle count has reached to certain levels, e.g. when the user make 50, 100, etc. number of particles.
-improve the panel UI and add new space for 2 more modes.
- add simple, but fun, animations on the dice and camera button in the screen. (dice is for random mode generator and camera is for snapping a quick screenshot.) used css keyframes animation for this.
- change the new update badge to CHANGELOGS button which redirects to github repo readme link.
- show an epilepsy warning window when disco mode is turned on. 
- the pcount text changes its colors based on the number of particles ( more towards shades of red if the count is high enough). these colors show for 3 seconds only. sth that needs fixing in the next update (hopefully), is that the pcount text changes color only for the 1st time they reach the number of partciles, after that the pcount text doesnot change color. so yeah, needs some fixinnn.


#### bug 🐛 fixes
- cyclone mode has been fixed. in the previous version, the particles that get into the cyclone mode were being kicked out as soon as they enter the cyclone. they were thrown out tangentially from the cyclone. a voter pointed this out in the feedbacks so I have fixed it in this update. now, the particles that get into the cyclone revolve around it continuously.
- explosion mode was causing particles to have organish color and it took a while fixing it. now, the neighboring particles change their color based on the current palette.
- cursor was being hidden in the dice mode, this issue has been fixed simply by doing `cursor: default` inside the rollDice() function.
- disco mode was causing issues with the mono colorscheme so had to disable disco mode when mono is selected, to save performance and fix some bugs. similar issue were found with bubble mode and disco mode so disabled disco mode when bubble is turned on.

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
- change the new update badge to CHANGELOGS button which redirects to github repo readme link.


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
