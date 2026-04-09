<template>
  <div class="artemis-play-input">
    <v-btn
      class="artemis-play"
      :icon="play ? 'mdi-pause' : 'mdi-play'"
      color="#ffa000"
      variant="tonal"
      density="comfortable"
      @click="play = !play"
    />
    <div class="artemis-tracker">
      <div class="artemis-labels">
        <span class="left-time">{{ formatDate(MISSION_START) }}</span>
        <span class="current-time">{{ formatDate(currentTime) }}</span>
        <span class="right-time">{{ formatDate(MISSION_END) }}</span>
      </div>
      <input
        type="range"
        class="time-slider"
        :min="MISSION_START.getTime()"
        :max="MISSION_END.getTime()"
        :step="STEP_MS"
        :value="currentTime.getTime()"
        @input="onSliderInput"
      />
    </div>
    <div class="artemis-rate">
      <!-- {{ rates[0][0] }} -->
      <label>Speed:
        <select v-model="rate">
          <option 
            v-for="[label, value] in rates" 
            :key="value" 
            :value="value"
          >
            {{ label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { SpaceTimeController } from "@wwtelescope/engine";

interface Props {
  canCreate: boolean;
  initialTime: Date;
}

const props = defineProps<Props>();
  
const currentTime = defineModel<Date>('time', {default: new Date()});
SpaceTimeController.set_now(props.initialTime);
console.log(currentTime.value, props.initialTime);
watch(currentTime, (date) => {
  SpaceTimeController.set_now(date);
});

function applyTime(date: Date) {
  currentTime.value = date;
}

function onSliderInput(e: Event) {
  applyTime(new Date(parseInt((e.target as HTMLInputElement).value)));
}




const MISSION_START = new Date("2026-04-02T01:58:32Z");
const MISSION_END   = new Date("2026-04-10T23:54:30Z");
const STEP_MS       = 5 * 60 * 1000;

const INITIAL_TIME = props.initialTime; //new Date("2026-04-06T22:32:00Z");

// const currentTime = ref(INITIAL_TIME);

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, {
    month: "short", 
    day: "numeric",
    hour: "2-digit", 
    minute: "2-digit",
    timeZoneName: "short",
  });
}




watch(
  () => props.canCreate,
  (canCreate) => {
    if (canCreate) {
      applyTime(MISSION_START);
      applyTime(INITIAL_TIME);
    }
  },
  { immediate: true },
);



const PLAY_INTERVAL_MS = 5;

// step ms to advance per tick given desired playback speed
function stepMs(daysPerSecond: number): number {
  let realStep = daysPerSecond * 24 * 60 * 60 * 1000 * PLAY_INTERVAL_MS / 1000;
  realStep =  realStep + (realStep % STEP_MS); // round to nearest step
  return realStep;
}
const rates = [
  ['2 hr/sec', stepMs(1/24)],
  ['~1.5 days/sec', stepMs(35/24)],
  ['~3 days/sec', stepMs(3)],
] as const;

const rate = ref(rates[1][1]);

let interval: number | null = null;
function setupInterval(stepMs: number) {
  if (play.value) {
    interval = setInterval(() => {
      const newTime = new Date(currentTime.value.getTime() + stepMs);
      if (newTime > MISSION_END) {
        applyTime(MISSION_START);
        return;
      }
      applyTime(newTime);
    }, PLAY_INTERVAL_MS);
  }
}

watch(rate, (newRate) => {
  console.log("Rate changed to", newRate);
  if (play.value) {
    if (interval) {
      clearInterval(interval);
    }
    setupInterval(newRate);
  }
}); 

const play = ref(false);
watch(play, (isPlaying) => {
  if (isPlaying) {
    if (!interval) {
      setupInterval(rate.value);
    }
  } else {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
});

</script>

<style scoped>

.artemis-play-input {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 0.5rem 1rem;
}

.artemis-play {
  grid-area: 1 / 1 / 3 / 2;
  pointer-events: auto;
}

.artemis-tracker {
  grid-area: 1 / 2 / 2 / 3;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 600px;
  color: #fff;
  font-size: 0.78rem;
}

.artemis-labels {
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
  gap: 2rem;

}

.artemis-labels > span.left-time {
  text-align: left;
}

.artemis-labels > span.current-time {
  text-align: center;
}

.artemis-labels > span.right-time {
  text-align: right;
}

.time-slider {
  width: 100%;
  accent-color: rgb(255, 160, 0);
}

.artemis-rate {
  grid-area: 2 / 2 / 3 / 3;
  pointer-events: auto;
  color: #fff;
  font-size: 0.78rem;
  opacity: 0.8;
}
</style>
