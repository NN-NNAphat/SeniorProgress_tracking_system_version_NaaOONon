<template>
  <div>
    <h1>แสดง Dashbord รายระเอียดของโปรเจค</h1>
    <v-container>
      <v-autocomplete
        v-model="selectedItem"
        :items="projectList"
        item-text="id"
        label="Select Project"
        @change="fetchProjectDetails"
      ></v-autocomplete>
      <v-card v-if="projectDetails">
        <v-card-title>{{ projectDetails.project_name }}</v-card-title>
        <v-card-text>
          <p><strong>รหัสโปรเจค:</strong> {{ projectDetails.project_id }}</p>
          <p>
            <strong>ชื่อโปรเจค (ภาษาไทย):</strong>
            {{ projectDetails.project_name_TH }}
          </p>
          <p>
            <strong>ชื่อโปรเจค (ภาษาอังกฤษ):</strong>
            {{ projectDetails.project_name_ENG }}
          </p>
          <p>
            <strong>ความก้าวหน้าโปรเจค:</strong>
            {{ projectDetails.project_progress }}
          </p>
          <p>
            <strong>จำนวนวันที่ใช้งานโปรเจค:</strong>
            {{ projectDetails.project_manday }}
          </p>
          <p><strong>จำนวนระบบ:</strong> {{ projectDetails.system_count }}</p>
          <p>
            <strong>วันที่เริ่มต้นของโปรเจค:</strong>
            {{ projectDetails.project_plan_start }}
          </p>
          <p>
            <strong>วันที่สิ้นสุดของโปรเจค:</strong>
            {{ projectDetails.project_plan_end }}
          </p>
          <!-- เพิ่มรายละเอียดอื่น ๆ ของโปรเจคตามต้องการ -->
        </v-card-text>
      </v-card>

      <div>
        <h1>รายการระบบทั้งหมด</h1>
        <v-container>
          <v-list v-if="projectDetails" outlined elevation="2">
            <v-list-item v-for="system in systems" :key="system.id">
              <v-list-item-content>
                <v-list-item-title>{{
                  system.system_nameTH
                }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  system.system_nameEN
                }}</v-list-item-subtitle>
                <v-list-item-subtitle v-if="system.screen_count">{{
                  `จำนวนหน้าจอ: ${system.screen_count}`
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-container>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      selectedItem: "", // เก็บ ID ของโปรเจคที่เลือก
      user: {},
      projectList: [],
      projectDetails: null, // เริ่มต้นเป็น null
      systems: [],
    };
  },

  created() {
    this.user = this.$auth.user;
    this.getProjects();
    this.getSystems();
  },
  methods: {
    async getProjects() {
      try {
        const response = await this.$axios.get("/projects/getAll");
        this.projectList = response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    async fetchProjectDetails() {
      try {
        const projectId = this.selectedItem; // รับ id ของโปรเจคที่เลือกจาก v-autocomplete
        const response = await this.$axios.get(`/projects/getOne/${projectId}`); // ส่งคำร้องข้อมูลโปรเจคไปยัง API
        // console.table(response.data);
        this.projectDetails = response.data; // กำหนดข้อมูลรายละเอียดโปรเจคเพื่อแสดงในหน้า UI
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    },
    async getSystems() {
      try {
        const projectId = this.selectedItem; // รับ id ของโปรเจคที่เลือกจาก v-autocomplete
        const response = await this.$axios.get(`/systems/getAll/${projectId}`);
        this.systems = response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
      }
    },
  },
};
</script>

<style>
/* เพิ่มสไตล์ Vuetify ถ้าจำเป็น */
</style>
