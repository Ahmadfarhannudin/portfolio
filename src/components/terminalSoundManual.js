// ============================================================
// terminalSoundManual.js
// Mechanical Keyboard Sound
// Manual PCM WAV generation
// NO Web Audio API
// ============================================================


// ============================================================
// WAV GENERATOR
// ============================================================

function createWavDataUri(
  generator,
  durationSec = 0.065,
  sampleRate = 44100
) {
  const numSamples = Math.floor(durationSec * sampleRate);

  const totalBytes = 44 + numSamples * 2;

  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(
        offset + i,
        string.charCodeAt(i)
      );
    }
  };


  // ==========================================================
  // RIFF HEADER
  // ==========================================================

  writeString(0, "RIFF");

  view.setUint32(
    4,
    36 + numSamples * 2,
    true
  );

  writeString(8, "WAVE");


  // ==========================================================
  // FORMAT CHUNK
  // ==========================================================

  writeString(12, "fmt ");

  // PCM chunk size
  view.setUint32(
    16,
    16,
    true
  );

  // Audio format: PCM
  view.setUint16(
    20,
    1,
    true
  );

  // Mono
  view.setUint16(
    22,
    1,
    true
  );

  // Sample rate
  view.setUint32(
    24,
    sampleRate,
    true
  );

  // Byte rate
  view.setUint32(
    28,
    sampleRate * 2,
    true
  );

  // Block align
  view.setUint16(
    32,
    2,
    true
  );

  // Bits per sample
  view.setUint16(
    34,
    16,
    true
  );


  // ==========================================================
  // DATA CHUNK
  // ==========================================================

  writeString(36, "data");

  view.setUint32(
    40,
    numSamples * 2,
    true
  );


  // ==========================================================
  // PCM SAMPLE GENERATION
  // ==========================================================

  for (let i = 0; i < numSamples; i++) {

    const t = i / sampleRate;

    const sample =
      generator(
        t,
        i,
        numSamples
      );

    const clamped =
      Math.max(
        -1,
        Math.min(1, sample)
      );

    const value =
      clamped < 0
        ? Math.floor(clamped * 32768)
        : Math.floor(clamped * 32767);

    view.setInt16(
      44 + i * 2,
      value,
      true
    );
  }


  // ==========================================================
  // ARRAY BUFFER → BASE64
  // ==========================================================

  let binary = "";

  const bytes =
    new Uint8Array(buffer);

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(
      bytes[i]
    );
  }

  return (
    "data:audio/wav;base64," +
    btoa(binary)
  );
}



// ============================================================
// DETERMINISTIC NOISE
// ============================================================
//
// Tidak menggunakan Math.random().
// Jadi hasil suara stabil setiap kali website dibuat.
//
// ============================================================

function noise(seed) {

  const x =
    Math.sin(
      seed * 12.9898
    ) * 43758.5453;

  return (
    (x - Math.floor(x)) * 2 - 1
  );
}



// ============================================================
// KEYBOARD CLICK
// ============================================================
//
// Karakter suara:
//
//  - sharp click
//  - mechanical clack
//  - high frequency transient
//  - sedikit low-mid body
//  - short resonance
//
// Target:
// suara keyboard mekanikal / terminal typing
//
// ============================================================

function createKeyboardClick(
  seed = 1
) {

  let previousNoise = 0;


  return createWavDataUri(
    (t, i) => {


      // ======================================================
      // 1. SHARP INITIAL TRANSIENT
      // ======================================================
      //
      // Bunyi "tak" ketika keycap pertama menyentuh switch.
      //

      const transientEnvelope =
        Math.exp(
          -t * 180
        );

      const transient =
        Math.sin(
          2 *
            Math.PI *
            (
              2800 +
              Math.sin(t * 9000) * 500
            ) *
            t
        ) *
        transientEnvelope *
        0.48;



      // ======================================================
      // 2. HIGH FREQUENCY CLACK
      // ======================================================
      //
      // Memberikan karakter "click/clack".
      //

      const highEnvelope =
        Math.exp(
          -t * 115
        );

      const rawNoise =
        noise(
          i + seed * 7919
        );

      // High-pass sederhana
      const highNoise =
        rawNoise -
        previousNoise;

      previousNoise =
        rawNoise;

      const clickNoise =
        highNoise *
        highEnvelope *
        0.32;



      // ======================================================
      // 3. MECHANICAL BODY
      // ======================================================
      //
      // Body dari tombol.
      //

      const bodyEnvelope =
        Math.exp(
          -t * 70
        );

      const bodyFrequency =
        650 +
        seed * 55;

      const mechanicalBody =
        Math.sin(
          2 *
            Math.PI *
            bodyFrequency *
            t
        ) *
        bodyEnvelope *
        0.20;



      // ======================================================
      // 4. LOW-MID THUMP
      // ======================================================
      //
      // Membuat suara terasa lebih "fisik".
      //

      const thumpEnvelope =
        Math.exp(
          -t * 95
        );

      const thump =
        Math.sin(
          2 *
            Math.PI *
            (
              145 +
              seed * 12
            ) *
            t
        ) *
        thumpEnvelope *
        0.13;



      // ======================================================
      // 5. SHORT RESONANCE
      // ======================================================
      //
      // Sedikit resonansi dari keycap.
      //

      const resonanceEnvelope =
        Math.exp(
          -t * 85
        );

      const resonance =
        Math.sin(
          2 *
            Math.PI *
            (
              1850 +
              seed * 120
            ) *
            t
        ) *
        resonanceEnvelope *
        0.16;



      // ======================================================
      // 6. VERY SHORT ATTACK SPIKE
      // ======================================================
      //
      // Memberikan "snap" di awal suara.
      //

      const spikeEnvelope =
        Math.exp(
          -t * 420
        );

      const spike =
        Math.sin(
          2 *
            Math.PI *
            (
              4200 +
              seed * 180
            ) *
            t
        ) *
        spikeEnvelope *
        0.20;



      // ======================================================
      // MIX ALL COMPONENTS
      // ======================================================

      let output =
        transient +
        clickNoise +
        mechanicalBody +
        thump +
        resonance +
        spike;



      // ======================================================
      // SOFT SATURATION
      // ======================================================
      //
      // Supaya tidak terlalu terdengar digital.
      //

      output =
        Math.tanh(
          output * 1.15
        );


      // Overall volume

      return output * 0.72;
    },

    // Duration
    0.065,

    // Sample rate
    44100
  );
}



// ============================================================
// KEYBOARD SOUND VARIATIONS
// ============================================================
//
// 6 variasi supaya setiap ketikan tidak terdengar identik.
//
// ============================================================

export const clickWavUris = [

  createKeyboardClick(1),

  createKeyboardClick(2),

  createKeyboardClick(3),

  createKeyboardClick(4),

  createKeyboardClick(5),

  createKeyboardClick(6),

];



// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================
//
// Kalau ada file lain yang masih menggunakan:
//
// import { clickWavUri }
//
// tetap tidak error.
//
// ============================================================

export const clickWavUri =
  clickWavUris[0];



// ============================================================
// SUCCESS CHIME
// ============================================================

export const successWavUri =
  createWavDataUri(
    (t) => {

      const notes = [
        523.25,
        659.25,
        783.99
      ];

      let value = 0;


      notes.forEach(
        (freq, index) => {

          const startTime =
            index * 0.08;


          if (t >= startTime) {

            const dt =
              t - startTime;


            const envelope =
              Math.exp(
                -dt * 8
              );


            value +=
              Math.sin(
                2 *
                  Math.PI *
                  freq *
                  dt
              ) *
              envelope *
              0.35;
          }
        }
      );


      return value;
    },

    // Duration
    0.35,

    // Sample rate
    44100
  );