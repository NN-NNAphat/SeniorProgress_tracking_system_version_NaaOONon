<template>
  <div class="dashboard" style="padding: 10px 70px; margin-right: 30px">
    <!-- Greeting and current date/time -->
    <v-row no-gutters class="mt-4">
      <v-col class="text-left" style="margin-right: 16px">
        <h1 class="text-01">{{ greeting }}, Bee</h1>
        <p class="text-01">{{ currentDateTime }}</p>
      </v-col>
    </v-row>

    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          style="
            margin-bottom: 10px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          "
        />
      </v-col>
    </v-row>

    <!-- History project data table -->
    <v-data-table
      :headers="headers"
      :items="filteredProjects"
      :sort-by="[{ key: 'project_id', order: 'asc' }]"
      show-select
      v-model:selected="selectedProjects"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>History Project</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>

          <v-btn class="mr-2" color="green" @click="restoreSelectedProjects">
            <v-icon color="white" > mdi-restore </v-icon>
          </v-btn>
          <v-btn color="error" @click="deleteSelectedProjects">
            <v-icon> mdi-delete </v-icon>
          </v-btn>
        </v-toolbar>
      </template>

      <!-- <template v-slot:item.actions="{ item }">
        <v-icon color="green" size="30px" @click="restoreProject(item)">
          mdi-restore
        </v-icon>
        <v-icon color="error" size="30" px @click="deleteProject(item)">
          mdi-delete
        </v-icon>
      </template> -->
    </v-data-table>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  layout: "admin",
  data() {
    return {
      headers: [
        { text: "Project Code", value: "project_id" },
        { text: "Project Name (ENG)", value: "project_name_ENG" },
        { text: "Project Name (TH)", value: "project_name_TH" },
        // { text: "Actions", value: "actions", sortable: false },
      ],
      historyProjects: [],
      selectedProjects: [],
      searchQuery: "",
      greeting: "",
      currentDateTime: "",
    };
  },
  computed: {
    filteredProjects() {
      return this.historyProjects
        .map((project) => ({
          ...project,
          project_progress: project.project_progress || 0,
          project_plan_start: project.project_plan_start || "Not determined",
          project_plan_end: project.project_plan_end || "Not determined",
        }))
        .filter((project) => {
          const searchText = this.searchQuery.toLowerCase();
          return (
            (project.project_id &&
              project.project_id.toLowerCase().includes(searchText)) ||
            (project.project_name_ENG &&
              project.project_name_ENG.toLowerCase().includes(searchText)) ||
            (project.project_name_TH &&
              project.project_name_TH.toLowerCase().includes(searchText))
          );
        });
    },
  },
  methods: {
    async restoreProject(project) {
      try {
        // แสดงข้อความยืนยันก่อนกู้คืนโปรเจกต์
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore this project.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore it!",
        });

        if (confirmResult.isConfirmed) {
          // กู้คืนโปรเจกต์โดยส่งคำขอไปยัง API
          const response = await fetch(
            `http://localhost:7777/projects/updateProject/${project.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                is_deleted: 0, // เปลี่ยนค่า is_deleted เป็น 0 เพื่อกู้คืนโปรเจกต์
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to restore project");
          }

          console.log("Project restored successfully");

          // แสดงข้อความแจ้งเตือนเมื่อกู้คืนโปรเจกต์สำเร็จ
          await Swal.fire(
            "Success",
            "Project restored successfully.",
            "success"
          );

          // โหลดรายการโปรเจกต์ประวัติใหม่
          this.initialize();
        }
      } catch (error) {
        console.error("Error restoring project:", error);

        // แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการกู้คืนโปรเจกต์
        await Swal.fire(
          "Error",
          "An error occurred during the project restoration process.",
          "error"
        );
      }
    },

    async deleteProject(project) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to delete this project.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/projects/deleteHistoryProject/${project.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete project");
          }

          console.log("Project deleted successfully");

          await Swal.fire(
            "Success",
            "Project deleted successfully.",
            "success"
          );

          this.initialize();
        }
      } catch (error) {
        console.error("Error deleting project:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the project deletion process.",
          "error"
        );
      }
    },

    async deleteSelectedProjects() {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to delete selected projects.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete them!",
        });

        if (confirmResult.isConfirmed) {
          for (const project of this.selectedProjects) {
            const response = await fetch(
              `http://localhost:7777/projects/deleteHistoryProject/${project.id}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              throw new Error("Failed to delete project");
            }
          }

          console.log("Selected projects deleted successfully");

          await Swal.fire(
            "Success",
            "Selected projects deleted successfully.",
            "success"
          );

          this.initialize();
          this.selectedProjects = [];
        }
      } catch (error) {
        console.error("Error deleting selected projects:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the selected projects deletion process.",
          "error"
        );
      }
    },

    async restoreSelectedProjects() {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore selected projects.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore them!",
        });

        if (confirmResult.isConfirmed) {
          for (const project of this.selectedProjects) {
            const response = await fetch(
              `http://localhost:7777/projects/updateProject/${project.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  is_deleted: 0,
                }),
              }
            );

            if (!response.ok) {
              throw new Error("Failed to restore project");
            }
          }

          console.log("Selected projects restored successfully");

          await Swal.fire(
            "Success",
            "Selected projects restored successfully.",
            "success"
          );

          this.initialize();
          this.selectedProjects = [];
        }
      } catch (error) {
        console.error("Error restoring selected projects:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the selected projects restoration process.",
          "error"
        );
      }
    },
    async initialize() {
      try {
        const response = await fetch(
          "http://localhost:7777/projects/getHistoryProject"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch history projects");
        }
        const data = await response.json();
        this.historyProjects = data;
      } catch (error) {
        console.error("Error fetching history projects:", error);
      }
    },

    updateDateTime() {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      };

      this.greeting = this.getGreeting(now);
      this.currentDateTime = now.toLocaleDateString("en-US", options);
    },

    getGreeting(date) {
      const hour = date.getHours();

      if (hour >= 0 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    },
  },
  created() {
    this.initialize();
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);
  },
};
</script>

<style scoped>
.dashboard {
  background-color: #ffffff;
}
</style>
