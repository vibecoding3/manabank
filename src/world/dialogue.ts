/** Static dialogue scripts. A future quest system can pick scripts by quest state instead of booleans. */
export const ELDER = {
  name: 'Elder Moss',
  intro: [
    'Ah, a new apprentice of the Manabank. Welcome to Fernvale.',
    'Every spell in this valley runs on borrowed mana... and the Bank always collects.',
    'But first, a simpler task. A mana-gorged slime is terrorizing the eastern meadow.',
    'Follow the road east and drive it off. Strike with SPACE or J.',
  ],
  reminder: ['The slime lurks in the eastern meadow, along the road. Mind its bite.'],
  victory: [
    'You did it! I felt the stolen mana scatter back into the soil.',
    'Soon you will learn to borrow power of your own. Just remember: every debt comes due.',
  ],
  after: ['Rest a while, apprentice. Fernvale is safe... for now.'],
};
