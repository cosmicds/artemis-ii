<template>
  <v-card
    class="info-sheet"
    height="100%"
  >
    <v-tabs
      id="tabs"
      v-model="tab"
      height="32px"
      :color="textColor"
      :slider-color="textColor"
      dense
      align-tabs="end"
    >
      <v-tab
        class="info-tabs"
        tabindex="0"
      >
        <h3>Information</h3>
      </v-tab>
      <v-tab
        class="info-tabs"
        tabindex="0"
      >
        <h3>User Guide</h3>
      </v-tab>
    </v-tabs>
    <font-awesome-icon 
      id="close-text-icon" 
      class="control-icon" 
      icon="times" 
      size="lg" 
      tabindex="0"
      @click="showTextSheet = false" 
      @keyup.enter="showTextSheet = false"
    >
    </font-awesome-icon>
      
    <!-- Information Content -->
    <v-window
      id="tab-items"
      v-model="tab"
      class="pb-2"
    >
      <v-window-item>
        <v-card class="scrollable">
          <v-card-text class="info-text scrollable">
            <h4 class="user-guide-header">
              Tracking Artemis II
            </h4>
            <p>
              Place Holder
            </p>
            <h4 class="user-guide-header mt-5">
              Technical Note
            </h4>
          </v-card-text>
        </v-card>
      </v-window-item>
      
      <!-- User Guide Content -->
      <v-window-item>
        <v-card class="scrollable">
          <v-card-text class="info-text scrollable">
            <h4 class="user-guide-header">
              Tracking Artemis II
            </h4>
            <p>
              This <a
                href="https://www.worldwidetelescope.org/home"
                target="_blank"
                rel="noopener noreferrer"
              >WorldWide Telescope</a> (WWT) interactive provides an view of of the Artemis II 
              trajectory, from ICPS separation (3h24m18s after launch) to splash down. 
            </p>
            <h4 class="user-guide-header mt-5">
              Technical Note
            </h4>

            <ul>
              <li>Data is a JPL Horizons Vector Table for Artemis II, centered on the Earth (Goecenter [code: 500]). </li>
              <li class="li">
                Data is current as of Apr 08, 2026 21:35 UTC 
                <details>
                  <summary>Horizons Query</summary>
                  <!-- do not intent inside pre tag  -->
                  <pre>!$$SOF
MAKE_EPHEM=YES
COMMAND=-1024
EPHEM_TYPE=VECTORS
CENTER='500@399'
START_TIME='2026-04-02 01:59'
STOP_TIME='2026-04-10 23:54'
STEP_SIZE='5 MINUTES'
VEC_TABLE='1'
REF_SYSTEM='ICRF'
REF_PLANE='ECLIPTIC'
VEC_CORR='NONE'
CAL_TYPE='M'
OUT_UNITS='AU-D'
VEC_LABELS='YES'
VEC_DELTA_T='YES'
CSV_FORMAT='YES'
OBJ_DATA='YES'</pre>
                </details>
              </li>
                
              <li class="li">
                Postion with respect to Moon may have a systematic offset
              </li>
            </ul>
                
            <h4 class="user-guide-header mt-5">
              Sky Navigation
            </h4>
            <p>
              To navigate the WWT view, use the following controls:
            </p>
            <v-row
              align="center"
              class="mt-2 mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Pan
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong> {{ touchscreen ? "" : "or" }}
                <strong>{{ touchscreen ? "" : "W-A-S-D" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
              </v-col>
            </v-row>
            <v-row
              align="center"
              class="mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Zoom
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? "" :
                  "or" }} <strong>{{ touchscreen ? "" : "I-O" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
              </v-col>
            </v-row>
            <v-row
              align="center"
              class="mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Rotate
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                {{ touchscreen ? "" : "press" }} <strong>{{ touchscreen ? "pinch and twist" : "control + click + drag"
                }}</strong> {{ touchscreen ? "" : "" }} <strong>{{ touchscreen ? "" : "" }}</strong> {{ touchscreen
                  ? "" : "" }} (Keyboard option coming soon)<br>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <h4 class="user-guide-header">
                  Controls
                </h4>
                <ul class="text-list mx-5">
                  <li>
                    <strong>Select Background</strong>: Choose from DSS, 2MASS, SDSS, or unWISE.
                  </li>
                </ul>
              </v-col>
            </v-row>
              
            <!-- Credits -->
            <v-row>
              <v-col cols="12">
                <div class="credits">
                  <h4 class="user-guide-header mt-3">
                    Credits
                  </h4>
                  <h5>
                    <a
                      href="https://www.cosmicds.cfa.harvard.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >CosmicDS</a>
                  </h5>
                  <p>Jon Carifio</p>
                  <p>John Lewis</p>
                  <p>Pat Udomprasert</p>
                  <p>Alyssa Goodman</p>

                  <h5>
                    <a
                      href="https://www.worldwidetelescope.org/home"
                      target="_blank"
                      rel="noopener noreferrer"
                    >WorldWide Telescope</a>
                  </h5>
                  <p>Jon Carifio</p>
                  <p>Peter Williams</p>
                  <p>David Weigel</p>
                </div>
                <v-spacer class="end-spacer"></v-spacer>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <funding-acknowledgement />
              </v-col>
            </v-row>
            <!-- </v-container> -->
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supportsTouchscreen, FundingAcknowledgement } from '@cosmicds/vue-toolkit';

const tab = ref(0);
const touchscreen = supportsTouchscreen();



const showTextSheet = defineModel<boolean>();

interface Props {
  textColor: string
}

defineProps<Props>();

</script>

<style lang="less">
.intro-card {
  padding: 1em;
  container-type: size;
}

.info-text {

  p {
    margin-block: 0.5em;
  }

  a {
    color: var(--accent-color-2)
  }

  h3 {
    font-size: 1.4em;
    color: var(--text-color);
  }

  h4 {
    font-size: 1.2em;
    color: var(--border-color);
  }

  h5 {
    font-size: 1em;
    font-weight: bold;
    margin-top: 1em;
  }

  li {
    margin-block: 0.5em;
  }
  
  details {
    user-select: none;
    margin-block: 0.5em;
    outline: 1px solid rgba(255, 255, 255, 0.50);
    padding: 2px 1em;
    border-radius: 2px;
    cursor: pointer;
  }
  details:hover {
    outline: 2px solid #aeaeae;
  }
  
  pre {
    background-color: rgb(50, 50, 50);
    padding: 0.5em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8em;
  }
}

.bullet-icon {
  color: var(--border-color);
  width: 1.2em;
  padding-right: 0.5em;
}


.info-sheet {
  overflow-y: auto;

  .info-text {
    height: fit-content;
  }


  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .scrollable {
    overflow-y: auto;
  }

  #tab-items {
    // padding-bottom: 2px !important;

    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";
      

      .end-spacer {
        height: 25px;
      }
    }

  }

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;

    &:hover {
      cursor: pointer;
    }
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next,
  .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}
</style>