<template>
  <div>
    <div>
      <v-row style="margin-bottom: 20px" align="center">
        <!-- Card detel Systems -->
        <v-card class="mx-auto align-start" width="95%" hover>
          <v-card-item @click="showDetails = !showDetails">
            <v-card-title>
              System name : {{ system.system_nameEN }}
              <v-spacer></v-spacer>
              <v-icon @click.stop="showUserDialog = true">
                mdi-account-group</v-icon
              >
            </v-card-title>

            <v-card-subtitle>
              Systems Progress: {{ system.system_progress }}
              <v-progress-linear
                color="primary"
                height="50"
                :value="parseFloat(system.system_progress)"
                striped
              ></v-progress-linear>
            </v-card-subtitle>
          </v-card-item>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>System Manday: {{ system.system_manday || 0 }}</p>
                <p>Screen Count: {{ system.screen_count || 0 }}</p>
                <p>
                  System Plan Start:
                  {{ system.system_plan_start || "Not determined" }}
                </p>
                <p>
                  System Plan End:
                  {{ system.system_plan_end || "Not determined" }}
                </p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
        <!-- แสดงรายชื่อ USser Dialog -->
        <v-dialog v-model="showUserDialog" max-width="600">
          <v-card>
            <v-card-title>User Systems</v-card-title>
            <!-- เพิ่มช่องค้นหา -->
            <v-card-text>
              <v-text-field
                v-model="searchprojectUser"
                label="Search"
                dense
                hide-details
                solo
                flat
                outlined
                color="primary"
                hint="Search here"
              ></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(user, index) in filteredsearchprojectUser"
                  :key="index"
                >
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
              <v-pagination
                v-model="paginationPageUserSystems"
                :length="totalPagesUserSystems"
                @input="changePageUserSystems"
                color="primary"
              ></v-pagination>
            </v-card-text>
            <!-- เพิ่ม pagination -->
            <v-card-actions>
              <v-btn color="error" @click="showUserDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>

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
      <v-btn color="primary" @click="showSystemIdDialog"
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
            v-for="(screen, index) in paginatedScreens"
            :key="index"
          >
            <v-card class="mx-auto full-width" max-width="400">
              <v-img
                class="align-end text-white"
                height="200"
                :src="getBase64Image(screen.screen_pic)"
                cover
              >
                <v-card-title>
                  <div
                    style="
                      padding: 1.4px;
                      background-color: rgba(0, 0, 0, 0.4);
                      color: white;
                    "
                  >
                    {{ screen.screen_name }}
                  </div>
                </v-card-title>
              </v-img>

              <v-card-subtitle class="pt-4">
                <span style="font-weight: bold">Screen Name:</span>
                {{ screen.screen_name }}
              </v-card-subtitle>

              <v-card-text>
                <!-- <h1>screen ID: {{ screen.id }}</h1> -->
                <div><b>Due Date:</b> {{ screen.screen_plan_end }}</div>
                <div><b>Screen Level:</b> {{ screen.screen_level }}</div>
                <div><b>Progress:</b> {{ screen.screen_progress }}</div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  color="orange"
                  class="small"
                  @click="openEditDialog(screen)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn
                  color="orange"
                  class="small"
                  @click="confirmDeleteScreen(screen)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>

                <v-btn
                  color="orange"
                  class="small"
                  @click="
                    getUserScreenManagement(projectId, systemId, screen.id)
                  "
                >
                  <v-icon>mdi-account-multiple</v-icon>
                </v-btn>

                <v-btn class="small" @click="goToScreensDetail(screen.id)">
                  <v-icon>mdi-information</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- เพิ่ม Pagination ที่นี่ -->
      <v-pagination
        v-model="currentPage"
        :length="Math.ceil(filteredScreens.length / perPage)"
        @input="onPageChange"
      ></v-pagination>
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
          <v-form @submit.prevent="createScreen()">
            <!-- Existing fields -->
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
              :items="['Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>
            <v-file-input
              accept="image/png, image/jpeg, image/bmp"
              label="Select screen image"
              placeholder="Select screen image"
              prepend-icon="mdi-camera"
              v-model="avatarFile"
            ></v-file-input>

            <!-- New field for selecting users -->
            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('Implementer')"
              label="Select Implementer"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('Developer')"
              label="Select Developer"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('System Analyst')"
              label="Select System Analyst"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

            <!-- Buttons -->
            <v-btn type="submit">Create</v-btn>
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
              :items="['Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>
            <v-btn type="submit">Update</v-btn>
            <v-btn @click="editScreenDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog for displaying SystemId -->
    <v-dialog v-model="systemIdDialog" max-width="800">
      <v-card>
        <v-card-title>System ID: {{ systemId }}</v-card-title>
        <v-list>
          <v-list-item-group>
            <v-list-item v-for="(screen, index) in deletedScreens" :key="index">
              <v-list-item-content>
                <v-list-item-title>{{ screen.screen_id }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  screen.screen_name
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  screen.screen_plan_end
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  screen.screen_level
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-avatar>
                <v-img
                  :src="getBase64Image(screen.screen_pic)"
                  height="50"
                  contain
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-action>
                <v-btn icon @click="confirmDeleteScreenHistory(screen.id)">
                  <v-icon color="red darken-2">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="restoreScreen(screen.id)">
                  <v-icon color="green darken-2">mdi-restore</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-card-actions>
          <v-btn color="primary" @click="closeSystemIdDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Screen Managementdialog -->
    <v-dialog v-model="showUserManagementDialog" max-width="600">
      <v-card>
        <v-card-title> User Screen Management </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(user, index) in screenUsers" :key="user.id">
              <v-list-item-avatar>
                <v-img :src="user.user_pic" width="40" height="40"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ user.user_firstname }} {{ user.user_lastname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ user.user_position }} - {{ user.user_department }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <!-- ปุ่มลบ -->
              <v-list-item-action>
                <v-btn icon @click="deleteUser(user.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showUserManagementDialog = false"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="
              openAssignUserDialog(projectId, systemId, screenId), assignUser
            "
            >Assign User</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Assign Userdialog -->
    <v-dialog v-model="dialogVisible" max-width="400">
      <v-card>
        <v-card-title>Assign User</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedUsers"
            :items="implementers"
            label="Select Implementers"
            multiple
          ></v-select>
          <v-select
            v-model="selectedUsers"
            :items="developers"
            label="Select Developers"
            multiple
          ></v-select>
          <v-select
            v-model="selectedUsers"
            :items="systemAnalysts"
            label="Select System Analysts"
            multiple
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeAssignUserDialog">Close</v-btn>
          <v-btn color="primary" @click="assignUsersToScreen"
            >Assign User</v-btn
          >
        </v-card-actions>
      </v-card>
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
      implementers: [],
      developers: [],
      systemAnalysts: [],
      selectedUsers: [],
      dialogVisible: false,
      assignProjectId: "",
      assignSystemId: "",
      assignScreenId: "",
      screenId: null,
      screen: {},
      showAssignUserDialog: false,
      showUserManagementDialog: false,
      screenUsers: [],
      deletedScreensHeaders: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due Date", value: "screen_plan_end" },
        { text: "Screen Level", value: "screen_level" },
        // Add more headers as needed
      ],
      systemIdDialog: false,
      userText: "",
      selectedSystemId: null,
      avatarFile: null,
      userOptions: [{ text: "Position: Firstname Lastname", value: "user_id" }],
      perPage: 12,
      currentPage: 1,
      itemsPerPage: 12,
      projectUsers: [],
      showUserDialog: false,
      searchprojectUser: "",
      systemUsers: [],
      paginationPageUserSystems: 1,
      itemsPerPageUserSystems: 5, // จำนวนรายการผู้ใช้ต่อหน้า
      system: {},
      showDetails: false,
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
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
      headers: [],
    };
  },

  props: {
    systemId: {
      type: Number,
      default: null,
    },
    projectId: {
      type: Number,
      default: null,
    },
  },

  mounted() {
    this.fetchSystem();
    this.fetchScreens();
    this.fetchSystemNameENG();
    this.fetchSystemUsers(this.systemId, this.projectId);
  },
  methods: {
    changePageUserSystems(page) {
      this.paginationPageUserSystems = page;
    },
    deleteUser(userId) {
      const { systemId, projectId, screenId } = this; // สมมติว่าคุณมีตัวแปรเหล่านี้ใน Vue instance อยู่แล้ว
      try {
        fetch(
          `http://localhost:7777/user_screens/deleteUserScreen/${systemId}/${projectId}/${screenId}/${userId}`,
          {
            method: "DELETE",
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to delete user");
            }
            // ลบผู้ใช้ออกจากอาร์เรย์ screenUsers
            this.screenUsers = this.screenUsers.filter(
              (user) => user.id !== userId
            );
            console.log("User deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            // จัดการข้อผิดพลาดการลบผู้ใช้
          });
      } catch (error) {
        console.error("Error deleting user:", error);
        // จัดการข้อผิดพลาดการลบผู้ใช้
      }
    },
    async assignUsersToScreen() {
      const { assignProjectId, assignSystemId, assignScreenId, selectedUsers } =
        this;

      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/createUser_screen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: selectedUsers,
              screen_id: assignScreenId,
              system_id: assignSystemId,
              project_id: assignProjectId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to assign users to screen");
        }

        // ดำเนินการอื่นๆ หลังจากสำเร็จ

        // ปิด Dialog หลังจากทำงานเสร็จสิ้น
        this.closeAssignUserDialog();
      } catch (error) {
        console.error("Error assigning users to screen:", error);
        // จัดการข้อผิดพลาดที่เกิดขึ้น
      }
    },
    openAssignUserDialog(projectId, systemId, screenId) {
      // เรียกใช้งาน assignUser ที่นี่หลังจากกำหนดค่า projectId, systemId, screenId
      this.assignProjectId = projectId;
      this.assignSystemId = systemId;
      this.assignScreenId = screenId;
      this.fetchUsersNOTINScreen(); // เรียกใช้งาน assignUser ที่นี่
      this.dialogVisible = true;
    },
    closeAssignUserDialog() {
      this.dialogVisible = false;
    },
    async fetchUsersNOTINScreen() {
      const projectId = this.assignProjectId;
      const systemId = this.assignSystemId;
      const screenId = this.assignScreenId;
      console.log(screenId);
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersNOTINScreen/${projectId}/${systemId}/${screenId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users data");
        }

        const users = await response.json();

        // สร้าง options สำหรับ v-select แยกตามตำแหน่งผู้ใช้
        this.implementers = users
          .filter((user) => user.user_position === "Implementer")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));

        this.developers = users
          .filter((user) => user.user_position === "Developer")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));

        this.systemAnalysts = users
          .filter((user) => user.user_position === "System Analyst")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));
      } catch (error) {
        console.error("Error fetching users data:", error);
        // จัดการข้อผิดพลาดการดึงข้อมูลผู้ใช้
      }
    },
    async getUserScreenManagement(projectId, systemId, screenId) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${projectId}/${systemId}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();
        console.log(users); // ตรวจสอบข้อมูลผู้ใช้ที่ได้รับมา
        this.screenUsers = users; // เซ็ตค่าข้อมูลผู้ใช้ที่ดึงมาให้กับตัวแปร screenUsers
        this.showUserManagementDialog = true; // เปิด Dialog เมื่อข้อมูลถูกดึงมาสำเร็จ
        // ไม่เรียกใช้ this.assignUser(projectId, systemId, screenId);
        this.projectId = projectId; // ส่ง projectId ไปยังตัวแปรของคอมโพเนนต์
        this.systemId = systemId; // ส่ง systemId ไปยังตัวแปรของคอมโพเนนต์
        this.screenId = screenId; // ส่ง screenId ไปยังตัวแปรของคอมโพเนนต์
      } catch (error) {
        console.error("Error fetching user screen management data:", error);
        // Handle error fetching user screen management data
      }
    },

    async fetchDeletedScreensBySystemId() {
      try {
        const systemId = this.systemId; // Get the systemId from the props
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens by system ID");
        }
        const deletedScreens = await response.json();
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screens by system ID:", error);
      }
    },
    async showSystemIdDialog() {
      this.systemIdDialog = true;
      await this.fetchDeletedScreensBySystemId(); // Fetch deleted screens when opening the dialog
    },

    closeSystemIdDialog() {
      this.systemIdDialog = false;
    },
    filteredUsers(position) {
      return this.systemUsers.filter((user) => user.user_position === position);
    },
    async createScreen() {
      const systemId = this.$route.params.id;

      try {
        // Check if an avatar file is selected
        if (!this.avatarFile) {
          throw new Error("Please select an avatar file.");
        }

        // Convert image to Base64
        const base64Image = await this.imageToBase64(this.avatarFile);

        // Fetch system data to get project_id
        const systemResponse = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system data");
        }

        const systemData = await systemResponse.json();
        const projectId = systemData.project_id;

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
          assignedUsers: this.newScreen.selectedUsers, // Add selectedUsers to the
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

        // Check if the screen was created successfully
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
        this.fetchScreens();
        this.fetchSystemNameENG();
        this.fetchSystem();
      } catch (error) {
        console.error("Error creating screen", error);

        // Show error message using SweetAlert2
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.message || "Failed to create the screen. Please try again.",
          timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
        });
      }
    },

    async imageToBase64(imageFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Skip metadata and extract base64 data
          resolve(base64String);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(imageFile); // Read file as base64
      });
    },
    getBase64Image(base64Data) {
      return "data:image/jpeg;base64," + base64Data;
    },

    async sendAvatarDataToAPI(base64Data) {
      // Send the base64Data to your API
      // Example:
      try {
        const response = await fetch("YOUR_API_ENDPOINT", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar: base64Data }),
        });

        if (response.ok) {
          console.log("Avatar data sent successfully");
        } else {
          throw new Error("Failed to send avatar data");
        }
      } catch (error) {
        console.error("Error sending avatar data:", error);
      }
    },
    onPageChange(newPage) {
      this.currentPage = newPage;
    },
    async fetchSystemUsers(systemId, projectId) {
      try {
        // Check if systemId and projectId are not null
        if (systemId === null || projectId === null) {
          throw new Error("System ID or Project ID is null");
        }

        const response = await fetch(
          `http://localhost:7777/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system users");
        }
        const users = await response.json();
        this.systemUsers = users.map((user) => ({
          user_pic: user.user_pic,
          user_position: user.user_position,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname,
          user_department: user.user_department,
          id: user.id,
          userText: `${user.user_position}: ${user.user_firstname} ${user.user_lastname}`,
        }));
      } catch (error) {
        console.error("Error fetching system users:", error);
        this.systemUsers = [];
      }
    },

    async fetchSystem() {
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
        this.systemId = systemData.id;

        if (this.systemId !== null && this.projectId !== null) {
          const userOptions = await this.fetchSystemUsers(
            this.systemId,
            this.projectId
          );
          this.userOptions = userOptions;
        }
      } catch (error) {
        console.error("Error fetching system data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch system data. Please try again.",
          timer: 3000,
        });
      }
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
          const response = await fetch(
            `http://localhost:7777/screens/updateScreen/${item}`,
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
        }
        this.fetchDeletedScreens();
        this.fetchScreens();
      } catch (error) {
        console.error("Error restoring screen:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the screen restoration process.",
          "error"
        );
      }
    },
    async confirmDeleteScreenHistory(item) {
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
            `http://localhost:7777/screens/deleteHistoryScreen/${item}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete screen");
          }

          console.log("Screen deleted successfully");

          await Swal.fire("Success", "Screen deleted successfully.", "success");

          // Refresh the deleted screens data
          this.fetchDeletedScreens();
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
    filteredsearchprojectUser() {
      const startIndex =
        (this.paginationPageUserSystems - 1) * this.itemsPerPageUserSystems;
      const endIndex = startIndex + this.itemsPerPageUserSystems;
      return this.systemUsers
        .filter((user) => {
          return (
            user.user_firstname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_lastname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_position
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_department
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase())
          );
        })
        .slice(startIndex, endIndex);
    },
    totalPagesUserSystems() {
      return Math.ceil(
        this.systemUsers.filter((user) => {
          return (
            user.user_firstname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_lastname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_position
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_department
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase())
          );
        }).length / this.itemsPerPageUserSystems
      );
    },
    paginatedScreens() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredScreens.slice(startIndex, endIndex);
    },
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