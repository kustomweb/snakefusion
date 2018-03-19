# snakefusion
Port of CodeBullet's SnakeFusion AI from Java to Javascript

https://github.com/Code-Bullet/SnakeFusion

The original is written in Java, and since it is based on Processing, it was a natural to port it to Javascript.  I tried to stick to the original codebase as much as possible.  

It works great, except for the performance of the Fusion Snake, where I probably did something wrong.  The greatest thing about it is the ability to track the progression of the code via Chrome Debugger.

I added a "can't go backwards" step, which I recommend keeping "on", because it really makes the evolution work faster.

The graphing is still a bit sketchy, I will revisit showing the progression of the evolution of each species.

The data part of the project is accomplished asynchronously via Ajax and a couple of simple PHP script to read and write the data as json.
