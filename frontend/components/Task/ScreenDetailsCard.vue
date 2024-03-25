<template>
  <v-card class="mx-auto align-start" max-width="800" hover>
    <v-card-item @click="toggleDetails">
      <v-card-title>
        {{ ScreenName }}
      </v-card-title>
      <v-card-subtitle>
        Screen Progress: {{ screenProgress }}
        <v-progress-linear
          v-if="screenProgress !== null && screenProgress !== undefined"
          color="deep-orange"
          height="10"
          :model-value="screenProgress"
          striped
        ></v-progress-linear>
      </v-card-subtitle>
    </v-card-item>

    <v-expand-transition>
      <div v-show="showDetails">
        <v-divider></v-divider>
        <v-card-text>
          <p>Plan Start: {{ screenPlanStart }}</p>
          <p>Plan End: {{ screenPlanEnd }}</p>
          <p>Screen Progress: {{ screenProgress }}</p>
          <p>Screen Manday: {{ screenManday }}</p>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  props: {
    ScreenName: String,
    screenProgress: Number,
    screenPlanStart: String,
    screenPlanEnd: String,
    screenManday: Number,
  },
  data() {
    return {
      showDetails: false,
    };
  },
  methods: {
    toggleDetails() {
      this.showDetails = !this.showDetails;
    },
  },
};
</script>
