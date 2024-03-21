<template>
  <!-- Systems Data Table container -->
  <div class="systems-data-table">
    <v-row style="margin-bottom: 20px" align="center">
      <!-- First v-card -->
      <v-col cols="6">
        <v-card class="mx-auto align-start" max-width="800" hover>
          <v-card-item @click="showDetails = !showDetails">
            <v-card-title>
              {{ project.project_name_ENG }}
            </v-card-title>
            <v-card-subtitle>
              Project Progress: {{ project.project_progress }}
              <v-progress-linear
                v-if="
                  project.project_progress !== null &&
                  project.project_progress !== undefined
                "
                color="deep-orange"
                height="10"
                :model-value="project.project_progress"
                striped
              ></v-progress-linear>
            </v-card-subtitle>
          </v-card-item>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>Project Manday: {{ project.project_manday }}</p>
                <p>System Count: {{ project.system_count }}</p>
                <p>Project Plan Start: {{ project.project_plan_start }}</p>
                <p>Project Plan End: {{ project.project_plan_end }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
      <!-- Second v-card -->
      <v-col cols="6">
        <v-btn class="custom-btn" @click="showUserDialog = true">
          แสดงรายชื่อคนภายในโปรเจค
        </v-btn>
        <v-dialog v-model="showUserDialog" max-width="600">
          <v-card>
            <v-card-title>รายชื่อคนภายในโปรเจค</v-card-title>
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

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredSystems"
      :items-per-page="5"
      class="elevation-1"
    >
      <!-- ส่วน Toolbar -->
      <template v-slot:top>
        <v-toolbar flat>
          <!-- ชื่อโปรเจค -->
          <v-toolbar-title>Systems Management</v-toolbar-title>
          <!-- ใช้ v-spacer เพื่อชิดปุ่มไปทางขวา -->
          <v-spacer></v-spacer>
          <!-- เพิ่มปุ่ม New System -->
          <v-btn color="primary" dark @click="goToCreateSystem"
            >New System</v-btn
          >
          <!-- เพิ่มปุ่ม Show History System -->
          <v-btn
            color="primary"
            dark
            @click="goToHistorySystems"
            style="margin-left: 10px"
            >Show History System</v-btn
          >
        </v-toolbar>
      </template>

      <!-- ส่วนแสดงข้อมูล -->
      <template v-slot:item="{ item }">
        <tr>
          <!-- แสดงข้อมูลต่าง ๆ -->
          <td>{{ item.system_id }}</td>
          <td>{{ item.system_nameTH }}</td>
          <td>{{ item.system_nameEN }}</td>
          <td>{{ item.system_shortname }}</td>
          <td>{{ item.screen_count ? item.screen_count : "0" }}</td>
          <td>{{ item.system_progress ? item.system_progress : "0" }}</td>
          <td>
            {{
              item.system_plan_start ? item.system_plan_start : "Not determined"
            }}
          </td>
          <td>
            {{ item.system_plan_end ? item.system_plan_end : "Not determined" }}
          </td>
          <td>{{ item.system_manday ? item.system_manday : "0" }}</td>
          <!-- เพิ่มปุ่ม manage user systems -->
          <td>
            <v-icon class="me-2" size="20" px @click="openEditDialog(item)"
              >mdi-pencil-circle</v-icon
            >
            <v-icon size="20" px @click="confirmDeleteSystem(item)"
              >mdi-delete-empty</v-icon
            >
            <v-btn @click="goToSystemsDetail(item.id)" style="margin-left: 10px"
              >Systems Detail</v-btn
            >
            <!-- เพิ่มปุ่ม manage user systems -->
            <v-btn @click="openManageUserDialog(item)"
              >Manage User Systems</v-btn
            >
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Create System Dialog -->
    <v-dialog
      v-model="createSystemDialog"
      max-width="600"
      ref="createSystemDialog"
    >
      <v-card>
        <v-card-title>Create New System</v-card-title>
        <v-card-text>
          <!-- Form to create new system -->
          <v-form @submit.prevent="createSystem">
            <v-text-field
              v-model="newSystem.system_id"
              label="System ID"
            ></v-text-field>
            <v-text-field
              v-model="newSystem.system_nameTH"
              label="System Name (TH)"
            ></v-text-field>
            <v-text-field
              v-model="newSystem.system_nameEN"
              label="System Name (EN)"
            ></v-text-field>
            <v-text-field
              v-model="newSystem.system_shortname"
              label="Short Name"
            ></v-text-field>

            <!-- Add v-select for selecting users -->
            <v-select
              v-model="selectedUser"
              :items="filteredUsers('Implementer')"
              label="Select Implementer"
              item-value="user_id"
              item-text="displayName"
              multiple
            ></v-select>

            <v-select
              v-model="selectedUser"
              :items="filteredUsers('Developer')"
              label="Select Developer"
              item-value="user_id"
              item-text="displayName"
              multiple
            ></v-select>

            <v-select
              v-model="selectedUser"
              :items="filteredUsers('System Analyst')"
              label="Select System Analyst"
              item-value="user_id"
              item-text="displayName"
              multiple
            ></v-select>

            <v-btn type="submit">Create</v-btn>
            <v-btn @click="createSystemDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit System Dialog -->
    <v-dialog v-model="editSystemDialog" max-width="600" ref="editSystemDialog">
      <v-card>
        <v-card-title>Edit System</v-card-title>
        <v-card-text>
          <!-- Form to edit system -->
          <v-form @submit.prevent="updateSystem">
            <v-text-field
              v-model="editedSystem.system_id"
              label="System ID"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="editedSystem.system_nameTH"
              label="System Name (TH)"
            ></v-text-field>
            <v-text-field
              v-model="editedSystem.system_nameEN"
              label="System Name (EN)"
            ></v-text-field>
            <v-text-field
              v-model="editedSystem.system_shortname"
              label="Short Name"
            ></v-text-field>

            <v-btn type="submit">Update</v-btn>
            <v-btn @click="editSystemDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Show deleted systems history -->
    <v-dialog v-model="showHistoryDialog" max-width="800">
      <v-data-table :headers="headers" :items="deletedSystems">
        <!-- Define headers for the table -->
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Deleted Systems History</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>

        <!-- Define actions for each row -->
        <template v-slot:item.actions="{ item }">
          <v-btn color="primary" @click="restoreSystem(item)"> Restore </v-btn>
          <v-btn color="error" @click="confirmDeleteHistorySystem(item)">
            Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-dialog>

    <!-- Dialog สำหรับการจัดการผู้ใช้ระบบ -->
    <v-dialog v-model="manageUserDialog" max-width="800px">
      <v-card>
        <v-card-title>Manage User Systems</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="search"
            label="Search"
            dense
            hide-details
            solo
            flat
          ></v-text-field>
          <v-data-table
            :headers="userSystemsHeaders"
            :items="users"
            :search="search"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.user_firstname }}</td>
                <td>{{ item.user_lastname }}</td>
                <td>{{ item.user_position }}</td>
                <td>
                  <v-img :src="item.user_pic" height="50" contain></v-img>
                </td>
                <td>
                  <!-- Add trash icon here -->
                  <v-icon
                    @click="
                      deleteUser(selectedSystemId, selectedProjectId, item.id)
                    "
                    >mdi-delete</v-icon
                  >
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="manageUserDialog = false"
            >Close</v-btn
          >
          <v-btn
            color="blue darken-1"
            text
            @click="openNestedDialog(selectedSystemId, selectedProjectId)"
            >Assign User</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- assing Userdialog -->
    <v-dialog v-model="assinguserDalog" max-width="500px">
      <v-card>
        <v-card-title>Assign User</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedUsers"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'Implementer'
              )
            "
            label="Select Implementer"
            item-text="displayName"
            item-value="id"
            multiple
          ></v-select>

          <v-select
            v-model="selectedUsers"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'Developer'
              )
            "
            label="Select Developer"
            item-text="displayName"
            item-value="id"
            multiple
          ></v-select>

          <v-select
            v-model="selectedUsers"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'System Analyst'
              )
            "
            label="Select System Analyst"
            item-text="displayName"
            item-value="id"
            multiple
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="assinguserDalog = false"
            >Close</v-btn
          >
          <v-btn color="blue darken-1" text @click="assignUser">Assign</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";

export default {
  name: "SystemsDataTable",
  layout: "admin",
  data() {
    return {
      selectedUsers: [], // เก็บผู้ใช้ที่ถูกเลือก
      availableUsers: [],
      assinguserDalog: false,
      selectedProjectId: null,
      users: [],
      system_id: "",
      userSystemsHeaders: [
        { text: "ID", value: "id" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position" },
        { text: "Picture", value: "user_pic" }, // เพิ่มหัวข้อ Picture ลงใน userProjectsHeaders
      ],
      search: "",
      manageUserDialog: false, // เพิ่มตัวแปร manageUserDialog
      selectedSystemId: "",
      selectedUser: null,
      showUserDialog: false,
      dropdown: false,
      projectUsers: [],
      showDetails: false,
      project: {},
      projectNameENG: "",
      showHistoryDialog: false,
      deletedSystems: [],
      createSystemDialog: false,
      editSystemDialog: false,
      newSystem: {
        system_id: "",
        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      editedSystem: {
        system_id: "",
        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      systems: [],
      searchQuery: "",
      headers: [
        { text: "System ID", value: "system_id" },
        { text: "System Name (TH)", value: "system_nameTH" },
        { text: "System Name (EN)", value: "system_nameEN" },
        { text: "Short Name", value: "system_shortname" },
        { text: "Screen Count", value: "screen_count" },
        { text: "System Progress (%)", value: "system_progress" },
        { text: "Planned Start", value: "system_plan_start" },
        { text: "Planned End", value: "system_plan_end" },
        { text: "Manday", value: "system_manday" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  methods: {
    filteredUsers(position) {
      return this.projectUsers
        .filter((user) => user.user_position === position)
        .map((user) => ({
          ...user,
          displayName: `${user.user_firstname} ${user.user_lastname}`,
        }));
    },
    async assignUser() {
      try {
        const { selectedUsers, selectedSystemId, selectedProjectId } = this;
        // เรียก API เพื่อสร้างการเชื่อมต่อระหว่างผู้ใช้และระบบ
        const response = await axios.post(
          `http://localhost:7777/user_systems/createUser_system`,
          {
            user_id: selectedUsers,
            system_id: selectedSystemId,
            project_id: selectedProjectId,
          }
        );
        console.log(response.data.message); // พิมพ์ข้อความจากการสร้างผู้ใช้ระบบใหม่
        // ปิด Dialog หลังจากที่สร้างผู้ใช้ระบบเรียบร้อย
        this.assinguserDalog = false;
        // สามารถดำเนินการอื่นๆ ตามต้องการ เช่น รีเฟรชรายการผู้ใช้หรืออื่นๆ
      } catch (error) {
        console.error("Error assigning user:", error);
        // จัดการข้อผิดพลาดหากมีปัญหาในการสร้างผู้ใช้ระบบ
      }
    },

    async fetchUsersBySystemAndProject(systemId, projectId) {
      try {
        const response = await axios.get(
          `http://localhost:7777/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        this.users = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    openManageUserDialog(item) {
      this.selectedSystemId = item.system_id; // เก็บรหัสระบบที่เลือก
      this.selectedProjectId = item.project_id; // เก็บรหัสโปรเจคที่เลือก
      this.manageUserDialog = true; // เปิด Dialog
      this.fetchUsersBySystemAndProject(item.system_id, item.project_id); // เรียกใช้งานฟังก์ชันโหลดข้อมูลผู้ใช้
    },

    async openNestedDialog(systemId, projectId) {
      try {
        // เรียก API เพื่อรับรายชื่อผู้ใช้ที่สามารถเลือกได้
        const response = await axios.get(
          `http://localhost:7777/user_systems/checkUsersInProjectSystem/${projectId}/${systemId}`
        );

        // เพิ่มข้อมูล user_position เข้าไปในชุดข้อมูล
        const usersWithDisplayName = response.data.map((user) => ({
          ...user,
          displayName: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
        }));

        // กำหนดข้อมูลผู้ใช้ใหม่ตามตำแหน่ง
        this.availableUsers = usersWithDisplayName;

        // เปิด Dialog
        this.assinguserDalog = true;
      } catch (error) {
        console.error(error);
      }
    },

    async deleteUser(systemId, projectId, userId) {
      try {
        const response = await axios.delete(
          `http://localhost:7777/user_systems/deleteUserSystem/${systemId}/${projectId}/${userId}`
        );

        // ตรวจสอบว่าคำขอ DELETE สำเร็จหรือไม่
        if (response.status === 200) {
          // ลบผู้ใช้ระบบจากตาราง users ใน Vue
          const index = this.users.findIndex((user) => user.id === userId);
          if (index !== -1) {
            this.users.splice(index, 1);
          }
          // แสดงข้อความเตือนว่าลบผู้ใช้ระบบสำเร็จ
        } else {
          // แสดงข้อความเตือนว่ามีข้อผิดพลาดในการลบผู้ใช้ระบบ
        }
      } catch (error) {
        // แสดงข้อความเตือนว่ามีข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์
        console.error("Error deleting user system:", error);
      }
    },

    goToCreateSystem() {
      // Open the create system dialog first
      this.createSystemDialog = true;
    },
    toggleDropdown() {
      this.dropdown = !this.dropdown;
    },
    async fetchProjectUsers() {
      const projectId = this.$route.params.id;
      try {
        const response = await axios.get(
          `http://localhost:7777/user_projects/getUserProjectsByProjectId/${projectId}`
        );
        this.projectUsers = response.data.map((user) => ({
          ...user,
          displayName: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
        }));
      } catch (error) {
        console.error(error);
      }
    },
    async goToSystemsDetail(systemId) {
      // Navigate to the Systems/_id.vue page with the systemId parameter
      await this.$router.push({ path: `/systems/${systemId}` });
    },
    async fetchProjectNameENG() {
      try {
        const projectId = this.$route.params.id;
        const response = await this.$axios.$get(
          `http://localhost:7777/projects/getOne/${projectId}`
        );
        this.project = response;
        this.projectNameENG = response.project_name_ENG;
      } catch (error) {
        console.error("Error fetching project:", error);
        // Handle error fetching project
      }
    },
    async restoreSystem(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore this system.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore it!",
        });

        if (confirmResult.isConfirmed) {
          const systemId = item.id;
          const response = await fetch(
            `http://localhost:7777/systems/updateSystem/${systemId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                system_nameTH: item.system_nameTH,
                system_nameEN: item.system_nameEN,
                system_shortname: item.system_shortname,
                project_id: item.project_id,
                is_deleted: 0,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to restore system");
          }

          console.log("System restored successfully");

          await Swal.fire(
            "Success",
            "System restored successfully.",
            "success"
          );

          // Add this line to update the table automatically
          this.fetchDeletedSystems();
        }
      } catch (error) {
        console.error("Error restoring system:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the system restoration process.",
          "error"
        );
      }
    },
    async confirmDeleteHistorySystem(item) {
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
          const systemId = item.id; // Get the ID of the system to delete
          const response = await fetch(
            `http://localhost:7777/systems/deleteHistorySystems/${systemId}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) {
            throw new Error("Failed to delete system");
          }
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System and related data deleted successfully",
          });
          this.fetchDeletedSystems(); // Refresh the deleted systems data
        }
      } catch (error) {
        console.error("Error confirming delete history system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete history system",
        });
      }
    },
    async goToHistorySystems() {
      await this.fetchDeletedSystems();
      this.showHistoryDialog = true;
    },
    async fetchDeletedSystems() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/searchByProjectId_delete/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted systems");
        }
        const deletedSystems = await response.json();
        console.log(deletedSystems); // Check the received deleted systems
        this.deletedSystems = deletedSystems;
      } catch (error) {
        console.error("Error fetching deleted systems:", error);
        // Handle error fetching deleted systems
      }
    },
    async createSystem() {
      const projectId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/systems/createSystem`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              project_id: projectId,
              ...this.newSystem,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to create system");
        }

        // Extract system_id from response data
        const responseData = await response.json();
        const system_id = responseData.system_id; // ใช้ system_id ที่ได้รับจากการสร้างระบบ

        // Send selected users to the server
        const userResponse = await fetch(
          `http://localhost:7777/user_systems/createUser_system`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: this.selectedUser,
              system_id: system_id, // ใส่ system_id ที่ได้รับจากการสร้างระบบ
              project_id: projectId,
            }),
          }
        );
        if (!userResponse.ok) {
          throw new Error("Failed to assign users to the system");
        }

        // Clear the form and show success message
        this.newSystem = {
          system_id: "",
          system_nameTH: "",
          system_nameEN: "",
          system_shortname: "",
        };
        const confirmResult = await Swal.fire({
          icon: "success",
          title: "Success",
          text: "New system and users assigned successfully",
          showConfirmButton: true,
          allowOutsideClick: false,
        });
        if (confirmResult.isConfirmed) {
          this.fetchSystems();
        }
      } catch (error) {
        console.error("Error creating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create system",
        });
      }
    },

    async updateSystem() {
      try {
        const response = await fetch(
          `http://localhost:7777/systems/updateSystem/${this.editedSystem.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editedSystem),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update system");
        }
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "System updated successfully",
        });
        this.editSystemDialog = false;
        this.fetchSystems();
      } catch (error) {
        console.error("Error updating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update system",
        });
      }
    },
    async confirmDeleteSystem(item) {
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
            `http://localhost:7777/systems/delete/${item.id}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) {
            throw new Error("Failed to delete system");
          }
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System deleted successfully",
          });
          this.fetchSystems();
        }
      } catch (error) {
        console.error("Error confirming delete system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete system",
        });
      }
    },
    async openEditDialog(item) {
      this.editedSystem = { ...item };
      this.editSystemDialog = true;
    },
    async fetchSystems() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/searchByProjectId/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch systems");
        }
        const systems = await response.json();
        this.systems = systems;
      } catch (error) {
        console.error("Error fetching systems:", error);
        // Handle error fetching systems
      }
    },
    filterSystems() {
      const query = this.searchQuery.toLowerCase();
      return this.systems.filter(
        (system) =>
          system.system_id.toLowerCase().includes(query) ||
          system.system_nameTH.toLowerCase().includes(query) ||
          system.system_nameEN.toLowerCase().includes(query) ||
          system.system_shortname.toLowerCase().includes(query)
      );
    },
  },
  computed: {
    filteredSystems() {
      return this.filterSystems();
    },
  },
  watch: {
    $route(to, from) {
      this.fetchProjectNameENG();
      this.fetchProjectUsers();
      this.fetchSystems();
    },
  },
  created() {
    this.fetchProjectNameENG();
    this.fetchProjectUsers();
    this.fetchSystems();
  },
};
</script>


<style scoped>
.v-data-table > .v-data-footer {
  padding-top: 0;
}

.systems-data-table .v-progress-linear__background {
  background-color: rgba(0, 0, 0, 0.1);
}

.custom-btn {
  width: 100%;
  height: 50%;
}
</style>
