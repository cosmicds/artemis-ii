<template>
  <v-app
    id="app"
    :style="cssVars"
    :class="[smallSize ? 'app-is-small' : '', kiosk ? 'kiosk' : '']"
  >
    <div
      id="main-content"
    >
      <WorldWideTelescope
        :wwt-namespace="wwtNamespace"
      ></WorldWideTelescope>
      <wwt-loader v-model="isLoading" />


      <!-- This contains the splash screen content -->
      <SplashScreen
        :color="accentColor"
        highlight-color="red"
        :loaded="!isLoading"
        @close="() => splashIsClosed = true"
      />
      <VideoWrapper
        v-model="showVideo"
        :src="VIDEO_URL"
      />


      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->
      <div id="wwt-overlay">
        <div id="top-content">
          <div id="left-buttons">
            <icon-button
              icon="mdi-home"
              :color="buttonColor"
              tooltip-location="start"
              title="reset view"
              @activate="goHome"
            >
            </icon-button>
            <icon-button
              v-if="!kiosk"
              icon="mdi-video"
              :color="buttonColor"
              tooltip-location="start"
              title="open video"
              @activate="showVideo = !showVideo"
            ></icon-button>
            <icon-button
              v-if="kiosk && !fullscreen"
              id="fullscreen-icon"
              :icon="fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
              :color="buttonColor"
              @activate="fullscreen = !fullscreen"
            >
            </icon-button>
            <icon-button
              icon="mdi-information-variant"
              :color="buttonColor"
              tooltip-location="start"
              title="toggle info sheet"
              @activate="() => showInfoSheet = !showInfoSheet"
            >
            </icon-button>
            <button 
              class="artemis-btn zoom-label"
              @click="zoomIn"
              @keyup.enter="zoomIn"
            >
              +
            </button>
            <input
              type="range"
              class="zoom-slider"
              title="zoom slider"
              min="0"
              max="1"
              step="0.001"
              :value="zoomSliderValue"
              @input="onZoomSlider"
            />
            <button 
              class="artemis-btn zoom-label"
              @click="zoomOut"
              @keyup.enter="zoomOut"
            >
              −
            </button>
          </div>
          <div id="center-buttons">
          </div>
          <div id="right-buttons">
            <button
              :class="['artemis-btn', 'copy-btn', copySuccess ? 'copy-success' : '']"
              @click="copyViewUrl"
              @keyup.enter="copyViewUrl"
            >
              <span>{{ copySuccess ? 'Copied URL!' : 'Copy view URL' }}
              <!-- <v-icon v-if="copySuccess" color="#32cd32" icon="mdi-check-circle"></v-icon>  -->
              </span>
            </button>
            <button
              class="artemis-btn"
              @click="showSkyBackground = !showSkyBackground"
              @keyup.enter="showSkyBackground = !showSkyBackground"
            >
              {{ showSkyBackground ? 'Hide' : 'Show' }} Stars
            </button>
            <button
              class="artemis-btn"
              @click="showTrajectory = !showTrajectory"
              @keyup.enter="showTrajectory = !showTrajectory"
            >
              {{ showTrajectory ? 'Hide' : 'Show' }} Artemis Path
            </button>
            <hr />
            <button
              class="artemis-btn"
              @click="trackingCenter = SolarSystemObjects.moon"
              @keyup.enter="trackingCenter = SolarSystemObjects.moon"
            >
              Moon View
            </button>
            <button
              class="artemis-btn"
              @click="trackingCenter = SolarSystemObjects.earth"
              @keyup.enter="trackingCenter = SolarSystemObjects.earth"
            >
              Earth View
            </button>

            <div
              v-if="!smallSize"
              class="legend"
            >
              <p class="location">
                <span>Artemis II Location</span>
              </p>
              <p>Artemis II Path</p>
            </div>
          </div>
        </div>


        <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

        <div id="bottom-content">
          <!-- <GesturePreview /> -->
          <SplashGesture v-if="splashIsClosed" />
          <ArtemisTimeControl
            v-model:time="currentTime"
            :can-create="positionSet"
            :initial-time="INITIAL_TIME"
          />
          <div
            v-if="smallSize"
            class="legend legend-small"
          >
            <p class="location">
              <span>Location</span>
            </p>
            <p>Path</p>
          </div>
          <div
            v-if="!smallSize"
            id="body-logos"
          >
            <CreditLogos
              :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
              logo-size="2.5em"
            />
            <p class="toolkit-credit">
              Interactive developed using the
              <a
                href="https://github.com/cosmicds/vue-toolkit"
                target="_blank"
                rel="noopener"
              >CosmicDS toolkit</a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="side-drawer"
      :class="[showInfoSheet ? 'side-drawer-open' : 'side-drawer-closed']"
    >
      <InformationSheet
        v-if="showInfoSheet"
        v-model="showInfoSheet"
        :text-color="accentColor"
      />
    </div>
  </v-app>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, reactive, computed, onMounted, watch } from "vue";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, supportsTouchscreen, useWWTKeyboardControls, CreditLogos, IconButton, useFullscreen } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { D2R, H2R  } from "@wwtelescope/astro";
import { AstroCalc, Color, SpreadSheetLayer } from "@wwtelescope/engine";
import { CoordinatesType, MarkerScales, PlotTypes, ReferenceFrames, SolarSystemObjects } from "@wwtelescope/engine-types";
import ArtemisTimeControl from "./components/ArtemisTimeControl.vue";
import VideoWrapper from "./components/VideoWrapper.vue";
import GesturePreview from "./components/GesturePreview.vue";
import SplashGesture from "./components/SplashGesture.vue";

import { useCameraUrl } from "./composables/useCameraUrl";
import { moveViewCamera, layerManagerDraw, getDepth, getCoordinatesForScreenPoint,getScreenPointForCoordinates, transformPickPointToWorldSpace, transformWorldPointToPickSpace, renderOneFrame, makeFrustum, type CameraView } from "./wwt-hacks";
import { LayerManager, WWTControl } from "@wwtelescope/engine";

const ZOOM_MIN   = 0.00006;
const ZOOM_MAX   = 240;
const LOG_MIN    = Math.log(ZOOM_MIN);
const LOG_MAX    = Math.log(ZOOM_MAX);
// Power < 1 stretches the small-fov (zoomed-in) end of the slider.
const ZOOM_POWER = 3.5;

// Map linear slider position [0,1] → stretched slider position [0,1].
const stretchSlider   = (t: number) => Math.pow(t, ZOOM_POWER);
// Inverse: stretched slider position → linear slider position.
const unstretchSlider = (t: number) => Math.pow(t, 1 / ZOOM_POWER);

function fovToSlider(fov: number): number {
  const linear = (Math.log(fov) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return unstretchSlider(linear);
}
function sliderToFov(t: number): number {
  return Math.exp(LOG_MIN + stretchSlider(t) * (LOG_MAX - LOG_MIN));
}

const zoomSliderValue = computed(() => fovToSlider(store.zoomDeg));

function onZoomSlider(e: Event) {
  const fov = sliderToFov(+(e.target as HTMLInputElement).value);
  const rc = WWTControl.singleton.renderContext;
  rc.targetCamera.zoom = fov;
  rc.viewCamera.zoom   = fov;
  WWTControl.singleton.renderOneFrame();
}

function zoomIn() {
  const newZoom = store.zoomDeg / 1.25;
  const clampedZoom = Math.max(newZoom, ZOOM_MIN);
  const rc = WWTControl.singleton.renderContext;
  rc.targetCamera.zoom = clampedZoom;
  rc.viewCamera.zoom   = clampedZoom;
  WWTControl.singleton.renderOneFrame();
}

function zoomOut() {
  const newZoom = store.zoomDeg * 1.25;
  const clampedZoom = Math.min(newZoom, ZOOM_MAX);
  const rc = WWTControl.singleton.renderContext;
  rc.targetCamera.zoom = clampedZoom;
  rc.viewCamera.zoom   = clampedZoom;
  WWTControl.singleton.renderOneFrame();
}

type SheetType = "text" | "video";

type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface WwtPlaygroundProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const fullscreen = useFullscreen();
const searchParams = new URLSearchParams(window.location.search);
const kiosk = searchParams.get("kiosk")?.toLowerCase() === "true";
if (kiosk) {
  document.body.classList.add("kiosk");
}

const store = engineStore();

useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const { smAndDown } = useDisplay();

const props = withDefaults(defineProps<WwtPlaygroundProps>(), {
  wwtNamespace: "wwt-playground",
  initialCameraParams: () => {
    const galacticCenter = AstroCalc.galacticToJ2000(0, 0);
    return {
      raRad: galacticCenter.RA * H2R ,
      decRad: galacticCenter.dec * D2R,
      zoomDeg: 360
    };
  }
});


const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const showInfoSheet = ref(false);
const splashIsClosed = ref(false);
const showVideo = ref(false);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#ffa000");
const buttonColor = ref("#ffffff");
const VIDEO_URL = "https://www.youtube.com/embed/ML9y0Z7A8ec?autoplay=1&mute=1";

const urlTime = new URLSearchParams(window.location.search).get("time");
const HOME_TIME = new Date("2026-04-06T22:32:00Z");
const INITIAL_TIME = ref(urlTime ? new Date(+urlTime) : HOME_TIME);
const INITIAL_VIEW: CameraView = {
  lng: 167.630072,
  lat: -0.567000,
  zoomDeg: 0.000230,
  rotationDeg: 0,
  angleDeg: 0,
  time: INITIAL_TIME.value.getTime()
};

// http://localhost:5174/?lng=316.555988&lat=74.277000&fov=0.017202&rot=0.000000&angle=0.000000&time=1775474823266
const EARTH_VIEW: CameraView = {
  lng: 316.555988,
  lat: 74.277000,
  zoomDeg: 0.017202,
  rotationDeg: 0,
  angleDeg: 0,
  time: 1775474823266
};
// const HOME_VIEW: CameraView = {
//   // lng: 169.906038,
//   lng: 168.007573,
//   // lat: 1.323000,
//   lat: 3.591000,
//   // zoomDeg: 0.000163,
//   zoomDeg: 0.000157,
//   rotationDeg: 0,
//   angleDeg: 0,
//   time: HOME_TIME.getTime()
// };


const currentTime = ref(INITIAL_TIME.value);

function goHome() {
  currentTime.value = INITIAL_TIME.value;
  trackingCenter.value = SolarSystemObjects.moon;
  moveViewCamera(INITIAL_VIEW, false);
}

function doWWTHacks() {
  WWTControl.singleton.getScreenPointForCoordinates = getScreenPointForCoordinates.bind(WWTControl.singleton);
  WWTControl.singleton.getCoordinatesForScreenPoint = getCoordinatesForScreenPoint.bind(WWTControl.singleton);
  // @ts-expect-error this does exist
  WWTControl.singleton.transformWorldPointToPickSpace = transformWorldPointToPickSpace.bind(WWTControl.singleton);
  // @ts-expect-error this does exist
  WWTControl.singleton.transformPickPointToWorldSpace = transformPickPointToWorldSpace.bind(WWTControl.singleton);
  WWTControl.singleton.renderOneFrame = renderOneFrame.bind(WWTControl.singleton);
  // @ts-expect-error this does exist
  WWTControl.singleton.getDepth = getDepth.bind(WWTControl.singleton);
  // @ts-expect-error this does exist
  WWTControl.singleton.renderContext.makeFrustum = makeFrustum.bind(WWTControl.singleton.renderContext);
  // @ts-expect-error this does exist
  LayerManager._draw = layerManagerDraw;
}

import { AltUnits } from "@wwtelescope/engine-types";
// eslint-disable-next-line @typescript-eslint/no-empty-function
let copyViewUrl: () => Promise<void> = async () => {};
const copySuccess = ref(false);


import { loadHorizonsVectorsForWwt } from "./horizons";
import SplashScreen from "./components/SplashScreen.vue";
import InformationSheet from "./components/InformationSheet.vue";
const layers = ref<SpreadSheetLayer[]>([]);

const trackingCenter = ref<SolarSystemObjects>(SolarSystemObjects.moon);

const showTrajectory = ref(true);

async function createArtemisLayers(trackedObject: SolarSystemObjects) {

  const vec = await loadHorizonsVectorsForWwt('./horizons_results-earth.txt', SolarSystemObjects.earth, trackedObject);
  const items = vec.split("\r\n");
  const header = items.shift();
  let bounds: [number, number][] = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const N = 10;
  const centerStart = 1300;
  const centerEnd = 1500;
  const end = items.length;
  for (let i = centerStart; i < centerEnd; i += N) {
    bounds.push([i, i + N]);
  }
  bounds = [[0, centerStart], ...bounds, [centerEnd, end]];
  bounds.forEach((bds) => {
    const data = items.slice(...bds).join("\r\n");

    if (showTrajectory.value) {
      store.createTableLayer({
        name: 'Artemis',
        referenceFrame: 'Sky',
        dataCsv: `${header}\r\n${data}`,
      }).then(layer => {
        layer.set_xAxisColumn(2);
        layer.set_yAxisColumn(3);
        layer.set_zAxisColumn(4);
        layer.set_coordinatesType(CoordinatesType.rectangular);
        layer.set_astronomical(true);
        layer.set_cartesianScale(AltUnits.astronomicalUnits);
        layer.set_altUnit(AltUnits.astronomicalUnits);
        layer.set_markerScale(MarkerScales.screen);
        layer.set_scaleFactor(10);
        layer.set_color(Color.fromHex("#ffffff"));
        layer.set_showFarSide(true);
        layer.set_opacity(25);
        layers.value.push(layer);
      });
    }



    store.createTableLayer({
      name: 'Artemis Time',
      referenceFrame: 'Sky',
      dataCsv: `${header}\r\n${data}`,
    }).then(layer => {
      layer.set_xAxisColumn(2);
      layer.set_yAxisColumn(3);
      layer.set_zAxisColumn(4);
      layer.set_coordinatesType(CoordinatesType.rectangular);
      layer.set_astronomical(true);
      layer.set_cartesianScale(AltUnits.astronomicalUnits);
      layer.set_altUnit(AltUnits.astronomicalUnits);
      layer.set_markerScale(MarkerScales.screen);
      layer.set_plotType(PlotTypes.gaussian);
      layer.set_scaleFactor(40);
      layer.set_color(Color.fromHex("#ff0000"));
      layer.set_showFarSide(true);
      layer.set_opacity(100);
      layer.set_startDateColumn(1);
      layer.set_endDateColumn(1);
      layer.set_decay(4.99 / (60 * 24));
      layer.set_timeSeries(true);
      layers.value.push(layer);
    });
  });

  const showMoonRefLayer = false;
  if (showMoonRefLayer) {
    const vecMoon = await loadHorizonsVectorsForWwt('./horizons_results-moon.txt', SolarSystemObjects.moon, trackedObject);
    store.createTableLayer({
      name: 'Artemis Moon',
      referenceFrame: 'Sky',
      dataCsv: vecMoon,
    }).then(layer => {
      layer.set_xAxisColumn(2);
      layer.set_yAxisColumn(3);
      layer.set_zAxisColumn(4);
      layer.set_coordinatesType(CoordinatesType.rectangular);
      layer.set_astronomical(true);
      layer.set_cartesianScale(AltUnits.astronomicalUnits);
      layer.set_altUnit(AltUnits.astronomicalUnits);
      layer.set_markerScale(MarkerScales.screen);
      layer.set_scaleFactor(5);
      layer.set_color(Color.fromHex("#00ffff"));
      layer.set_showFarSide(true);
      layer.set_opacity(25);
      layers.value.push(layer);
    });

  }

}

function removeArtemisLayers() {
  console.log('remove layers');
  layers.value.forEach(layer => store.deleteLayer(layer.id.toString()));
  layers.value = [];
}

const showSkyBackground = ref(true);

onMounted(() => {
  store.waitForReady().then(async () => {
    WWTControl.singleton.set_zoomMax(ZOOM_MAX);
    WWTControl.singleton.setSolarSystemMaxZoom(ZOOM_MAX);

    WWTControl.singleton.renderOneFrame();
    doWWTHacks();

    store.setBackgroundImageByName("Solar System");
    store.applySetting(["actualPlanetScale", true]);
    store.applySetting(["solarSystemCosmos", true]);
    store.applySetting(["solarSystemMilkyWay", showSkyBackground.value]);
    store.applySetting(["solarSystemStars", showSkyBackground.value]);
    store.setTrackedObject(SolarSystemObjects.moon);

    // @ts-expect-error this does exist
    WWTControl.singleton.shallowLayerTest = function(layer) {
      const table = layer.get__table();
      const rows = table.rows;
      const count = rows.length;
      const center = Math.floor(count / 2);
      const centerRow = rows[center];
      const x = Number(centerRow[layer.get_xAxisColumn()]);
      const y = Number(centerRow[layer.get_yAxisColumn()]);
      const z = Number(centerRow[layer.get_zAxisColumn()]);
      // @ts-expect-error this does exist
      const depth = WWTControl.singleton.getDepth(x, y, z);
      // @ts-expect-error this does exist
      const moonDepth = WWTControl.singleton.getDepth(0, 0, 0);
      return depth <= moonDepth;
    }.bind(this);


    store.setTrackedObject(trackingCenter.value);
    createArtemisLayers(trackingCenter.value);


    ({ copyViewUrl } = useCameraUrl(INITIAL_VIEW, copySuccess));
    positionSet.value = true;
    layersLoaded.value = true;
  });
});

watch(showSkyBackground, (show) => {
  try {
    store.applySetting(["solarSystemMilkyWay", show]);
    store.applySetting(["solarSystemStars", show]);
  } catch {
    return;
  }
});

watch(trackingCenter, (trackedObject) => {
  removeArtemisLayers();
  store.setTrackedObject(trackedObject);
  if (trackedObject === SolarSystemObjects.earth) {
    moveViewCamera(EARTH_VIEW, false);
  }
  createArtemisLayers(trackedObject);
});

watch(showTrajectory, (show) => {
  removeArtemisLayers();
  createArtemisLayers(trackingCenter.value);
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);


/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
  };
});


</script>

<style lang="less">

body {
  &.kiosk {
    a {
      pointer-events: none !important;
      text-decoration: inherit !important;
      color: inherit !important;
    }
  }
}

// #app is a column flex container with two children:
// #main-content and #bottom-drawer.
// #main-content contains the WWT display and the overlay content.

#app {
  // Vuetify's root app element fills the viewport.
  overflow: hidden;
  // Vuetify's root app element is a column flex layout
  // lets #main-content take the remaining height
  // after `#bottom-drawer` takes its own height.
}

// while #app is a flex, the direct parent
// is .v-application__wrap
// this takes the size of it's children
// so we need to apply height definitions here
// for a display with a side-panel this is generally
// what we want
.v-application__wrap {
  flex-direction: row-reverse;  // add for the side panel
  max-height: 100svh;  // force the application to be 100%
}

#app.app-is-small {
  .v-application__wrap {
    flex-direction: column;  // add for the side panel
    max-height: 100svh;  // force the application to be 100%
  }
}

#main-content {
  // This is the containing block for the absolutely positioned WWT host and overlay.
  position: relative;
  display: block; // don't need to set width. block elements stretch to fill their container by default.
  // Its height is determined by the flex layout in `#app`.
  flex: 1 0 auto;
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#side-drawer {
  flex: 0 0 auto;
  overflow: hidden;
  width: 0;
  // transition: width 0.3s ease-in-out;

  &.side-drawer-open {
    width: 34%;
  }
}

#app.app-is-small {
  #side-drawer {
  flex: 0 0 auto;
  overflow: hidden;
  height: 0;
  width: 100%;
  // transition: width 0.3s ease-in-out;

  &.side-drawer-open {
    height: 34%;
  }
}
}

/* The WWT host is out of flow so its measured size does not affect #main-content. */
// by using inset: 0, .wwttelescope-component fills #main-content and automatically resizes with it,
// without needing a height width set. this allows main-content to be more freely sizes.
/*
WWT can size itself from CSS alone here because #main-content has a real layout size (from the flex layout in #app)
and `.wwtelescope-component` is absolutely positioned to fill it.

This breaks if #main-content stops having a definite size from layout. Common failure modes:
  - `#main-content` loses `flex-grow`/flex sizing, so in a column layout it can collapse to zero height.
  - An ancestor no longer has a definite height, so percentage or flex-based heights stop resolving.
  - `#main-content` is changed to content-sized sizing (`auto`, `fit-content`, certain grid/flex min-content cases),
    so its size starts depending on descendants instead of the outer layout.
  - `.wwtelescope-component` is put back in normal flow, letting WWT's continuously resized canvas feed back into layout
    and recreate the growth loop.
  - Padding or other box-model changes are applied to the measured WWT host instead of an outer wrapper, which can
    reintroduce resize feedback.

If any of those happen, the ResizeObserver composable may be needed again to push the resolved size from
`#main-content` onto the WWT host explicitly.
*/
.wwtelescope-component {
  position: absolute; // putting this to relative will cause the growth loop, and will require the composable to prevent that
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  // The composable sets the host element's inline width/height from #main-content.
  transition: height 0.2s ease-in-out;
  opacity: 1;
}

/*
#wwt-overlay is positioned against #main-content, not the viewport.
`position: absolute` makes it fill #main-content.
`position: fixed` would anchor it to the viewport instead.
The overlay itself is out of flow, but its children can use normal flex layout inside it.
you can also do position: relative, height: 100%. (and remove the inset: 0)
- absolute + inset: 0 says “this is a layer pinned to the container”
- relative + height: 100% says “this is a normal child trying to be as tall as its parent”
we use the absolute variant to stay more independent of the which can interact weirdly with WWT's resizing.
and the relative still requires the parent to have a definite size.
and remember, position:absolute is still a positioned parent, so children can be absolute against it
*/
#wwt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 1rem;
  pointer-events: none;

  display: flex;
  flex-direction: column;
  justify-content: space-between; // pushes top and bottom content apart
}

// moved modal content to Loader.vue

#top-content {
  width: 100%; // 100% of the overlay less the padding
  pointer-events: none;
  display: flex;
  justify-content: space-between; // keeps left, center, and right buttons spread
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;

  .zoom-slider {
    writing-mode: vertical-lr;
    height: 120px;
    accent-color: #fff;
    pointer-events: auto;
    cursor: pointer;
    opacity: 0.75;
    &:hover { opacity: 1; }
  }

  .zoom-label {
    background: #000;
    border: 1px solid #fff;
    border-radius: 3px;
    color: #fff;
    width: 20px;
    height: 20px;
    font-size: 0.9rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
}

#center-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;

  hr {
    margin-block: 0.25em;
    opacity: 0;
  }

  .artemis-btn {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: 4px;
    color: #fff;
    font-size: 0.8em;
    padding: 4px 10px;
    cursor: pointer;
    user-select: none;
    &:hover { background: rgba(255, 255, 255, 0.25); }
  }

  .copy-btn {
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 15ch;

    &.copy-success {
      border-color: #0ee7e3;
      box-shadow: 0 0 6px 1px rgba(7, 105, 226, 0.6);
    }
  }
}


#app.app-is-small .artemis-btn {
  font-size: 0.65rem;
}

#app.app-is-small  .copy-btn {
    width: 16ch;
}

.icon-wrapper {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: 4px !important;
    color: #fff;
    font-size: 0.8rem;
    padding: 4px 10px;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.25); }
  }


#bottom-content {
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#bottom-content {
  #body-logos {
    align-self: flex-end;
  }

  #icons-container {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }

  .toolkit-credit {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.55);
    text-align: right;
    margin: 2px 0 0;
    a { color: inherit; text-decoration: underline; }
  }
}

#app.app-is-small #bottom-content {
  margin-bottom: 1rem;
  padding-inline: 1rem;
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible {
  /* Keep this override outside Vuetify's layers so it wins without !important. */
  outline: 4px double white;
  box-shadow: 0 0 0 2px black;
  border-radius: .025rem;
}

.layout-debug {
  #main-content {
    border: 2px solid red;
  }
  #main-content,
  #top-content,
  #left-buttons,
  #center-buttons,
  #right-buttons,
  #bottom-content {
    outline: 1px solid white;
    min-width: 1px;
    min-height: 1px;
  }
  #wwt-overlay {
    border: 3px solid aqua;
  }

}

#bottom-drawer {
  position: relative;
  // height: 200px;
  // flex: 0 0 200px;
  overflow: auto;
}

.legend {
  font-size: 0.8em;
  line-height: 2;
  border: 1px solid white;
  border-radius: 4px;
  padding: 0.5em;
  padding-left: 1em;
  background-color: rgba(0,0,0,.6);
  backdrop-filter: blur(5px);
  margin-top: calc(0.5em + 10px);
  pointer-events: auto;
  user-select: none;
}

.legend > p {
  display: list-item;
  list-style-type: disc;
  list-style-position: inside;
}

.legend > p.location {
  color: red;
}
.legend > p.location > span {
  color: white;
}

.legend-small {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  font-size: clamp(6pt, 4vw, 0.8em);
  margin-top: 2em;
}



</style>
