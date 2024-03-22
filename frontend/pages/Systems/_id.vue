<template>
  <div>
    <v-row style="margin-bottom: 20px" align="center">
      <v-col cols="6">
        <v-card class="mx-auto align-start" max-width="800" hover>
          <v-card-item @click="showDetails = !showDetails">
            <v-card-title>
              {{ system.system_nameEN }}
            </v-card-title>
            <v-card-subtitle>
              Systems Progress: {{ system.system_progress }}
              <v-progress-linear
                v-if="
                  system.system_progress !== null &&
                  system.system_progress !== undefined
                "
                color="deep-orange"
                height="10"
                :model-value="system.system_progress"
                striped
              ></v-progress-linear>
            </v-card-subtitle>
          </v-card-item>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>System Manday: {{ system.system_manday }}</p>
                <p>Screen Count: {{ system.screen_count }}</p>
                <p>System Plan Start: {{ system.system_plan_start }}</p>
                <p>System Plan End: {{ system.system_plan_end }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col>
        <v-btn class="custom-btn" @click="showUserDialog = true">
          แสดงรายชื่อผู้ใช้ในระบบ
        </v-btn>

        <v-dialog v-model="showUserDialog" max-width="600">
          <v-card>
            <v-card-title>รายชื่อผู้ใช้ในระบบ</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="(user, index) in projectUsers" :key="index">
                  <v-list-item-avatar>
                    <img :src="user.user_pic" alt="User Picture" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ user.user_position }}: {{ user.user_firstname }}
                      {{ user.user_lastname }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      >ตำแหน่ง: {{ user.user_position }}</v-list-item-subtitle
                    >
                    <v-list-item-subtitle
                      >แผนก: {{ user.user_department }}</v-list-item-subtitle
                    >
                    <!-- เพิ่มข้อมูลเพิ่มเติมตามต้องการ -->
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="showUserDialog = false">ปิด</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
    <!-- ปุ่ม -->
    <v-row style="margin-bottom: 20px" justify="end">
      <v-btn color="primary" dark @click="goToCreateScreen">New Screen</v-btn>
      &nbsp;&nbsp;&nbsp;
      <v-btn color="primary" dark @click="goToHistoryScreens"
        >Show History Screen</v-btn
      >
    </v-row>

    <!-- แสดงรายระเอียดScreen -->
    <div>
      <v-container>
        <v-row class="full-width">
          <v-col
            cols="12"
            md="6"
            lg="4"
            v-for="screen in filteredScreens"
            :key="screen.id"
          >
            <v-card class="mx-auto full-width" max-width="400">
              <v-img
                class="align-end text-white"
                height="200"
                :src="getBase64Image(screen.screen_pic)"
                cover
              >
                <v-card-title>{{ screen.screen_name }}</v-card-title>
              </v-img>

              <v-card-subtitle class="pt-4">
                {{ screen.screen_id }}
              </v-card-subtitle>

              <v-card-text>
                <h1>screen ID: {{ screen.id }}</h1>
                <div><b>Due Date:</b> {{ screen.screen_plan_end }}</div>
                <div><b>Screen Level:</b> {{ screen.screen_level }}</div>
                <div><b>Progress:</b> {{ screen.screen_progress }}</div>
              </v-card-text>

              <v-card-actions>
                <v-btn color="orange" @click="openEditDialog(screen)">
                  Edit
                </v-btn>

                <v-btn color="orange" @click="confirmDeleteScreen(screen)">
                  Delete
                </v-btn>

                <v-btn @click="goToScreensDetail(screen.id)">
                  Screen Detail
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Create Screen Dialog -->
    <v-dialog
      v-model="createScreenDialog"
      max-width="600"
      ref="createScreenDialog"
    >
      <v-card>
        <v-card-title>Create New Screen</v-card-title>
        <v-card-text>
          <!-- Form to create a new screen -->
          <v-form>
            <v-text-field
              v-model="newScreen.screen_id"
              label="Screen ID"
            ></v-text-field>
            <v-text-field
              v-model="newScreen.screen_name"
              label="Screen Name"
            ></v-text-field>
            <v-select
              v-model="newScreen.screen_level"
              label="Screen Level"
              :items="['Very Difficult', 'Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>

            <!-- File input for avatar -->
            <v-file-input
              accept="image/png, image/jpeg, image/bmp"
              label="Avatar"
              placeholder="Pick an avatar"
              prepend-icon="mdi-camera"
              v-model="newScreen.avatar"
            >
            </v-file-input>

            <v-btn
              type="submit"
              @click="
                createScreenDialog = false;
                createScreen();
              "
              >Create</v-btn
            >
            <v-btn @click="createScreenDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Screen Dialog -->
    <v-dialog v-model="editScreenDialog" max-width="600" ref="editScreenDialog">
      <v-card>
        <v-card-title>Edit Screen</v-card-title>
        <v-card-text>
          <!-- Form to edit screen -->
          <v-form @submit.prevent="updateScreen">
            <v-text-field
              v-model="editScreen.screen_id"
              label="Screen ID"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="editScreen.screen_name"
              label="Screen Name"
            ></v-text-field>
            <v-select
              v-model="editScreen.screen_level"
              label="Screen Level"
              :items="['Very Difficult', 'Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>
            <v-btn type="submit">Update</v-btn>
            <v-btn @click="editScreenDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Show deleted screens history -->
    <v-dialog v-model="showHistoryDialog" max-width="800">
      <v-data-table headers="headers" :items="deletedScreens">
        <!-- Define headers for the table -->

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Deleted Screens History</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>
      </v-data-table>
    </v-dialog>
  </div>
</template>


<script>
import Swal from "sweetalert2";

export default {
  name: "SystemDetails",
  layout: "admin",
  data() {
    return {
      projectUsers: [],
      showUserDialog: false,
      systemUsers: [],
      projectId: null,
      systemId: null,
      system: {},
      showDetails: false,
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
      showHistoryDialog: false,
      deletedScreens: [],
      createScreenDialog: false,
      editScreenDialog: false,
      newScreen: {
        screen_id: "",
        screen_name: "",
        screen_manday: "",
        screen_level: "",
        screen_pic: "",
        screen_plan_start: "",
        screen_plan_end: "",
      },
      editedScreen: {
        screen_id: "",
        screen_name: "",
        screen_level: "",
      },
      screens: [],
      searchQuery: "", // Search query for filtering systems
      userScreensHeaders: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due date", value: "screen_plan_end" },
        { text: "Screen Level", value: "screen_level" },
        { text: "Image", value: "screen_pic" }, // เปลี่ยนจาก "Progress" เป็น "Picture"
        { text: "Actions", value: "actions", sortable: false },
      ],
      headers: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due date", value: "screen_plan_end" },
        { text: "Screen ", value: "screen_level" },
        { text: "Progress", value: "screen_progress" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      watch: {
        // Watch for changes in the selected system ID and fetch details accordingly
        selectedSystemId: "fetchSystemDetails",
      },
    };
  },

  mounted() {
    this.fetchSystem();
    this.fetchScreens();
    this.fetchSystemNameENG();
  },
  created() {
    this.fetchSystemUsers(this.systemId, this.projectId);
  },
  methods: {
    async fetchSystemUsers(systemId, projectId) {
      try {
        console.log("systemId:", systemId);
        console.log("projectId:", projectId);
        const response = await fetch(
          `http://localhost:7777/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system users");
        }
        const users = await response.json();
        console.log("Users:", users); // แสดงผู้ใช้ที่ได้รับจาก API ในคอนโซลโลจิก
        this.projectUsers = users; // อัพเดท projectUsers ด้วยข้อมูลผู้ใช้ที่ได้จาก API
      } catch (error) {
        console.error("Error fetching system users:", error);
      }
    },

    async fetchSystem() {
      // เพิ่ม method เพื่อดึงข้อมูล system จาก API
      const systemId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system data");
        }
        const systemData = await response.json();
        this.system = systemData;
        this.projectId = systemData.project_id;
        this.systemId = systemData.id; // หรืออื่น ๆ ตามความเหมาะสม

        // ตรวจสอบค่า systemId และ projectId ว่าถูกตั้งค่าหรือไม่
        console.log("systemId:", this.systemId);
        console.log("projectId:", this.projectId);

        // หลังจากตรวจสอบค่าแล้ว ให้เรียกใช้ fetchSystemUsers() ถ้าค่าไม่ใช่ null
        if (this.systemId !== null && this.projectId !== null) {
          this.fetchSystemUsers(this.systemId, this.projectId);
        }
      } catch (error) {
        console.error("Error fetching system data:", error);
        // Handle error fetching system data
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch system data. Please try again.",
          timer: 3000,
        });
      }
    },

    async createScreen() {
      const systemId = this.$route.params.id;

      try {
        // Fetch system data to get project_id
        const systemResponse = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system data");
        }

        const systemData = await systemResponse.json();
        const projectId = systemData.project_id;

        // Convert image to Base64
        const base64Image = await this.imageToBase64(this.newScreen.avatar);

        // Prepare data to send
        const requestData = {
          screen_id: this.newScreen.screen_id,
          screen_name: this.newScreen.screen_name,
          screen_status: "default_status", // Update with your default status
          screen_level: this.newScreen.screen_level,
          screen_pic: base64Image, // Update with your default pic
          system_id: systemId,
          screen_progress: 0, // Update with your default progress
          screen_plan_start: this.newScreen.screen_plan_start || null, // Use null if empty
          screen_plan_end: this.newScreen.screen_plan_end || null, // Use null if empty
          project_id: projectId, // Use the fetched project_id
        };

        // Make the request to create a new screen
        const response = await fetch(
          `http://localhost:7777/screens/createScreen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Screen Created!",
            text: "The new screen has been created successfully.",
            timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
          });
        } else {
          throw new Error("Failed to create screen");
        }

        // ... continue
      } catch (error) {
        console.error("Error creating screen", error);

        // Show error message using SweetAlert2
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create the screen. Please try again.",
          timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
        });
        // ... continue
      }
    },
    // Function to convert image to Base64
    imageToBase64(imagePath) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imagePath);

        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Exclude the data:imasge/<fileType>;base64, prefix
          resolve(base64String);
        };

        reader.onerror = (error) => {
          reject(error);
        };
      });
    },

    getBase64Image(base64Data) {
      return "data:image/jpeg;base64," + base64Data;
    },

    async fetchSystemNameENG() {
      try {
        const systemId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system");
        }
        const systemData = await response.json();
        console.log(systemData); // ตรวจสอบข้อมูลที่ได้รับมา
        this.systemNameENG = systemData.system_nameEN; // ใส่ชื่อ field ที่ต้องการแสดง
      } catch (error) {
        console.error("Error fetching system:", error);
        // Handle error fetching Screen
      }
    },
    async goToScreensDetail(screenId) {
      await this.$router.push({ path: `/screens/${screenId}` });
    },

    async updateScreen() {
      try {
        const response = await fetch(
          `http://localhost:7777/screens/updateScreen/${this.editScreen.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editScreen),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update screen");
        }
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen updated successfully",
        });
        this.editScreenDialog = false;
        this.fetchScreens();
      } catch (error) {
        console.error("Error updating screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
        });
      }
    },
    goToScreensDetails(screen) {
      this.$router.push({
        path: `/Screen/${screen.id}`,
        params: { selectedScreen: screen },
      });
    },
    async goToHistoryScreens() {
      await this.fetchDeletedScreens();
      this.showHistoryDialog = true;
    },
    async fetchDeletedScreens() {
      try {
        const systemId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }
        const deletedScreens = await response.json();
        console.log(deletedScreens); // ตรวจสอบ deleted screens ที่ได้รับมา
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screens:", error);
        // Handle error fetching deleted screens
      }
    },
    openEditDialog(screen) {
      this.editScreen = { ...screen };
      this.editScreenDialog = true;
    },
    async softDeleteScreen(screen) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/screens/delete/${screen.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete screen");
          }

          console.log("Screen deleted successfully");

          await Swal.fire("Success", "Screen deleted successfully.", "success");

          this.fetchScreens();
        }
      } catch (error) {
        console.error("Error deleting screen:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the screen deletion process.",
          "error"
        );
      }
    },
    async goToCreateScreen() {
      // Open the create system dialog first
      this.createScreenDialog = true;
    },
    async saveEditedScreen() {
      try {
        const response = await fetch(
          `http://localhost:7777/screens/updateScreen/${this.editedScreen.screen_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              screen_id: this.editedScreen.screen_id,
              screen_name: this.editedScreen.screen_name,
              screen_level: this.editedScreen.screen_level,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update screen");
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "screen updated successfully",
        });

        this.$router.go();
      } catch (error) {
        console.error("Error updating screen:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
        });
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

    async restoreScreen(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore this screen.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore it!",
        });

        if (confirmResult.isConfirmed) {
          const screenId = item.id;
          const response = await fetch(
            `http://localhost:7777/screens/updateScreen/${screenId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                screen_name: item.screen_name,
                screen_id: item.screen_id,
                is_deleted: 0,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to restore screen");
          }

          console.log("Screeb restored successfully");

          await Swal.fire(
            "Success",
            "Screen restored successfully.",
            "success"
          );

          // เพิ่มบรรทัดนี้เพื่ออัพเดทตารางอัตโนมัติ
          this.fetchDeletedScreens();
        }
      } catch (error) {
        console.error("Error restoring screen:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the screen restoration process.",
          "error"
        );
      }
    },
    async confirmDeleteHistoryScreen(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });
        if (confirmResult.isConfirmed) {
          const screenId = item.id; // Get the ID of the system to delete
          const response = await fetch(
            `http://localhost:7777/screens/deleteHistoryScreens/${screenId}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) {
            throw new Error("Failed to delete screen");
          }
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System and related data deleted successfully",
          });
          this.fetchDeletedScreens(); // Refresh the deleted screen data
        }
      } catch (error) {
        console.error("Error confirming delete history screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete history screen",
        });
      }
    },

    async fetchDeletedScreens() {
      try {
        const systemId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }
        const deletedScreens = await response.json();
        console.log(deletedScreens); // ตรวจสอบ deleted Screens ที่ได้รับมา
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screen:", error);
        // Handle error fetching deleted screen
      }
    },

    async fetchScreens() {
      const systemId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screens");
        }

        const screens = await response.json();
        this.screens = screens;
        // ใช้ค่า id ของหน้าจอที่กำลังวน loop มาเพื่อกำหนดค่าให้กับ screenId
        if (screens.length > 0) {
          this.screenId = screens[0].id; // เลือกหน้าจอแรกในรายการเป็นตัวอย่าง
        }
      } catch (error) {
        console.error("Error fetching screens:", error);
      }
    },

    async editScreen(screen) {
      // Set the edited system to the selected system
      this.editedScreen = { ...screen };
      // Open the edit system dialog
      this.editScreenDialog = true;
    },
    async confirmDeleteScreen(screen) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
          showClass: {
            popup: "animate__animated animate__fadeInDown", // กำหนด animation เมื่อแสดง SweetAlert
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp", // กำหนด animation เมื่อซ่อน SweetAlert
          },
        });
        if (confirmResult.isConfirmed) {
          // If user confirms deletion, call deleteScreen method
          await this.deleteScreen(screen);
          // อัพเดทข้อมูลโดยอัตโนมัติหลังจากลบข้อมูล
          this.fetchScreens();
        }
      } catch (error) {
        console.error("Error confirming delete screen:", error);
      }
    },
    async deleteScreen(screen) {
      const screenId = screen.id;
      try {
        // Send a DELETE request to the API to delete the screen
        const response = await fetch(
          `http://localhost:7777/screens/delete/${screenId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete screen");
        }
        // If deletion is successful, show success message and update screen data
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen deleted successfully",
        });
        this.fetchDeletedScreens(); // Refresh the deleted screens data
      } catch (error) {
        console.error("Error deleting screen:", error);
        // If an error occurs during deletion, show error message
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete screen",
        });
      }
    },
  },
  computed: {
    filteredScreens() {
      return this.screens.filter((screen) => {
        const searchText = this.searchQuery.toLowerCase();
        return (
          screen.screen_id.toLowerCase().includes(searchText) ||
          screen.screen_name.toLowerCase().includes(searchText)
        );
      });
    },
  },
};
</script>

<style>
.full-width {
  display: flex;
  flex-wrap: wrap;
}
.custom-btn {
  width: 100%;
  height: 50%;
}
</style>