<template>
  <div class="gesture-preview-container">
    <div class="gesture-icon">
      <div class="gesture-icon__icon">
        <v-icon
          size="large"
        >
          <!-- {{ touchscreen ? 'mdi-gesture-swipe-horizontal' : 'mdi-cursor-default-gesture' }} -->
          mdi-cursor-move
        </v-icon>
      </div>
      <div class="gesture-icon__label">
        PAN
      </div>
    </div>
    <span class="gesture-and">&</span>
    <div class="gesture-icon">
      <div class="gesture-icon__icon">
        <div class="two-icons">
          <v-icon
            size="small"
          >
            mdi-magnify-minus
          </v-icon>
          <v-icon
            size="small"
          >
            mdi-magnify-plus
          </v-icon>
        </div>
      </div>
      <div class="gesture-icon__label">
        ZOOM
      </div>
    </div>
    <span class="gesture-explore">to explore the path</span>
  </div>
</template>


<!-- <script setup lang="ts">
import { supportsTouchscreen } from '@cosmicds/vue-toolkit';
const touchscreen = supportsTouchscreen();
</script> -->

<style>
.gesture-preview-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  
  gap: 1rem;
  
  margin-inline: 1rem;
  margin-block: 1rem;
  padding: 0.5rem;
  
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background-color: rgba(0,0,0,0.5);
  font-size: 1rem;
  
  align-self: flex-start
}

.gesture-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.gesture-icon__label {
  font-size: 0.5em;
}

.gesture-and {
  font-size: 1.5rem;
}

.gesture-explore {
  width: 5rem
}

.two-icons {
  display: flex;
  flex-direction: row;
  gap: -0.25rem;
}
</style>
