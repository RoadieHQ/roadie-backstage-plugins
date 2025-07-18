/*
 * Copyright 2024 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TypeAnimation } from 'react-type-animation';
import { Container } from '@material-ui/core';

const msgs = [
  'Reticulating splines...',
  'Swapping time and space...',
  'Spinning violently around the y-axis...',
  'Tokenizing real life...',
  'Bending the spoon...',
  '640K ought to be enough for anybody',
  'The bits are breeding',
  '...and enjoy the elevator music...',
  'Please wait while the little elves draw your map',
  "Don't worry - a few bits tried to escape, but we caught them",
  'Go ahead -- hold your breath!',
  "...at least you're not on hold...",
  'Hum something loud while others stare',
  'Please wait while a larger software vendor in Seattle does the job for you',
  'While the satellite moves into position',
  'The bits are flowing slowly today',
  'My other loading screen is much faster.',
  'Reconfoobling energymotron...',
  'Just count to 10',
  'Counting backwards from Infinity',
  'Embiggening Prototypes',
  'Creating time-loop inversion field',
  'Spinning the wheel of fortune...',
  'Computing chance of success',
  'Adjusting flux capacitor...',
  "Let's take a mindfulness minute...",
  "Keeping all the 1's and removing all the 0's...",
  "Making sure all the i's have dots...",
  'Spinning the hamster…',
  'Convincing AI not to turn evil..',
  'Constructing additional pylons...',
  'Roping some seaturtles...',
  'Dividing by zero...',
  'Cracking military-grade encryption...',
  'Simulating traveling salesman...',
  'Proving P=NP...',
  'Entangling superstrings...',
  'Twiddling thumbs...',
  'Searching for plot device...',
  'Trying to sort in O(n)...',
  'Kindly hold on as our intern quits vim...',
  'Ordering 1s and 0s...',
  'Please wait... Consulting the manual...',
  'Downloading more RAM..',
  'Updating to Windows Vista...',
  'Initializing the initializer...',
  'Optimizing the optimizer...',
  'Running swag sticker detection...',
  'Pushing pixels...',
  'Updating Updater...',
  'Downloading Downloader...',
  'Debugging Debugger...',
  'TODO: Insert elevator music',
  'Grabbing extra minions',
  'Doing the heavy lifting',
  'Waking up the minions',
  'Our premium plan is faster',
  'Feeding unicorns...',
  'Reversing the shield polarity',
  'Disrupting warp fields with an inverse graviton burst',
  'One mississippi, two mississippi...',
  'Baking ice cream...',
];
const generateSequence = () => {
  return msgs
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .flatMap(msg => {
      return [msg, 500];
    });
};

export const Thinking = () => {
  return (
    <Container>
      <TypeAnimation
        style={{
          fontSize: '1.3em',
          display: 'inline-block',
          textAlign: 'center',
        }}
        sequence={generateSequence()}
        wrapper="span"
        speed={72}
        repeat={Infinity}
      />
    </Container>
  );
};
