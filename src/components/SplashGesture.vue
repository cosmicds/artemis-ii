<template>
  <div class="gesture-preview-container">
    <div class="gesture-icon">
      <div class="gesture-icon__icon">
        <v-icon
          size="large"
        >
          {{ touchscreen ? 'mdi-gesture-swipe-horizontal' : 'mdi-cursor-default-gesture' }}
        </v-icon>
      </div>
      <div class="gesture-icon__label">
        PAN
      </div>
    </div>
    <span class="gesture-and">&</span>
    <div class="gesture-icon">
      <div class="gesture-icon__icon">
        <v-icon
          size="large"
        >
          mdi-magnify-scan
        </v-icon>
      </div>
      <div class="gesture-icon__label">
        ZOOM
      </div>
    </div>
    to move around
  </div>
</template>


<script setup lang="ts">
import { supportsTouchscreen } from '@cosmicds/vue-toolkit';
const touchscreen = supportsTouchscreen();
</script>

<style>
.gesture-preview-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  
  gap: 2.5rem;
  
  margin-inline: 1rem;
  margin-block: 1rem;
  padding: 0.5rem;
  
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background-color: rgba(0,0,0,0.5);
  font-size: 1rem;
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
</style>
