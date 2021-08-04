const audioContext = new AudioContext();
const pressedNotes = new Map();
let clickedKey = "";


const getElementByNote = (note) =>
  note && document.querySelector(`[note="${note}"]`);

const calcPitch = (y) => {
  const A4 = 440;
  return A4 * Math.pow(2, y / 12);
}

const createKey = (noteAttr, note, offsetFromA4) => {
  return { 
    element: getElementByNote(noteAttr), 
    note: note, 
    pitch: calcPitch(offsetFromA4)
  }
}

const keys = {
  A: createKey("C", "C", -9),
  W: createKey("C#", "C#", -8),
  S: createKey("D", "D", -7),
  E: createKey("D#", "D#", -6),
  D: createKey("E", "E", -5),
  F: createKey("F", "F", -4),
  T: createKey("F#", "F#", -3),
  G: createKey("G", "G", -2),
  Y: createKey("G#", "G#", -1),
  H: createKey("A", "A", 0),
  U: createKey("A#", "A#", 1),
  J: createKey("B", "B", 2),
  K: createKey("C2", "C", 3),
  O: createKey("C#2", "C#", 4),
  L: createKey("D2", "D", 5),
  P: createKey("D#2", "D#", 6),
  semicolon: createKey("E2", "E", 7),
};

const createOscillator = () => {
  const osc = audioContext.createOscillator();
  const noteGainNode = audioContext.createGain();
  noteGainNode.connect(audioContext.destination);

  const zeroGain = 0.00001;
  const maxGain = 0.5;
  const sustainedGain = 0.001;

  noteGainNode.gain.value = zeroGain;

  const setAttack = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      maxGain,
      audioContext.currentTime + 0.01
    );
  const setDecay = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      sustainedGain,
      audioContext.currentTime + 1
    );
  const setRelease = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      zeroGain,
      audioContext.currentTime + 2
    );

  setAttack();
  setDecay();
  setRelease();

  osc.connect(noteGainNode);
  osc.type = "triangle";
  return osc;
}

const playKey = (key) => {
  const osc = createOscillator();
  osc.frequency.value = keys[key].pitch;

  keys[key].element.classList.add("pressed");

  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();
};

const stopKey = (key) => {
  keys[key].element.classList.remove("pressed");
  const osc = pressedNotes.get(key);

  if (osc) {
    setTimeout(() => {
      osc.stop();
    }, 2000);

    pressedNotes.delete(key);
  }
};

const getEventKey = (key) => {
  const eventKey = key.toUpperCase();
  return eventKey === ";" ? "semicolon" : eventKey;
}

document.addEventListener("keydown", (e) => {
  const key = getEventKey(e.key);
  
  if (!key || pressedNotes.get(key)) {
    return;
  }
  playKey(key);
});

document.addEventListener("keyup", (e) => {
  const key = getEventKey(e.key);
  stopKey(key);
});

for (const [key, { element }] of Object.entries(keys)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

document.addEventListener("mouseup", () => {
  stopKey(clickedKey);
});

function touchStarted() {
  getAudioContext().resume();
}
