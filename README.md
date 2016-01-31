# node-rrtpmonitor
Check the current ComEd RRTP Rate and trigger an event in IFTTT.

This routine will fire a Maker trigger whenever the RRTP rate threshold changes (this way you're not getting constant events firing).

The triggered event `rrtp` includes 3 variables:

1. Threshold name
2. Current Hourly Average RRTP price
3. Threshold color

## Installation
As this isn't properly packaged up in NPM yet, simply copy these files into any folder.
You will need to use NPM to install Resilient which is a declared dependency for this package.

## Configuration
At a minimum, modify the `config.json` to put in your [IFTTT](https://ifttt.com) [Maker Channel](https://ifttt.com/maker) key.  You can, if you wish, also change the event name (currently set as `rrtp` in the `maker.path`.

You may need to edit the first line of `rrtpmonitor.js` in order to set the path for 'node'.

You can also feel free to adjust the `thresholds`, be sure to keep them in low-to-high value order, otherwise, the code will not work as expected.

At runtime, the rrtpmonitor will expect to be running in the same folder as it's installed (as I'm using relative path for the `config.json`), and will need read/write access to the file/folder that is set for `lastThresholdFileName'.

There should only be console output when there's a problem.

## Runtime
I've installed it as a crontab job on my Raspberry Pi B+ 2, that runs every 5 minutes.
